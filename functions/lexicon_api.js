/**
 * lexicon_api.js — Smart Lexicon Engine API
 * MilEd.One v9.6.9
 *
 * Routes:
 *   GET  /api/lexicon/list         — Public: read lexicon catalog
 *   POST /api/lexicon/personalize  — AI curates study set from student familiarity ratings
 *   POST /api/lexicon/submit       — Saves handwriting submission (sentence + photo ref)
 *   POST /api/lexicon/ingest       — Admin: AI enrichment preview (no Firebase write, superadmin auth required)
 *   POST /api/lexicon/add-word     — Admin: add word to lexicon (superadmin auth required)
 *   POST /api/lexicon/delete-word  — Admin: delete word (superadmin auth required)
 *   POST /api/lexicon/bulk-import  — Admin: batch ingest with dedup (superadmin auth required)
 *
 * FIREBASE PATHS:
 *   /lexicon/{wordId}                              — word definitions (public read)
 *   /lexicon_submissions/{studentId}/{wordId}      — handwriting submissions
 *   /lexicon_ratings/{studentId}/{wordId}          — familiarity ratings (server-persisted copy)
 *
 * SCHEMA v9.6.9 — 10-field trilingual format:
 *   word, preposition, root, meaning, example, field, difficulty_level,
 *   arabic_word, arabic_meaning, english_word  (+optional: english_meaning)
 * Field: "management" | "optics" | "social"
 * Difficulty: 1 (basic) | 2 (intermediate) | 3 (advanced)
 */

import crypto from "crypto";
import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const MODEL              = "google/gemini-2.0-flash-001";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

async function authenticate(username, password) {
  const snap = await getDB().ref(`admin/auth/${username}`).get();
  if (!snap.exists()) return null;
  const r = snap.val();
  if (r.password !== password || r.role !== "superadmin") return null;
  return r;
}

async function callAI(system, user, maxTokens = 1500) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens,
      temperature: 0.3
    })
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content?.trim() || "";
}

const FIELD_LABELS = { management: "ניהול", optics: "אופטיקה", social: "רווחה חברתית" };
const DIFF_LABELS  = { 1: "בסיסי", 2: "ביניים", 3: "מתקדם" };

function serializeLexiconSnapshot(snapshotValue) {
  if (!snapshotValue || typeof snapshotValue !== "object") return [];
  return Object.entries(snapshotValue).map(([id, word]) => ({ id, ...word }));
}

async function handleList() {
  const snap = await getDB().ref("lexicon").get();
  const words = serializeLexiconSnapshot(snap.exists() ? snap.val() : null);
  return { statusCode: 200, body: JSON.stringify({ ok: true, words }) };
}

// ─── PERSONALIZE ───
async function handlePersonalize(body) {
  const { studentId, ratings } = body;
  if (!studentId || !ratings || typeof ratings !== "object")
    return { statusCode: 400, body: JSON.stringify({ error: "studentId and ratings are required" }) };

  // Load all words from Firebase
  const snap = await getDB().ref("lexicon").get();
  if (!snap.exists() || !snap.val())
    return { statusCode: 200, body: JSON.stringify({ ok: true, studySet: [], message: "הלקסיקון ריק — בקש ממנהל המערכת להוסיף מילים." }) };

  const allWords = Object.entries(snap.val()).map(([id, w]) => ({ id, ...w }));

  // Compute priority score: low familiarity + high difficulty = highest priority
  const scored = allWords.map(w => {
    const fam = ratings[w.id] || 1; // 1 = unknown, 5 = mastered
    const diff = w.difficulty_level || 1;
    const score = (6 - fam) * 2 + diff; // max: 5*2+3=13, min: 0*2+1=1
    return { ...w, familiarity: fam, priorityScore: score };
  });
  scored.sort((a, b) => b.priorityScore - a.priorityScore);

  // Take top 10 (max), ensure field diversity
  const selected = [];
  const fieldCount = {};
  for (const w of scored) {
    if (selected.length >= 10) break;
    fieldCount[w.field] = (fieldCount[w.field] || 0);
    if (fieldCount[w.field] < 4) { // max 4 per field
      selected.push(w);
      fieldCount[w.field]++;
    }
  }
  if (selected.length < 3 && scored.length >= 3) {
    // Fallback: just take top 10 regardless of field
    selected.length = 0;
    selected.push(...scored.slice(0, 10));
  }

  // Save rating snapshot to Firebase
  const ratingUpdates = {};
  Object.entries(ratings).forEach(([wordId, fam]) => {
    ratingUpdates[`lexicon_ratings/${studentId}/${wordId}`] = { familiarity: fam, ratedAt: Date.now() };
  });
  await getDB().ref().update(ratingUpdates);

  // AI generates study tips for each selected word
  const system = `You are a Hebrew vocabulary pedagogy expert for Israeli college students.
Your task: given a curated set of academic vocabulary words, generate a short STUDY TIP for each.

The study tip should:
1. Connect the word to a real-world scenario from its field (management/optics/social work)
2. Provide a memorable hook (etymology, contrast with a common word, or visual metaphor)
3. Be in Hebrew, max 25 words per tip

Respond ONLY with a valid JSON array:
[{ "id": "wordId", "studyTip": "tip in Hebrew" }, ...]`;

  const wordList = selected.map(w =>
    `ID: ${w.id} | מילה: ${w.word} | תחום: ${FIELD_LABELS[w.field] || w.field} | רמה: ${w.difficulty_level}`
  ).join("\n");

  let tips = {};
  try {
    const raw = await callAI(system, wordList);
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      parsed.forEach(t => { tips[t.id] = t.studyTip; });
    }
  } catch { /* tips remain empty — non-fatal */ }

  // AI generates a personalized curation message
  const unknownCount = scored.filter(w => (ratings[w.id] || 1) <= 2).length;
  const masteredCount = scored.filter(w => (ratings[w.id] || 1) === 5).length;

  const message = unknownCount > 6
    ? `זיהיתי ${unknownCount} מילים לא מוכרות — מיקדתי בהן את הרשימה. קחי צעד אחד בכל פעם 💪`
    : masteredCount > scored.length * 0.6
      ? `שולטת ברוב המילים! בחרתי את ${selected.length} שהכי ישדרגו את הכתיבה האקדמית שלך.`
      : `בחרתי ${selected.length} מילים שמשלבות עמקות וגיוון בין התחומים. כל אחת ממוקמת לפי רמת ההכרות שלך.`;

  const studySet = selected.map(w => ({
    id: w.id,
    word: w.word,
    meaning: w.meaning,
    example: w.example,
    field: w.field,
    fieldHe: FIELD_LABELS[w.field] || w.field,
    difficulty_level: w.difficulty_level,
    difficultyHe: DIFF_LABELS[w.difficulty_level] || "",
    familiarity: w.familiarity,
    priorityScore: w.priorityScore,
    studyTip: tips[w.id] || null
  }));

  return { statusCode: 200, body: JSON.stringify({ ok: true, studySet, message }) };
}

// ─── SUBMIT (handwriting) ───
async function handleSubmit(body) {
  const { studentId, wordId, sentence, imageData } = body;
  if (!studentId || !wordId)
    return { statusCode: 400, body: JSON.stringify({ error: "studentId and wordId are required" }) };
  if (!sentence?.trim() && !imageData)
    return { statusCode: 400, body: JSON.stringify({ error: "sentence or imageData required" }) };

  const submissionId = crypto.randomBytes(4).toString("hex");
  const record = {
    submissionId,
    wordId,
    sentence: sentence?.trim() || null,
    hasImage: !!imageData,
    // Store compressed image ref only — full base64 stored client-side for bandwidth
    imageSizeKB: imageData ? Math.round(imageData.length * 0.75 / 1024) : 0,
    submittedAt: Date.now()
  };

  // If image is small enough (< 150KB encoded), store in RTDB; otherwise just note it was submitted
  if (imageData && imageData.length < 200000) {
    record.imageData = imageData;
  } else if (imageData) {
    record.imageNote = "תמונה הוגשה (גדולה מדי לשמירה מלאה)";
  }

  await getDB().ref(`lexicon_submissions/${studentId}/${wordId}`).set(record);

  // Award XP signal
  const xpEarned = sentence?.trim() ? 8 : 5;
  return { statusCode: 200, body: JSON.stringify({ ok: true, submissionId, xpEarned }) };
}

// ─── Shared word record builder (v9.6.9 schema) ───
function buildWordRecord(w, wordId, createdBy, now) {
  return {
    wordId,
    // Core Hebrew
    word:            w.word?.trim()           || "",
    preposition:     w.preposition?.trim()    || null,
    root:            w.root?.trim()           || null,
    meaning:         w.meaning?.trim()        || "",
    example:         w.example?.trim()        || null,
    // Classification
    field:           ["management","optics","social"].includes(w.field) ? w.field : "management",
    difficulty_level: Math.max(1, Math.min(3, parseInt(w.difficulty_level) || 1)),
    // Arabic translation
    arabic_word:     w.arabic_word?.trim()    || null,
    arabic_meaning:  w.arabic_meaning?.trim() || null,
    // English translation
    english_word:    w.english_word?.trim()   || null,
    english_meaning: w.english_meaning?.trim()|| null,
    // Handwriting task — AI-generated or auto-fallback from word + preposition
    handwriting_task: w.handwriting_task?.trim() || (() => {
      const hw = w.word?.trim() || "";
      const prep = w.preposition?.trim();
      return prep ? `כתבי משפט בו תשתמשי ב"${hw} ${prep}"` : `כתבי משפט בו תשתמשי ב"${hw}"`;
    })(),
    // Metadata
    createdAt: now,
    createdBy
  };
}

// ─── INGEST (AI enrichment — preview only, no Firebase write) ───
async function handleIngest(body) {
  const { word, meaning, field, difficulty_level, requesterUsername, requesterPassword } = body;
  if (!word?.trim() || !meaning?.trim())
    return { statusCode: 400, body: JSON.stringify({ error: "word and meaning are required" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  const system = `You are a Hebrew linguistics expert specializing in Israeli academic vocabulary.
Given a Hebrew academic word and its meaning, generate a full linguistic profile.

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "preposition": "the most common preposition that follows this verb/adjective (e.g. 'ב-', 'את', 'ל-', or null if not applicable)",
  "root": "3-4 letter Hebrew root (shoresh) in the format פ.ע.ל (e.g. 'מ.ר.כ.ז') or null",
  "example": "one natural academic sentence in Hebrew using this word (20-30 words)",
  "arabic_word": "the Arabic translation of the Hebrew word (Modern Standard Arabic)",
  "arabic_meaning": "the Arabic translation of the meaning (1-2 sentences, Modern Standard Arabic)",
  "english_word": "the English translation of the Hebrew word (1-3 words)",
  "english_meaning": "the English translation of the meaning (1-2 sentences)",
  "handwriting_task": "a short Hebrew instruction for a handwriting exercise using the word + preposition (e.g. 'כתבי משפט המשתמש ב-להתמקד ב-'). 15 words max."
}`;

  const userMsg = `מילה: ${word.trim()}\nמשמעות: ${meaning.trim()}\nתחום: ${FIELD_LABELS[field] || field || "כללי"}\nרמה: ${difficulty_level || 1}`;

  let preview = {};
  try {
    const raw = await callAI(system, userMsg, 800);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) preview = JSON.parse(match[0]);
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "AI enrichment failed: " + e.message }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      preview: {
        word:            word.trim(),
        meaning:         meaning.trim(),
        field:           ["management","optics","social"].includes(field) ? field : "management",
        difficulty_level: Math.max(1, Math.min(3, parseInt(difficulty_level) || 1)),
        preposition:     preview.preposition   || null,
        root:            preview.root          || null,
        example:         preview.example       || null,
        arabic_word:     preview.arabic_word   || null,
        arabic_meaning:  preview.arabic_meaning|| null,
        english_word:    preview.english_word  || null,
        english_meaning: preview.english_meaning || null,
        handwriting_task: preview.handwriting_task || null
      }
    })
  };
}

// ─── ADD WORD (admin) ───
async function handleAddWord(body) {
  const { word, meaning, field, requesterUsername, requesterPassword } = body;
  if (!word?.trim() || !meaning?.trim() || !field)
    return { statusCode: 400, body: JSON.stringify({ error: "word, meaning, and field are required" }) };
  if (!["management","optics","social"].includes(field))
    return { statusCode: 400, body: JSON.stringify({ error: "field must be management | optics | social" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  const wordId = "w_" + crypto.randomBytes(5).toString("hex");
  await getDB().ref(`lexicon/${wordId}`).set(buildWordRecord(body, wordId, requesterUsername, Date.now()));

  return { statusCode: 200, body: JSON.stringify({ ok: true, wordId }) };
}

// ─── BULK IMPORT (admin) ───
async function handleBulkImport(body) {
  const { words, requesterUsername, requesterPassword, onConflict = "skip" } = body;
  if (!Array.isArray(words) || !words.length)
    return { statusCode: 400, body: JSON.stringify({ error: "words array is required" }) };
  if (words.length > 500)
    return { statusCode: 400, body: JSON.stringify({ error: "maximum 500 words per batch" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  // Load existing words → dedup set (normalized lowercase)
  const snap = await getDB().ref("lexicon").get();
  const existingKeys = new Set();
  if (snap.exists() && snap.val()) {
    Object.values(snap.val()).forEach(w => {
      if (w.word) existingKeys.add(w.word.trim().toLowerCase());
    });
  }

  const now  = Date.now();
  const writes   = {};
  const skippedWords = [];
  const errorRows    = [];
  let added = 0, skipped = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!w.word?.trim() || !w.meaning?.trim()) {
      errorRows.push({ row: i + 1, issue: "missing word or meaning", data: String(w.word || "") });
      continue;
    }

    const normalKey = w.word.trim().toLowerCase();
    if (existingKeys.has(normalKey) && onConflict === "skip") {
      skipped++;
      skippedWords.push(w.word.trim());
      continue;
    }

    const wordId = "w_" + crypto.randomBytes(5).toString("hex");
    writes[`lexicon/${wordId}`] = buildWordRecord(w, wordId, requesterUsername, now);
    existingKeys.add(normalKey); // prevent intra-batch duplicates
    added++;
  }

  if (Object.keys(writes).length > 0) {
    // Firebase update() has a 32MB limit — safe for ≤500 words
    await getDB().ref().update(writes);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, added, skipped, skippedWords, errorRows })
  };
}

// ─── DELETE WORD (admin) ───
async function handleDeleteWord(body) {
  const { wordId, requesterUsername, requesterPassword } = body;
  if (!wordId) return { statusCode: 400, body: JSON.stringify({ error: "wordId required" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  await getDB().ref(`lexicon/${wordId}`).remove();
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}

// ─── Entry point ───
export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers };

  const action = event.path.split("/").filter(Boolean).at(-1);
  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}

  try {
    let result;
    switch (action) {
      case "list":         result = await handleList();             break;
      case "personalize":  result = await handlePersonalize(body);  break;
      case "submit":       result = await handleSubmit(body);       break;
      case "ingest":       result = await handleIngest(body);       break;
      case "add-word":     result = await handleAddWord(body);      break;
      case "delete-word":  result = await handleDeleteWord(body);   break;
      case "bulk-import":  result = await handleBulkImport(body);   break;
      default:
        return { statusCode: 404, headers,
          body: JSON.stringify({ error: "Unknown route", valid: ["/list","/personalize","/submit","/add-word","/delete-word","/bulk-import"] }) };
    }
    return { ...result, headers };
  } catch (e) {
    console.error("LEXICON_API:", e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}

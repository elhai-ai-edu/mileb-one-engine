/**
 * text_puzzle_api.js — Text Puzzle (פאזל טקסט) Engine API
 * MilEd.One v9.5.0
 *
 * Routes:
 *   POST /api/text-puzzle/parse   — AI analyzes text → blocks with rhetorical roles
 *   POST /api/text-puzzle/hint    — Socratic Paraphrase Coach guiding question (never reveals answer)
 *   POST /api/text-puzzle/reflect — Evaluates student reflection, signals XP
 *   POST /api/text-puzzle/save    — Saves puzzle to Firebase (superadmin auth required)
 *
 * FIREBASE PATHS:
 *   puzzles/{puzzleId}            — full puzzle definition (blocks, level, typicalErrors)
 *
 * KB AUTHORITY: puzzles_kb.json — canonical rhetorical roles, Error Bank, Connector Logic,
 *               Arabic transfer-error patterns. All role names and error IDs in this file
 *               MUST match puzzles_kb.json xray_taxonomy and typical_errors sections.
 *
 * PEDAGOGICAL AUTHORITY: docs/MASTER_LOGIC.md — 8-Layer SP, OPAL tools, Phase enforcement
 */

import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const MODEL              = "google/gemini-2.0-flash-001";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

// ─── Firebase ───
function getDB() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa), databaseURL: process.env.FIREBASE_DB_URL });
  }
  return getDatabase();
}

async function authenticate(username, password) {
  const snap = await getDB().ref(`admin/auth/${username}`).get();
  if (!snap.exists()) return null;
  const r = snap.val();
  if (r.password !== password || r.role !== "superadmin") return null;
  return r;
}

// ─── AI call ───
async function callAI(system, user, maxTokens = 2000) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens,
      temperature: 0.25
    })
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content?.trim() || "";
}

// ─── Level config — canonical taxonomy from puzzles_kb.json xray_taxonomy + puzzle_levels ───
// Role IDs here MUST match puzzles_kb.json → rhetorical_roles.puzzle_levels.*
const LEVEL_CONFIG = {
  macro: {
    he: "מאקרו — פסקאות",
    desc: "Reordering essay paragraphs by argumentative logic",
    splitUnit: "paragraphs",
    roles: ["מבוא","טענה מרכזית","טיעון","ראיה","פרכה","הסתייגות","מעבר","מסקנה"],
    roleColors: { "מבוא":"#4338ca","טענה מרכזית":"#7c3aed","טיעון":"#6d28d9","ראיה":"#0891b2","פרכה":"#dc2626","הסתייגות":"#64748b","מעבר":"#f59e0b","מסקנה":"#16a34a" },
    typicalErrors: [
      "הצבת ראיה לפני הטענה שהיא מבססת",
      "מסקנה לפני הטיעונים התומכים בה",
      "פרכה ללא הכנה טיעונית מספקת",
      "היעדר מבוא מכין — קפיצה ישירה לטיעון",
      "חוסר קוהרנטיות בין טיעון לביסוסו"
    ]
  },
  mid: {
    he: "מיד — משפטים",
    desc: "Building a paragraph using connector logic",
    splitUnit: "sentences",
    roles: ["פתיחת פסקה","ראיה","פרשנות","מחבר לוגי","הסתייגות","דוגמה","הפניה","סיכום"],
    roleColors: { "פתיחת פסקה":"#4338ca","ראיה":"#0891b2","פרשנות":"#7c3aed","מחבר לוגי":"#f59e0b","הסתייגות":"#64748b","דוגמה":"#0e7490","הפניה":"#9333ea","סיכום":"#16a34a" },
    typicalErrors: [
      "מחבר לוגי (לכן / עם זאת) בלי שני הצדדים הנדרשים",
      "דוגמה לפני הטענה שהיא ממחישה",
      "ראיה ללא פרשנות מקשרת",
      "הסתייגות המפריעה לזרימת הטיעון",
      "סיכום לפני ביסוס מלא"
    ]
  },
  micro: {
    he: "מיקרו — מילים",
    desc: "Constructing a sentence (Lexical/Grammar)",
    splitUnit: "words or minimal phrases",
    roles: ["נושא","פועל","מושא","הקשר","מחבר","מרחב","תנאי","זמן"],
    roleColors: { "נושא":"#4338ca","פועל":"#dc2626","מושא":"#0891b2","הקשר":"#9333ea","מחבר":"#f59e0b","מרחב":"#6d28d9","תנאי":"#64748b","זמן":"#16a34a" },
    typicalErrors: [
      "פועל לפני הנושא (בניגוד לסדר המובנה)",
      "מחבר ללא שני הצדדים הנדרשים",
      "הקשר המפריד בין נושא לפועל",
      "מרחב (תואר הפועל) ממוקם שגוי",
      "תנאי ממוקם בסוף המשפט במקום בתחילתו"
    ]
  }
};

// ─── Arabic Transfer-Error Awareness (puzzles_kb.json → connector_logic.arabic_transfer_errors) ───
// Injected into the Paraphrase Coach hint SP when connector errors are detected.
const ARABIC_CONNECTOR_NOTES = `
ARABIC SPEAKER CONNECTOR AWARENESS (from puzzles_kb.json):
You are coaching students many of whom are native Arabic speakers. When connector logic errors appear,
apply these pedagogical notes — always as a Socratic question, NEVER as a statement of the answer:

• Contrast (ניגוד): Arabic speakers often transfer 'لكن' → 'אבל' (colloquial).
  Academic target: 'עם זאת' / 'לעומת זאת'.
  Hint direction: Ask why formal written Hebrew prefers a different word for contrast.

• Addition (הוספה): Arabic 'أيضا / وكذلك' → colloquial 'גם'.
  Academic target: 'בנוסף לכך' / 'יתרה מכך' / 'כמו כן'.
  Hint direction: Ask what addition word fits an academic essay versus a conversation.

• Cause (סיבה): Arabic syntax puts effect before cause (result + لأن + cause).
  Academic Hebrew can do both but formal preference is cause-first or clear connector.
  Hint direction: Ask which clause is the cause and which is the effect — is the order logical?

• Result (תוצאה): Arabic 'إذن / فـ' → colloquial 'אז'.
  Academic target: 'לפיכך' / 'על כן' / 'כתוצאה מכך'.
  Hint direction: Ask what formal result-marker would sound right in a published article.

• Sequence (רצף): Arabic 'وبعد ذلك / ثم' → colloquial 'ואז / ואחרי זה'.
  Academic target: 'לאחר מכן' / 'בשלב הבא'.
  Hint direction: Ask how a scholar would express temporal sequence in a formal text.

Use these notes to calibrate hint specificity — but NEVER quote the Arabic in your response to the student.
All responses to students must be in Hebrew only.`;

// ─── PARSE ───
async function handleParse(body) {
  const { text, level, requesterUsername, requesterPassword } = body;
  if (!text?.trim() || !level)
    return { statusCode: 400, body: JSON.stringify({ error: "text and level are required" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  const lc = LEVEL_CONFIG[level];
  if (!lc) return { statusCode: 400, body: JSON.stringify({ error: "level must be macro | mid | micro" }) };

  const system = `You are the MilEd.One Paraphrase Coach — a Hebrew pedagogical text analyzer.
Task: Analyze the given Hebrew (or Hebrew/English mixed) academic text and split it into blocks
at the ${lc.splitUnit} level, then assign a canonical rhetorical role to each block.

ROLE TAXONOMY (from puzzles_kb.json — use EXACTLY these Hebrew labels, no others):
${lc.roles.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Color map for roles:
${Object.entries(lc.roleColors).map(([r,c]) => `${r} → ${c}`).join("\n")}

Respond ONLY with a valid JSON array — no markdown fences, no explanation:
[
  {
    "content": "exact verbatim text of this block",
    "role": "one of the canonical Hebrew roles listed above",
    "roleColor": "hex color from the map above"
  },
  ...
]

Rules:
- Preserve EXACT original wording — never paraphrase or alter
- Split at natural boundaries (\\n\\n for macro, punctuation [.?!] for mid, word/phrase for micro)
- Every block MUST have a role from the canonical taxonomy above — never invent new role names
- Output blocks in their CORRECT logical order (as they appear in the text)
- Minimum 3 blocks, maximum 20 blocks
- For micro level: each block is 1–4 words max
- Role assignment priority: prefer the most specific role; use הסתייגות only when hedging is explicit`;

  const raw = await callAI(system, `Level: ${level}\n\nText:\n${text}`);

  let blocks;
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("no array found");
    blocks = JSON.parse(match[0]);
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: "AI parsing failed — try rephrasing the text", raw: raw.slice(0, 300) }) };
  }

  const numbered = blocks
    .filter(b => b.content?.trim())
    .map((b, i) => ({
      id: `b${i + 1}`,
      content: b.content.trim(),
      role: b.role || lc.roles[0],
      roleColor: b.roleColor || "#6366f1",
      order: i
    }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      blocks: numbered,
      level,
      levelHe: lc.he,
      typicalErrors: lc.typicalErrors
    })
  };
}

// ─── HINT ───
async function handleHint(body) {
  const { blocks, currentOrder, correctOrder, level, hintCount } = body;
  if (!blocks || !currentOrder || !correctOrder)
    return { statusCode: 400, body: JSON.stringify({ error: "blocks, currentOrder and correctOrder required" }) };

  const lc = LEVEL_CONFIG[level] || LEVEL_CONFIG.mid;

  // Identify first misplaced block
  const firstWrongIdx = currentOrder.findIndex((id, i) => id !== correctOrder[i]);
  if (firstWrongIdx === -1)
    return { statusCode: 200, body: JSON.stringify({ ok: true, question: "כל הכבוד — הפאזל פתור! 🎉" }) };

  const wrongId   = currentOrder[firstWrongIdx];
  const wrongBlock = blocks.find(b => b.id === wrongId);
  const errorType  = lc.typicalErrors[Math.min(hintCount, lc.typicalErrors.length - 1)];

  const system = `You are the MilEd.One Paraphrase Coach — a Socratic pedagogy tutor specializing
in academic Hebrew writing for Israeli college students.
A student is rearranging ${lc.splitUnit} to reconstruct an academic text.

YOUR PERSONA:
- Warm, curious, patient — like a skilled writing tutor in a one-on-one session
- You know the Paraphrase Bot KB deeply: rhetorical roles, connector logic, Error Bank
- You understand how connector logic works differently in Hebrew vs. Arabic

YOUR LAWS (violating any is a critical failure):
1. NEVER reveal the correct position number
2. NEVER say "this block belongs before/after X"
3. NEVER give the answer — only ask ONE guiding question
4. Respond ONLY in Hebrew (regardless of student's background)
5. Be warm, curious, never judgmental
6. Reference the block's rhetorical role (from KB taxonomy) and its logical function
7. Hint ${hintCount + 1}: ${hintCount >= 2 ? "be more specific about the KB role/connector logic (but STILL no direct answer)" : "broad Socratic nudge about logical flow"}
8. If the error involves a connector word (מחבר לוגי), apply your knowledge of Hebrew academic
   connectors vs. colloquial usage — ask a question that guides toward the correct register

KB RHETORICAL ROLES for this level: ${lc.roles.join(", ")}
Typical error pattern for this level: "${errorType}"
${ARABIC_CONNECTOR_NOTES}`;

  const user = `Student arrangement problem:
Block in question: "${wrongBlock?.content || '?'}"
Its rhetorical role: "${wrongBlock?.role || '?'}"
Current position in student's answer: ${firstWrongIdx + 1} of ${correctOrder.length}
Hint number: ${hintCount + 1}

Generate exactly one Socratic guiding question.`;

  const question = await callAI(system, user, 200);
  return { statusCode: 200, body: JSON.stringify({ ok: true, question }) };
}

// ─── REFLECT ───
async function handleReflect(body) {
  const { studentAnswer, puzzleLevel, solveTimeSeconds } = body;
  if (!studentAnswer?.trim())
    return { statusCode: 400, body: JSON.stringify({ error: "studentAnswer required" }) };

  const lc = LEVEL_CONFIG[puzzleLevel] || LEVEL_CONFIG.mid;

  const system = `You are a Hebrew pedagogy mentor responding to a student's post-puzzle reflection.
The student just solved a "${lc.he}" text puzzle (${lc.desc}).
Evaluate their reflection for DEPTH OF INSIGHT — not grammar.
Respond in Hebrew only. Structure:
1. One affirming sentence (max 15 words) about what they understood
2. One deepening question (max 20 words) to push their thinking further
Total response: under 50 words.`;

  const feedback = await callAI(system,
    `Student reflection: "${studentAnswer}"\nSolve time: ${solveTimeSeconds || '?'} seconds`, 300);

  const xpEarned = Math.min(25, 10 + (solveTimeSeconds < 120 ? 5 : 0) +
    (studentAnswer.length > 50 ? 10 : studentAnswer.length > 20 ? 5 : 0));

  return { statusCode: 200, body: JSON.stringify({ ok: true, feedback, xpEarned }) };
}

// ─── SAVE ───
async function handleSave(body) {
  const { puzzle, requesterUsername, requesterPassword } = body;
  if (!puzzle?.blocks?.length || !puzzle?.level)
    return { statusCode: 400, body: JSON.stringify({ error: "puzzle.blocks and puzzle.level required" }) };
  if (!requesterUsername || !requesterPassword)
    return { statusCode: 401, body: JSON.stringify({ error: "authentication required" }) };

  const auth = await authenticate(requesterUsername, requesterPassword);
  if (!auth) return { statusCode: 401, body: JSON.stringify({ error: "אימות נכשל" }) };

  const puzzleId = "pz_" + crypto.randomBytes(6).toString("hex");
  await getDB().ref(`puzzles/${puzzleId}`).set({
    ...puzzle,
    puzzleId,
    createdAt: Date.now(),
    createdBy: requesterUsername
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true, puzzleId, shareUrl: `/text_puzzle.html?puzzleId=${puzzleId}` }) };
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
      case "parse":   result = await handleParse(body);   break;
      case "hint":    result = await handleHint(body);    break;
      case "reflect": result = await handleReflect(body); break;
      case "save":    result = await handleSave(body);    break;
      default:
        return { statusCode: 404, headers,
          body: JSON.stringify({ error: "Unknown route", valid: ["/parse","/hint","/reflect","/save"] }) };
    }
    return { ...result, headers };
  } catch (e) {
    console.error("TEXT_PUZZLE_API:", e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
}

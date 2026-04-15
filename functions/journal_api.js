/**
 * journal_api.js — Activity Translation System (ATS) API Handler
 * MilEd.One | System version: 5.12
 *
 * Routes:
 *   POST /api/journal/parse           — receive raw teaching journal, extract activity candidates
 *   GET  /api/journal/review          — fetch journal + candidates + review state
 *   POST /api/journal/review          — save lecturer review edits
 *   POST /api/journal/approve         — approve selected activities to Activity Bank
 *   GET  /api/activity-bank           — query Activity Bank with optional filters
 *   POST /api/activity-bank/save      — create an activity directly (without journal)
 *   POST /api/activity-bank/update    — edit an existing activity in the bank
 *
 * FIREBASE PATHS:
 *   faculty_journals/{facultyId}/{journalId}                              — raw journal + parse status
 *   faculty_journals/{facultyId}/{journalId}/parsed_lesson                — lesson summary + stage candidates
 *   faculty_journals/{facultyId}/{journalId}/activity_candidates/{actId}  — extracted activity candidates
 *   faculty_journals/{facultyId}/{journalId}/review                       — review record
 *   activity_bank/{facultyId}/{courseId}/{activityId}                     — approved activity records
 *   activity_templates/{facultyId}/{templateId}                           — abstract templates (future)
 *
 * AUTHORITY:
 *   docs/ATS_SCHEMA_V02.md    — Activity Translation System Schema v0.2
 *   docs/ATS_CONTRACT_V1.md   — Implementation Contract v1 (decisions 1–7)
 *   config.json → system.activity_translation — feature flags
 */

import { randomBytes } from "node:crypto";
import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

// ─── Taxonomy constants (ATS Schema v0.2) ────────────────────────────────────

const ACTIVITY_TYPES = new Set([
  "reading", "writing", "speaking", "listening", "discussion",
  "analysis", "classification", "summarization", "paraphrasing",
  "question_answering", "problem_solving", "reflection", "presentation",
  "research", "ai_interaction", "peer_response", "collaborative_work", "submission"
]);

const DELIVERY_MODES = new Set([
  "text_entry", "text_upload", "image_upload", "audio_upload", "video_upload",
  "file_upload", "external_link", "padlet_post", "form_submission",
  "chat_response", "oral_live", "in_class_physical", "bot_conversation"
]);

const EXPECTED_OUTPUTS = new Set([
  "short_answer", "extended_answer", "summary", "paraphrase",
  "classification_table", "list_of_examples", "argument_map",
  "reflection_note", "oral_response", "recorded_speech", "annotated_text",
  "worksheet_completion", "padlet_entry", "ai_output", "project_fragment",
  "presentation_segment", "research_note", "peer_feedback", "final_submission"
]);

const COLLABORATION_MODES = new Set([
  "individual", "pair", "small_group", "whole_class",
  "teacher_student", "asynchronous_individual"
]);

const SESSION_MODES = new Set([
  "frontal", "zoom", "hybrid", "asynchronous", "homework", "in_class_digital"
]);

const BOT_MODES = new Set([
  "none", "course_support", "task_support", "gatekeeper", "research_support",
  "writing_support", "paraphrase_support", "presentation_support",
  "reflection_support", "diagnostic_support"
]);

const STAGE_LABELS = new Set([
  "opening", "knowledge_building", "guided_practice", "independent_practice",
  "discussion", "reflection", "closure", "homework", "unclassified"
]);

const DIFFICULTY_HINTS = new Set(["low", "medium", "high"]);

const REVIEW_STATUSES = new Set([
  "pending_review", "approved", "approved_with_edits", "rejected"
]);

const VALID_SOURCE_TYPES = new Set(["manual_paste", "text_upload"]);

// ─── Rule-based parser ───────────────────────────────────────────────────────

/**
 * Keyword maps for rule-based activity type detection.
 * Ordered by specificity — first match wins for primaryType.
 */
const TYPE_KEYWORD_MAP = [
  { type: "ai_interaction",     keywords: ["בוט", "ai", "chatgpt", "gemini", "מודל שפה", "כלי ai", "כלי בינה", "ai interaction"] },
  { type: "peer_response",      keywords: ["תגובה לעמית", "תגובה לחבר", "peer", "feedback לעמית"] },
  { type: "collaborative_work", keywords: ["עבודה משותפת", "שיתוף פעולה", "יחד עם", "בצוות", "collaborative"] },
  { type: "presentation",       keywords: ["פרזנטציה", "הצג", "הצגה", "מצגת", "present"] },
  { type: "research",           keywords: ["מחקר", "חקר", "איסוף מקורות", "research", "ניתוח מחקרי"] },
  { type: "reflection",         keywords: ["רפלקציה", "reflection", "התבוננות", "חיבור אישי", "מה למדתי"] },
  { type: "discussion",         keywords: ["דיון", "שיחה", "מליאה", "discuss", "שוחח", "conversation"] },
  { type: "problem_solving",    keywords: ["פתרון בעיה", "problem", "תרחיש", "סיטואציה", "נסה לפתור"] },
  { type: "analysis",           keywords: ["נתח", "ניתוח", "analysis", "analyze", "בדוק", "זיהוי קשרים"] },
  { type: "classification",     keywords: ["מיין", "סווג", "classification", "classify", "קטגוריה", "הבחן"] },
  { type: "summarization",      keywords: ["סכם", "סיכום", "summary", "summarize", "תמציתי"] },
  { type: "paraphrasing",       keywords: ["נסח מחדש", "paraphrase", "ניסוח אחר"] },
  { type: "question_answering", keywords: ["ענה על שאלות", "question answering", "מענה"] },
  { type: "speaking",           keywords: ["הקלט", "הקלטה", "דבר", "speaking", "oral", "בעל פה", "audio"] },
  { type: "listening",          keywords: ["האזן", "listening", "האזנה", "קשב"] },
  { type: "writing",            keywords: ["כתוב", "כתיבה", "writing", "write", "ניסוח", "נסח", "כתב"] },
  { type: "reading",            keywords: ["קרא", "קריאה", "reading", "read", "לקרוא"] },
  { type: "submission",         keywords: ["הגש", "הגשה", "submission", "submit", "שלח"] }
];

const DELIVERY_KEYWORD_MAP = [
  { mode: "bot_conversation",  keywords: ["בוט", "ai", "chatbot"] },
  { mode: "padlet_post",       keywords: ["פדלט", "padlet"] },
  { mode: "audio_upload",      keywords: ["הקלט", "הקלטה", "audio", "קובץ קול"] },
  { mode: "video_upload",      keywords: ["וידאו", "video", "הקלטת וידאו"] },
  { mode: "image_upload",      keywords: ["צלם", "תמונה", "image", "צילום"] },
  { mode: "form_submission",   keywords: ["טופס", "form", "form submission"] },
  { mode: "oral_live",         keywords: ["בזמן אמת", "oral live", "דיבור חי"] },
  { mode: "in_class_physical", keywords: ["בכיתה", "פיזי", "in class", "כתב יד"] },
  { mode: "external_link",     keywords: ["קישור", "link", "url", "אתר"] },
  { mode: "file_upload",       keywords: ["קובץ", "pdf", "word", "file upload", "מסמך"] },
  { mode: "text_entry",        keywords: ["כתוב", "כתיבה", "text", "כתב"] }
];

const STAGE_KEYWORD_MAP = [
  { stage: "opening",              keywords: ["פתיחה", "opening", "מבוא", "כניסה"] },
  { stage: "knowledge_building",   keywords: ["הסבר", "הרצאה", "למידה", "הכנה", "knowledge"] },
  { stage: "guided_practice",      keywords: ["תרגול מונחה", "guided", "עם עזרה"] },
  { stage: "independent_practice", keywords: ["תרגול", "עצמאי", "independent", "practice"] },
  { stage: "discussion",           keywords: ["דיון", "שיחה", "מליאה", "discussion"] },
  { stage: "reflection",           keywords: ["רפלקציה", "reflection", "סיכום אישי"] },
  { stage: "closure",              keywords: ["סגירה", "closure", "סיכום", "סיום שיעור"] },
  { stage: "homework",             keywords: ["בית", "homework", "לאחר השיעור", "עבודת בית"] }
];

const COLLABORATION_KEYWORD_MAP = [
  { mode: "pair",                    keywords: ["בזוגות", "pair", "עם שותף"] },
  { mode: "small_group",             keywords: ["קבוצה", "group", "small group", "חברים"] },
  { mode: "whole_class",             keywords: ["מליאה", "whole class", "כל הכיתה"] },
  { mode: "teacher_student",         keywords: ["עם המרצה", "teacher student", "עם המורה"] },
  { mode: "asynchronous_individual", keywords: ["אסינכרוני", "async", "בזמנם"] },
  { mode: "individual",              keywords: ["עצמאי", "individual", "לבד", "כל אחד"] }
];

const SESSION_KEYWORD_MAP = [
  { mode: "zoom",           keywords: ["זום", "zoom", "online", "מרחוק"] },
  { mode: "hybrid",         keywords: ["היברידי", "hybrid", "חלק מהכיתה"] },
  { mode: "asynchronous",   keywords: ["אסינכרוני", "async", "מוקלט"] },
  { mode: "homework",       keywords: ["בית", "homework", "לאחר השיעור"] },
  { mode: "in_class_digital", keywords: ["בכיתה דיגיטלי", "in class digital", "מחשב בכיתה"] },
  { mode: "frontal",        keywords: ["פרונטלי", "frontal", "כיתה"] }
];

function detectFromKeywordMap(text, keywordMap, defaultValue = null) {
  const lower = text.toLowerCase();
  for (const entry of keywordMap) {
    if (entry.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      return entry.type || entry.mode || entry.stage;
    }
  }
  return defaultValue;
}

function detectAllFromKeywordMap(text, keywordMap) {
  const lower = text.toLowerCase();
  const results = [];
  for (const entry of keywordMap) {
    if (entry.keywords.some(kw => lower.includes(kw.toLowerCase()))) {
      results.push(entry.type || entry.mode || entry.stage);
    }
  }
  return results;
}

/**
 * Split raw journal text into candidate activity segments.
 * Strategy: split on numbered lists, Hebrew bullet patterns, blank lines, or known delimiters.
 */
function splitIntoSegments(rawText) {
  const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  const segments = [];
  let current = [];

  const NUMBERED = /^[\d]+[.)]\s+/;
  const BULLET   = /^[-•*–]\s+/;
  const HEBREW_TASK = /^(משימה|פעילות|תרגיל|חלק|פעולה|נושא|שלב\s+[א-ת\d]+|שלב)[:\s]/i;

  for (const line of lines) {
    if (NUMBERED.test(line) || BULLET.test(line) || HEBREW_TASK.test(line)) {
      if (current.length > 0) {
        segments.push(current.join(" "));
      }
      current = [line.replace(NUMBERED, "").replace(BULLET, "").replace(HEBREW_TASK, "")];
    } else if (current.length === 0) {
      current.push(line);
    } else {
      // append continuation
      const joined = current.join(" ").length;
      if (joined < 500) {
        current.push(line);
      } else {
        segments.push(current.join(" "));
        current = [line];
      }
    }
  }
  if (current.length > 0) {
    segments.push(current.join(" "));
  }

  // If splitting produced nothing useful, treat the whole text as one segment
  if (segments.length === 0 && rawText.trim()) {
    segments.push(rawText.trim());
  }

  return segments.filter(s => s.length > 10);
}

/**
 * Derive a human-readable title from a segment (first 60 chars, cleaned up).
 */
function deriveTitle(segment) {
  return segment
    .replace(/^[\d]+[.)]\s+/, "")
    .replace(/^[-•*–]\s+/, "")
    .replace(/\s+/g, " ")
    .slice(0, 60)
    .trim();
}

/**
 * Extract a lesson-level summary from the raw journal text.
 */
function extractLessonSummary(rawText, metadata) {
  const firstLines = rawText.split("\n").slice(0, 6).map(l => l.trim()).filter(Boolean);
  return {
    lessonTitle: metadata.lessonTitle || firstLines[0] || "שיעור ללא כותרת",
    lessonDate:  metadata.lessonDate  || null,
    courseId:    metadata.courseId    || null,
    lessonMode:  metadata.lessonMode  || null,
    excerpt:     firstLines.slice(0, 3).join(" | "),
    parsedAt:    new Date().toISOString()
  };
}

/**
 * Strip prompt-injection patterns from raw journal text before parsing.
 * Prevents malicious instructions from leaking into the candidate `instructions` field.
 */
function sanitizeRawText(text) {
  return text
    .replace(/<!--/g, "")
    .replace(/-->/g, "")
    .replace(/\[SYSTEM[^\]]*\]/gi, "")
    .replace(/ignore\s+(all\s+)?previous\s+instructions?/gi, "")
    .replace(/<\|[\w]+\|>/g, "");
}

/**
 * Main rule-based parser — converts a raw journal text into activity candidates.
 * Returns { lessonSummary, candidates[] }
 */
function ruleBasedParse(rawText, metadata) {
  const sanitized = sanitizeRawText(rawText);
  const lessonSummary = extractLessonSummary(sanitized, metadata);
  const segments = splitIntoSegments(sanitized);

  const candidates = segments.map((seg, idx) => {
    const primaryType  = detectFromKeywordMap(seg, TYPE_KEYWORD_MAP, "writing");
    const allTypes     = detectAllFromKeywordMap(seg, TYPE_KEYWORD_MAP);
    const secondaryTypes = allTypes.filter(t => t !== primaryType).slice(0, 3);

    const deliveryModes = detectAllFromKeywordMap(seg, DELIVERY_KEYWORD_MAP);
    const stage         = detectFromKeywordMap(seg, STAGE_KEYWORD_MAP, "unclassified");
    const collaboration = detectFromKeywordMap(seg, COLLABORATION_KEYWORD_MAP, "individual");
    const session       = detectFromKeywordMap(seg, SESSION_KEYWORD_MAP,
      metadata.lessonMode || "frontal");

    // Simple delivery fallback
    const deliveryMode = deliveryModes.length > 0 ? deliveryModes : ["text_entry"];

    // Confidence heuristic — 3-dimensional score
    const typeScore  = Math.min(allTypes.length * 0.2, 0.6);
    const delScore   = Math.min(deliveryModes.length * 0.15, 0.3);
    const stageScore = stage !== "unclassified" ? 0.1 : 0;
    const confidence = parseFloat(Math.min(0.25 + typeScore + delScore + stageScore, 0.95).toFixed(2));

    return {
      activityId:         generateId("cand"),
      title:              deriveTitle(seg),
      primaryType,
      secondaryTypes,
      instructions:       seg,
      stageLabel:         stage,
      deliveryMode,
      expectedOutput:     [],          // requires human enrichment
      collaborationMode:  collaboration,
      sessionMode:        session,
      botMode:            "none",
      skillTags:          [],          // populated during enrichment
      difficultyHint:     "medium",
      estimatedMinutes:   null,
      confidence:         confidence,
      reviewStatus:       "pending_review",
      confidenceBreakdown: { typeScore, deliveryScore: delScore, stageScore },
      activitySourceSpan: { fromText: seg }
    };
  });

  return { lessonSummary, candidates };
}

function generateId(prefix = "j") {
  return `${prefix}_${Date.now()}_${randomBytes(3).toString("hex")}`;
}

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateActivity(act, requireBankReady = false) {
  const errors = [];

  if (!act.title || typeof act.title !== "string" || !act.title.trim())
    errors.push("title is required");

  if (!act.primaryType || !ACTIVITY_TYPES.has(act.primaryType))
    errors.push(`primaryType must be one of: ${[...ACTIVITY_TYPES].join(", ")}`);

  if (act.secondaryTypes && !Array.isArray(act.secondaryTypes))
    errors.push("secondaryTypes must be an array");

  if (act.deliveryMode && !Array.isArray(act.deliveryMode))
    errors.push("deliveryMode must be an array");

  if (act.expectedOutput && !Array.isArray(act.expectedOutput))
    errors.push("expectedOutput must be an array");

  if (act.collaborationMode && !COLLABORATION_MODES.has(act.collaborationMode))
    errors.push(`collaborationMode must be one of: ${[...COLLABORATION_MODES].join(", ")}`);

  if (act.sessionMode && !SESSION_MODES.has(act.sessionMode))
    errors.push(`sessionMode must be one of: ${[...SESSION_MODES].join(", ")}`);

  if (act.botMode && !BOT_MODES.has(act.botMode))
    errors.push(`botMode must be one of: ${[...BOT_MODES].join(", ")}`);

  if (act.difficultyHint && !DIFFICULTY_HINTS.has(act.difficultyHint))
    errors.push(`difficultyHint must be one of: low, medium, high`);

  if (requireBankReady) {
    if (!act.stageLabel || !STAGE_LABELS.has(act.stageLabel) || act.stageLabel === "unclassified")
      errors.push("stageLabel must be a valid, non-unclassified stage before saving to bank");

    if (!act.reviewStatus || !["approved", "approved_with_edits"].includes(act.reviewStatus))
      errors.push("reviewStatus must be 'approved' or 'approved_with_edits' before saving to bank");
  }

  return errors;
}

// ─── Route handlers ───────────────────────────────────────────────────────────

async function handleParse(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { facultyId, courseId, lessonDate, lessonTitle, lessonMode, rawText, sourceType } = body;

  if (!facultyId || !rawText) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId and rawText are required" })
    };
  }

  if (rawText.length > 20000) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "rawText exceeds 20,000 character limit" })
    };
  }

  const db = getDB();
  const journalId = generateId("j");
  const now = new Date().toISOString();

  const metadata = { facultyId, courseId, lessonDate, lessonTitle, lessonMode };
  const { lessonSummary, candidates } = ruleBasedParse(rawText, metadata);

  const journalRecord = {
    journalId,
    facultyId,
    courseId:     courseId    || null,
    lessonDate:   lessonDate  || null,
    lessonTitle:  lessonTitle || null,
    lessonMode:   lessonMode  || null,
    rawText,
    sourceType:   VALID_SOURCE_TYPES.has(sourceType) ? sourceType : "manual_paste",
    status:       "parsed",
    createdAt:    now,
    updatedAt:    now
  };

  const candidatesMap = {};
  for (const cand of candidates) {
    candidatesMap[cand.activityId] = cand;
  }

  try {
    await Promise.all([
      db.ref(`faculty_journals/${facultyId}/${journalId}`).set(journalRecord),
      db.ref(`faculty_journals/${facultyId}/${journalId}/parsed_lesson`).set({
        ...lessonSummary,
        candidateCount: candidates.length,
        parseStrategy: "rule_based_v1"
      }),
      db.ref(`faculty_journals/${facultyId}/${journalId}/activity_candidates`).set(candidatesMap)
    ]);
  } catch (e) {
    console.error("JOURNAL PARSE: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save journal to Firebase" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      journalId,
      lessonSummary,
      candidateCount: candidates.length,
      candidates
    })
  };
}

async function handleFetchReview(event) {
  const params = new URLSearchParams(event.queryStringParameters || {});
  const facultyId = params.get("facultyId");
  const journalId = params.get("journalId");

  if (!facultyId || !journalId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId and journalId are required" })
    };
  }

  const db = getDB();

  try {
    const [journalSnap, parsedSnap, candidatesSnap, reviewSnap] = await Promise.all([
      db.ref(`faculty_journals/${facultyId}/${journalId}`).get(),
      db.ref(`faculty_journals/${facultyId}/${journalId}/parsed_lesson`).get(),
      db.ref(`faculty_journals/${facultyId}/${journalId}/activity_candidates`).get(),
      db.ref(`faculty_journals/${facultyId}/${journalId}/review`).get()
    ]);

    if (!journalSnap.exists()) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Journal not found" }) };
    }

    const journal     = journalSnap.val();
    const parsed      = parsedSnap.exists()    ? parsedSnap.val()    : null;
    const candidates  = candidatesSnap.exists() ? candidatesSnap.val() : {};
    const review      = reviewSnap.exists()    ? reviewSnap.val()    : null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        journal,
        lessonSummary: parsed,
        candidates: Object.values(candidates),
        review
      })
    };
  } catch (e) {
    console.error("JOURNAL REVIEW FETCH: Firebase error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to fetch review data" }) };
  }
}

async function handleSaveReview(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { facultyId, journalId, activities, reviewNotes, reviewedBy } = body;

  if (!facultyId || !journalId || !Array.isArray(activities)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId, journalId, and activities[] are required" })
    };
  }

  const db = getDB();
  const now = new Date().toISOString();

  // Validate each submitted activity
  const validationErrors = [];
  for (const act of activities) {
    const errs = validateActivity(act, false);
    if (errs.length > 0) {
      validationErrors.push({ activityId: act.activityId, errors: errs });
    }
  }
  if (validationErrors.length > 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "Validation errors", validationErrors })
    };
  }

  // Compute review buckets
  const approved = activities.filter(a => ["approved", "approved_with_edits"].includes(a.reviewStatus));
  const rejected = activities.filter(a => a.reviewStatus === "rejected");
  const pending  = activities.filter(a => a.reviewStatus === "pending_review");

  const reviewRecord = {
    reviewedBy:         reviewedBy || null,
    reviewedAt:         now,
    approvedCount:      approved.length,
    rejectedCount:      rejected.length,
    pendingCount:       pending.length,
    notes:              reviewNotes || null
  };

  // Persist updated candidate statuses + review record
  const updates = {};
  for (const act of activities) {
    updates[`faculty_journals/${facultyId}/${journalId}/activity_candidates/${act.activityId}`] = {
      ...act,
      updatedAt: now
    };
  }
  updates[`faculty_journals/${facultyId}/${journalId}/review`] = reviewRecord;
  const hasAnyDecision = approved.length > 0 || rejected.length > 0;
  // "partially_approved" / "approved" are set by handleApprove (bank-save step), not here.
  // This step only transitions between "parsed" (no decisions yet) and "reviewed" (at least one decision).
  updates[`faculty_journals/${facultyId}/${journalId}/status`]  = hasAnyDecision ? "reviewed" : "parsed";
  updates[`faculty_journals/${facultyId}/${journalId}/updatedAt`] = now;

  try {
    await db.ref().update(updates);
  } catch (e) {
    console.error("JOURNAL SAVE REVIEW: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save review" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      reviewedAt: now,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      pendingCount:  pending.length
    })
  };
}

async function handleApprove(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { facultyId, journalId, courseId, activities } = body;

  if (!facultyId || !journalId || !Array.isArray(activities) || activities.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId, journalId, and a non-empty activities[] are required" })
    };
  }

  // Validate all activities are bank-ready
  const validationErrors = [];
  for (const act of activities) {
    const errs = validateActivity(act, true);
    if (errs.length > 0) {
      validationErrors.push({ activityId: act.activityId, errors: errs });
    }
  }
  if (validationErrors.length > 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "Bank validation errors", validationErrors })
    };
  }

  const db = getDB();
  const now = new Date().toISOString();
  const saved = [];

  // Fetch all existing candidates to determine the correct final journal status
  let existingCandidates = {};
  try {
    const candSnap = await db.ref(`faculty_journals/${facultyId}/${journalId}/activity_candidates`).get();
    if (candSnap.exists()) existingCandidates = candSnap.val();
  } catch (e) {
    console.warn("JOURNAL APPROVE: Could not fetch existing candidates:", e.message);
  }

  const updates = {};
  for (const act of activities) {
    const effectiveCourseId = act.courseId || courseId || "uncategorized";
    const activityId = act.activityId || generateId("act");

    const bankRecord = {
      ...act,
      activityId,
      facultyId,
      courseId:   effectiveCourseId,
      templateId: act.templateId || null,
      source: {
        origin:    "teaching_journal",
        journalId,
        lessonDate: act.source?.lessonDate || null
      },
      reuseCount: 0,
      createdAt:  act.createdAt || now,
      updatedAt:  now
    };

    updates[`activity_bank/${facultyId}/${effectiveCourseId}/${activityId}`] = bankRecord;
    // Update candidate status in journal
    updates[`faculty_journals/${facultyId}/${journalId}/activity_candidates/${activityId}/reviewStatus`] = act.reviewStatus;
    updates[`faculty_journals/${facultyId}/${journalId}/activity_candidates/${activityId}/savedToBank`]  = true;
    saved.push(activityId);
  }

  // Determine final journal status: "approved" only when no candidates remain pending_review
  const incomingStatusMap = Object.fromEntries(activities.map(a => [a.activityId, a.reviewStatus]));
  const mergedStatuses = {
    ...Object.fromEntries(Object.entries(existingCandidates).map(([id, c]) => [id, c.reviewStatus || "pending_review"])),
    ...incomingStatusMap
  };
  const hasAnyPending = Object.values(mergedStatuses).some(s => s === "pending_review");
  const journalStatus = hasAnyPending ? "partially_approved" : "approved";

  updates[`faculty_journals/${facultyId}/${journalId}/status`]    = journalStatus;
  updates[`faculty_journals/${facultyId}/${journalId}/updatedAt`] = now;

  try {
    await db.ref().update(updates);
  } catch (e) {
    console.error("JOURNAL APPROVE: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save activities to bank" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, savedCount: saved.length, savedIds: saved })
  };
}

async function handleQueryBank(event) {
  const qsp = event.queryStringParameters || {};
  const {
    facultyId, courseId, primaryType, stageLabel,
    collaborationMode, sessionMode, botMode, difficultyHint,
    reviewStatus, limit
  } = qsp;

  if (!facultyId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId is required" })
    };
  }

  const db = getDB();
  const maxResults = Math.min(parseInt(limit || "50", 10), 200);

  try {
    let activities = [];

    if (courseId) {
      // Efficient: use orderByChild+limitToLast to cap the read at 200 records max
      const snap = await db.ref(`activity_bank/${facultyId}/${courseId}`)
        .orderByChild("createdAt")
        .limitToLast(200)
        .get();
      if (snap.exists()) {
        activities = Object.values(snap.val()).filter(Boolean);
      }
    } else {
      // Nested by courseId — fetch all but cap to 10 most recent course buckets
      const facultySnap = await db.ref(`activity_bank/${facultyId}`).get();
      if (facultySnap.exists()) {
        const raw = facultySnap.val();
        // Sort course keys descending (lexicographic ≈ recency for typical IDs) and take last 10
        const courseIds = Object.keys(raw).sort().slice(-10);
        for (const cId of courseIds) {
          activities.push(...Object.values(raw[cId] || {}).filter(Boolean));
        }
      }
    }

    if (!activities.length) {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, count: 0, total: 0, activities: [] }) };
    }

    // Apply filters
    if (primaryType)       activities = activities.filter(a => a.primaryType === primaryType);
    if (stageLabel)        activities = activities.filter(a => a.stageLabel === stageLabel);
    if (collaborationMode) activities = activities.filter(a => a.collaborationMode === collaborationMode);
    if (sessionMode)       activities = activities.filter(a => a.sessionMode === sessionMode);
    if (botMode)           activities = activities.filter(a => a.botMode === botMode);
    if (difficultyHint)    activities = activities.filter(a => a.difficultyHint === difficultyHint);
    if (reviewStatus)      activities = activities.filter(a => a.reviewStatus === reviewStatus);

    // Sort by createdAt desc
    activities.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    const totalBeforeLimit = activities.length;
    activities = activities.slice(0, maxResults);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, count: activities.length, total: totalBeforeLimit, activities })
    };
  } catch (e) {
    console.error("ACTIVITY BANK QUERY: Firebase error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to query activity bank" }) };
  }
}

async function handleSaveDirectActivity(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { facultyId, courseId, activity } = body;

  if (!facultyId || !activity) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId and activity are required" })
    };
  }

  const errors = validateActivity(activity, true);
  if (errors.length > 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ ok: false, error: "Validation errors", errors })
    };
  }

  const db = getDB();
  const now = new Date().toISOString();
  const effectiveCourseId = activity.courseId || courseId || "uncategorized";
  const activityId = activity.activityId || generateId("act");

  const bankRecord = {
    ...activity,
    activityId,
    facultyId,
    courseId: effectiveCourseId,
    templateId: activity.templateId || null,
    source: {
      origin:    "direct_entry",
      journalId: null,
      lessonDate: null
    },
    reuseCount: 0,
    createdAt:  now,
    updatedAt:  now
  };

  try {
    await db.ref(`activity_bank/${facultyId}/${effectiveCourseId}/${activityId}`).set(bankRecord);
  } catch (e) {
    console.error("ACTIVITY BANK SAVE: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save activity" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, activityId, courseId: effectiveCourseId })
  };
}

async function handleUpdateActivity(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { facultyId, courseId, activityId, updates } = body;

  if (!facultyId || !courseId || !activityId || !updates) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "facultyId, courseId, activityId, and updates are required" })
    };
  }

  const db = getDB();
  const ref = db.ref(`activity_bank/${facultyId}/${courseId}/${activityId}`);

  try {
    const snap = await ref.get();
    if (!snap.exists()) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Activity not found" }) };
    }

    const merged = { ...snap.val(), ...updates, updatedAt: new Date().toISOString() };

    const errors = validateActivity(merged, false);
    if (errors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: "Validation errors after merge", errors })
      };
    }

    await ref.set(merged);
  } catch (e) {
    console.error("ACTIVITY BANK UPDATE: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to update activity" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, activityId })
  };
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const pathParts = event.path.split("/").filter(Boolean);
  // /api/journal/parse  → ["api","journal","parse"]
  // /api/activity-bank  → ["api","activity-bank"]
  // /api/activity-bank/save → ["api","activity-bank","save"]
  const segment1 = pathParts[1]; // "journal" or "activity-bank"
  const segment2 = pathParts[2]; // "parse" | "review" | "approve" | "save" | "update" | undefined

  const method = event.httpMethod;

  if (segment1 === "journal") {
    if (method === "POST" && segment2 === "parse")   return handleParse(event);
    if (method === "GET"  && segment2 === "review")  return handleFetchReview(event);
    if (method === "POST" && segment2 === "review")  return handleSaveReview(event);
    if (method === "POST" && segment2 === "approve") return handleApprove(event);
  }

  if (segment1 === "activity-bank") {
    if (method === "GET"  && !segment2)               return handleQueryBank(event);
    if (method === "POST" && segment2 === "save")     return handleSaveDirectActivity(event);
    if (method === "POST" && segment2 === "update")   return handleUpdateActivity(event);
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      error: "Unknown ATS route",
      validRoutes: [
        "POST /api/journal/parse",
        "GET  /api/journal/review",
        "POST /api/journal/review",
        "POST /api/journal/approve",
        "GET  /api/activity-bank",
        "POST /api/activity-bank/save",
        "POST /api/activity-bank/update"
      ]
    })
  };
}

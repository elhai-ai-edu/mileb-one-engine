import fs from "fs";
import path from "path";

const kernelPath = path.resolve(process.cwd(), "kernel.txt");
const kernel = fs.readFileSync(kernelPath, "utf8");
// functions/chat.js — MilEd.One v5.5
// Scope-aware authorization + Owner-aware bots + Kernel injection + Logging + Model routing
// + Hard guards + Config cache TTL + Safe OpenRouter handling + Engine-config driven params
// + Full System Prompt Export Support + Public/Private Kernel Separation
// + Firebase session memory + Conversation logging
// + Automatic session extraction via %%SESSION_UPDATE%% protocol
// + Persist and restore chat history via Firebase
// + isNewBotSession guard — prevent loading stale history on bot switch

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

// ─── PROCESS RUNTIME IMPORTS (pilot: critical_text_review only) ───
import { createInitialProcessState, recordHistory } from './process_state_manager.js';
import { runProjectForward }                        from './project_runtime_driver.js';
import { buildRuntimeInstructionLayer }             from './runtime_instruction_builder.js';
import { buildCriticalTextReviewFlow, buildPersonalProjectFlow } from './project_flow_builder.js';

// Build the PP flow once at module level for context injection in buildPersonalProjectContextBlock.
const PP_CONTEXT_FLOW = buildPersonalProjectFlow();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";

const COURSE_SKILLS = new Set([
  "s01_direct_meaning","s02_main_idea","s03_logical_structure","s04_paraphrase",
  "s05_transformations","s06_comparison_merge","s07_critical_errors",
  "s08_linguistic_precision","s09_text_quality","s10_visual_representation",
  "s11_academic_writing","s12_integration"
]);

const PROFESSIONAL_GROUPS = new Set(["academic", "resilience", "social", "tools", "career"]);


// ─────────────────────────────────────────
// FIREBASE INIT (identical pattern to submit.js)
// ─────────────────────────────────────────

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}


// ─────────────────────────────────────────
// SESSION MEMORY
// ─────────────────────────────────────────

async function loadSessionContext(studentId, courseId) {
  if (!studentId || !courseId || studentId === "anonymous") return null;
  try {
    const snap = await getDB()
      .ref(`sessions/${studentId}/${courseId}`)
      .get();
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error("SESSION LOAD ERROR:", e.message);
    return null;
  }
}

async function saveSessionContext(studentId, courseId, data) {
  if (!studentId || !courseId || studentId === "anonymous") return;
  try {
    await getDB()
      .ref(`sessions/${studentId}/${courseId}`)
      .update({ ...data, updatedAt: Date.now() });
  } catch (e) {
    console.error("SESSION SAVE ERROR:", e.message);
  }
}

function normalizeStageStorageKey(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || null;
}

function buildGatekeepingContextBlock(sessionCtx, currentStep = null) {
  if (!sessionCtx) return "";

  const lines = [];
  const continuityState = sessionCtx.continuity?.state || null;
  const gatekeeping = sessionCtx.gatekeeping || {};
  const stageKey = normalizeStageStorageKey(currentStep);

  if (continuityState?.currentStageId)
    lines.push(`שלב רצף פעיל: ${continuityState.currentStageId}`);

  if (stageKey) {
    const unlockState = sessionCtx.continuity?.unlockStates?.[stageKey] || null;
    const activeSubmissionId = gatekeeping.activeSubmissionIdByStage?.[stageKey] || null;
    const latestEvaluationId = gatekeeping.lastEvaluationIdByStage?.[stageKey] || null;
    const latestTokenId = gatekeeping.lastTokenIdByStage?.[stageKey] || null;
    const latestEvaluation = latestEvaluationId ? gatekeeping.evaluations?.[latestEvaluationId] : null;
    const latestToken = latestTokenId ? gatekeeping.tokens?.[latestTokenId] : null;
    const openRevision = Object.values(gatekeeping.revisionRequests || {}).find(item => {
      if (!item || item.status !== "open") return false;
      if (activeSubmissionId && item.submissionId === activeSubmissionId) return true;
      return false;
    }) || null;

    if (unlockState?.state)
      lines.push(`סטטוס פתיחת שלב: ${unlockState.state}`);
    if (activeSubmissionId)
      lines.push(`הוגשה בקשת אישור: ${activeSubmissionId}`);
    if (latestEvaluation?.status)
      lines.push(`תוצאת gatekeeping אחרונה: ${latestEvaluation.status}`);
    if (latestEvaluation?.feedback)
      lines.push(`משוב gatekeeping: ${latestEvaluation.feedback}`);
    if (latestToken?.status)
      lines.push(`סטטוס טוקן אישור: ${latestToken.status}`);
    if (openRevision?.reasonSummary)
      lines.push(`נדרש תיקון לפני התקדמות: ${openRevision.reasonSummary}`);
  }

  return lines.length ? "## מצב Gatekeeping\n" + lines.join("\n") : "";
}

function buildPersonalProjectContextBlock({
  currentStep = null,
  ppStageTitle = null,
  ppStageInstructions = null,
  ppStageTaskPrompt = null,
  ppStageBotHint = null,
  ppBotPolicy = null,
  courseConfig = null,
  config = null
} = {}) {
  const effectivePpPolicy = ppBotPolicy
    || courseConfig?.personalProject?.botPolicy
    || courseConfig?.personalProject?.policy
    || config?.branches?.tools?.items?.personal_project?.defaultPolicy
    || null;
  const lines = [];
  const numericCurrentStep = Number(currentStep);
  if (Number.isFinite(numericCurrentStep)) {
    lines.push(`אינדקס שלב אישי: ${numericCurrentStep}`);
  }
  if (ppStageTitle) lines.push(`כותרת שלב: ${ppStageTitle}`);
  const effectiveStageText = ppStageTaskPrompt || ppStageInstructions;
  if (effectiveStageText) lines.push(`הנחיית שלב: ${effectiveStageText}`);
  if (ppStageBotHint) lines.push(`botHint לשלב: ${ppStageBotHint}`);
  if (effectivePpPolicy) lines.push(`מדיניות בוט לפרויקט אישי: ${effectivePpPolicy}`);

  // Inject structured validation profile for the current stage so the bot
  // knows exactly what components to look for and ask about.
  if (Number.isFinite(numericCurrentStep)) {
    const flowNode = PP_CONTEXT_FLOW.nodes[numericCurrentStep] || null;
    if (flowNode) {
      const profile = {
        required_outputs: flowNode.required_outputs || [],
        validation_expectations: flowNode.validation_expectations || []
      };
      lines.push(`פרופיל ולידציה לשלב: ${JSON.stringify(profile)}`);
    }
  }

  // Explicit enforcement hint: the bot should never write the answer for the student
  // and should prompt for expansion when the answer is too short.
  // The threshold is taken from the flow node's min_length (set per-stage in buildPersonalProjectFlow).
  if (Number.isFinite(numericCurrentStep)) {
    const flowNode = PP_CONTEXT_FLOW.nodes[numericCurrentStep] || null;
    const lengthThreshold = (flowNode && typeof flowNode.min_length === 'number')
      ? flowNode.min_length
      : 60;
    lines.push(`הנחיית אכיפה: אם הסטודנט מבקש שתכתוב עבורו — סרב בנימוס והסבר שעליו לנסח בעצמו. אם התשובה קצרה מ-${lengthThreshold} תווים — בקש הרחבה ממוקדת.`);
  } else {
    lines.push("הנחיית אכיפה: אם הסטודנט מבקש שתכתוב עבורו — סרב בנימוס והסבר שעליו לנסח בעצמו. אם התשובה קצרה מ-60 תווים — בקש הרחבה ממוקדת.");
  }

  return lines.length ? "## הקשר פרויקט אישי\n" + lines.join("\n") : "";
}


// ─────────────────────────────────────────
// CONVERSATION LOGGING
// ─────────────────────────────────────────

async function logMessage(sessionId, role, content) {
  if (!sessionId) return;
  try {
    await getDB()
      .ref(`conversations/${sessionId}/messages`)
      .push({ role, content, timestamp: Date.now() });
  } catch (e) {
    console.error("CONVERSATION LOG ERROR:", e.message);
  }
}


// ─────────────────────────────────────────
// MODEL ROUTING
// ─────────────────────────────────────────

const MODEL_THINKING = "google/gemini-2.0-flash-thinking-exp";
const MODEL_FAST     = "google/gemini-2.0-flash-001";

// ─────────────────────────────────────────
// PROCESS RUNTIME — PILOT-ONLY STATE STORE
// Pilot-only persistence. Replace with Firebase/session persistence after classroom validation.
// NOTE: In-memory Map is not concurrency-safe across simultaneous requests for the same key.
// Acceptable for single-classroom pilot; must be replaced before multi-class rollout.
// ─────────────────────────────────────────

const PROCESS_STATE_STORE = globalThis.__MILED_PROCESS_STATE_STORE__ || new Map();
globalThis.__MILED_PROCESS_STATE_STORE__ = PROCESS_STATE_STORE;

const PROCESS_RUNTIME_TEMPERATURE = 0.7;
const PROCESS_RUNTIME_MAX_TOKENS  = 1024;

function buildProcessStateKey(body = {}) {
  return `${body.sessionId || 'local'}:${body.studentId || body.userId || 'anonymous'}:${body.project_type || body.botType}`;
}

function loadProcessState(key) {
  return PROCESS_STATE_STORE.get(key) || null;
}

function saveProcessState(key, state) {
  PROCESS_STATE_STORE.set(key, state);
}

// ─────────────────────────────────────────
// PROCESS RUNTIME — GUARD
// ─────────────────────────────────────────

function isProcessRuntimeRequest(body = {}) {
  return (
    body.botType === 'critical_text_review' ||
    body.project_type === 'critical_text_review' ||
    (body.process_runtime_enabled === true && body.project_type === 'critical_text_review')
  );
}

// ─────────────────────────────────────────
// PROCESS RUNTIME — STATE BOOTSTRAP
// ─────────────────────────────────────────

function createCriticalReviewInitialState(body = {}) {
  const state = createInitialProcessState({
    student_id:    body.studentId || body.userId || 'anonymous',
    pipeline_id:   'critical_review_learning_pipeline',
    project_type:  'critical_text_review',
    initial_stage: 'stage_1',
    bridge: {
      bridge_type:      'learning_to_project',
      bridge_mode:      'flexible',
      bridge_visibility:'visible',
      transition_tone:  'soft_guiding',
      missing_policy:   'warn_and_track'
    }
  });

  const flow = buildCriticalTextReviewFlow();
  state.nodes = flow.nodes;

  return state;
}

function updateStateFromStudentMessage(state, message) {
  const currentNode = (state.nodes || []).find(n =>
    n.node_id === state.current?.stage_id || n.stage_id === state.current?.stage_id
  );

  if (!currentNode) return state;

  const outputKey = currentNode.required_outputs?.[0];

  if (outputKey && message && message.trim()) {
    state.project_outputs[outputKey] = message.trim();
  }

  state.previous_answer  = state.last_user_message || null;
  state.last_user_message = message;

  return state;
}

// ─────────────────────────────────────────
// PROCESS RUNTIME — MODEL MESSAGES
// ─────────────────────────────────────────

function buildProcessModelMessages({ state, action, instructionLayer, message }) {
  return [
    {
      role: 'system',
      content: [
        'אתה בוט למידה תהליכי של MilEd.',
        instructionLayer.system_addendum,
        '',
        'מדיניות מחייבת:',
        JSON.stringify(instructionLayer.runtime_policies, null, 2),
        '',
        'פעולות מותרות:',
        instructionLayer.allowed_actions.join(', '),
        '',
        'פעולות אסורות:',
        instructionLayer.forbidden_actions.join(', '),
        '',
        'סגנון תגובה:',
        JSON.stringify(instructionLayer.response_style, null, 2)
      ].join('\n')
    },
    {
      role: 'assistant',
      content: instructionLayer.stage_prompt
    },
    {
      role: 'user',
      content: message
    }
  ];
}

async function callProcessModel(messages) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  SITE_URL,
      'X-Title':       'MilEd.One'
    },
    body: JSON.stringify({ model: MODEL_FAST, messages, temperature: PROCESS_RUNTIME_TEMPERATURE, max_tokens: PROCESS_RUNTIME_MAX_TOKENS })
  });

  const raw = await response.text();
  if (!response.ok) {
    console.error('[process-runtime] LLM ERROR:', response.status, raw);
    throw new Error('LLM request failed');
  }

  const data = JSON.parse(raw);
  return data.choices?.[0]?.message?.content || 'מצטער, לא הצלחתי לקבל תשובה כרגע.';
}

// ─────────────────────────────────────────
// PROCESS RUNTIME — HANDLER
// Pilot-only process runtime path.
// Keep narrow. Do not generalize until after classroom validation.
// chat.js orchestrates runtime; pedagogy remains in helper modules.
// ─────────────────────────────────────────

async function handleProcessRuntimeRequest(body, headers) {
  const message = body.message || body.userMessage || '';
  const key     = buildProcessStateKey(body);

  let state = loadProcessState(key);

  if (!state) {
    state = createCriticalReviewInitialState(body);
  }

  state = updateStateFromStudentMessage(state, message);

  const action = runProjectForward(state, {
    nodes:      state.nodes,
    lastAnswer: message
  });

  const instructionLayer = buildRuntimeInstructionLayer({
    state,
    action,
    context: {
      pilot_mode:   true,
      project_type: 'critical_text_review'
    }
  });

  const modelMessages = buildProcessModelMessages({ state, action, instructionLayer, message });

  const responseText = await callProcessModel(modelMessages);

  state.last_bot_message = responseText;

  recordHistory(state, {
    event_type: 'process_runtime_turn',
    stage_id:   state.current?.stage_id,
    summary:    action.type
  });

  saveProcessState(key, state);

  if (body.debug_process_runtime === true) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: responseText,
        botType: body.botType || 'critical_text_review',
        process_debug: {
          stage_id:   state.current?.stage_id,
          action_type: action.type,
          missing:    action.missing || [],
          validation: action.validation || {}
        }
      })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      reply:   responseText,
      botType: body.botType || 'critical_text_review'
    })
  };
}

const THINKING_BOT_TYPES = [
  "faculty_assistant",
  "faculty_bot_builder",
  "faculty_support",
  "faculty_lesson_builder",
  "task_final_project",
  "skills_diagnostic",
  "skills_career_diagnostic",
  "admin_analytics",
  "skills_learning_full",
  "skills_employability_full"
];

function selectModel(botType) {
  if (botType && THINKING_BOT_TYPES.includes(botType))
    return MODEL_THINKING;
  return MODEL_FAST;
}


// ─────────────────────────────────────────
// CONFIG CACHE (TTL)
// ─────────────────────────────────────────

let cachedConfig = null;
let cachedAt = 0;
const CACHE_TTL = 60_000;

async function loadConfig() {
  const now = Date.now();
  if (cachedConfig && (now - cachedAt) < CACHE_TTL)
    return cachedConfig;
  try {
    const res = await fetch(`${SITE_URL}/config.json`);
    if (!res.ok) {
      console.error("CONFIG LOAD FAILED:", res.status);
      return null;
    }
    cachedConfig = await res.json();
    cachedAt = now;
    return cachedConfig;
  } catch (e) {
    console.error("CONFIG FETCH ERROR:", e.message);
    return null;
  }
}


// ─────────────────────────────────────────
// AUTHORIZATION LAYER
// ─────────────────────────────────────────

// Verify that the claimed facultyId corresponds to a real faculty/admin account in Firebase.
// Returns true only if the record exists and has an appropriate role.
async function verifyFacultyId(facultyId) {
  if (!facultyId) return false;
  try {
    const snap = await getDB().ref(`admin/auth/${facultyId}`).get();
    if (!snap.exists()) return false;
    const record = snap.val();
    if (!record || typeof record !== "object") return false;
    const role = record.role || "";
    return ["faculty", "admin", "superadmin"].includes(role);
  } catch (e) {
    console.error("VERIFY_FACULTY: Firebase lookup failed:", e.message);
    return false;
  }
}

function hasAccess(bot, context) {
  const scope = bot.scope || "global";
  const owner = bot.owner || null;
  const facultyId      = context.facultyId      || null;
  const classId        = context.classId        || null;
  const facultyVerified = context.facultyVerified === true;

  if (scope === "global")          return true;
  if (scope === "institution")     return facultyVerified;
  if (scope === "faculty_private") return !!(owner && facultyId && owner === facultyId && facultyVerified);
  if (scope === "course_specific") return !!(classId && bot.courseId && classId === bot.courseId);
  return false;
}


// ─────────────────────────────────────────
// BOT RESOLUTION
// ─────────────────────────────────────────

async function findBot(config, botType, context = {}) {
  if (!config || !botType) return null;
  for (let id in (config.universal?.items || {})) {
    const bot = config.universal.items[id];
    if (bot.botType === botType && hasAccess(bot, context)) return bot;
  }
  for (let branch in (config.branches || {})) {
    for (let id in (config.branches[branch]?.items || {})) {
      const bot = config.branches[branch].items[id];
      if (bot.botType === botType && hasAccess(bot, context)) return bot;
    }
  }
  // ─── Firebase live_configs fallback (dynamically added bots) ───
  try {
    const snap = await getDB().ref("admin/system/live_configs").get();
    if (snap.exists()) {
      const live = snap.val();
      for (const id in live) {
        const bot = live[id];
        if (bot.botType === botType && hasAccess(bot, context)) return bot;
      }
    }
  } catch (e) {
    console.error("FINDBOT: live_configs lookup failed:", e.message);
    // non-fatal — fall through to return null
  }
  return null;
}


// ─────────────────────────────────────────
// MESSAGE ANALYSIS
// ─────────────────────────────────────────

function analyzeMessage(message) {
  const isQuestion =
    message.includes("?")    || message.includes("מה") ||
    message.includes("איך")  || message.includes("למה") ||
    message.includes("מתי")  || message.includes("איפה");
  const wordCount = message.trim().split(/\s+/).length;
  return { isQuestion, wordCount };
}


// ─────────────────────────────────────────
// KERNEL GUARDS
// ─────────────────────────────────────────

// Part 18 §18.3 Never-Do Guard — full pattern set from MASTER_LOGIC.md
function detectFullSolutionRequest(message) {
  const lower = message.toLowerCase();
  return (
    /כתוב( לי)?/.test(lower) ||
    /פתור( לי)?/.test(lower) ||
    /תן( לי)? תשובה( מלאה)?/.test(lower) ||
    /עשה( זאת)? בשבילי/.test(lower) ||
    lower.includes("תפתור לי") ||
    lower.includes("תכתוב לי את העבודה") ||
    lower.includes("תענה במקומי") ||
    lower.includes("solve for me") ||
    lower.includes("write it for me")
  );
}

// Part 18 §18.3 Agency Guard — semantic heuristic (length + solution markers)
function looksLikeFullAnswer(reply) {
  if (reply.length > 1200) return true;
  const solutionMarkers = ["הנה הפתרון המלא", "הפתרון הוא:", "הכתיבה המלאה:", "הנה התשובה המלאה"];
  const lower = reply.toLowerCase();
  return solutionMarkers.some(m => lower.includes(m));
}

// Part 18 §18.3 Language Gate — Post-model Hebrew ratio check
function hebrewCharRatio(text) {
  const stripped = text.replace(/\s/g, "");
  if (stripped.length === 0) return 1;
  const hebrewCount = (text.match(/[\u0590-\u05FF]/g) || []).length;
  return hebrewCount / stripped.length;
}

// Part 18 §18.4 Enforcement event logger (fire-and-forget)
function logEnforcementEvent(studentId, sessionId, botInstanceId, stage, eventData) {
  if (!studentId || studentId === "anonymous") return;
  getDB()
    .ref(`enforcement_log/${studentId}`)
    .push({
      ...eventData,
      timestamp:    Date.now(),
      botInstanceID: botInstanceId || null,
      sessionId:    sessionId || null,
      stage:        stage || null,
      userRole:     "student"
    })
    .catch(e => console.error("ENFORCEMENT LOG ERROR:", e.message));
}

const DEFAULT_PROMPT =
  "אתה עוזר לימודי סוקרטי וחם. ענה בעברית ושאל שאלות במקום לתת תשובות ישירות.";


// ─────────────────────────────────────────
// PART 17 §17.5 — TWO-STAGE AWARENESS MODEL
// ─────────────────────────────────────────

/**
 * Infer the current CONTEXT_STAGE from available session signals.
 *
 * CONTEXT_STAGE is dynamic — set by the bot at runtime from student behaviour.
 * Values: initial / understanding / attempting / struggling / ready / reflecting
 *
 * Signal priority (highest first):
 *  1. emotionalTrajectory from soft context — "frustrated" → struggling
 *  2. progress_flags — completions present → ready / reflecting
 *  3. miled_sub state — "submitted" / "completed" → reflecting
 *  4. session history depth → rough proxy for engagement stage
 *  5. session_count — cross-session experience
 */
function inferContextStage(sessionCtx, historyLength) {
  if (!sessionCtx) return "initial";

  const trajectory = sessionCtx.emotionalTrajectory ||
                     sessionCtx.tokenMetadata?.emotionalTrajectory || "";
  if (trajectory === "frustrated" || trajectory === "struggling") return "struggling";

  const miledSub = sessionCtx.miled_sub || "";
  if (miledSub === "completed") return "reflecting";
  if (miledSub === "submitted") return "ready";

  const flags = sessionCtx.progress_flags;
  const completedCount = flags && typeof flags === "object"
    ? Object.values(flags).filter(v => v === true).length
    : 0;
  if (completedCount >= 3) return "reflecting";
  if (completedCount >= 1) return "ready";

  // Use in-session history depth as a proxy for engagement stage
  if (historyLength >= 10) return "attempting";
  if (historyLength >= 4)  return "understanding";

  const sessionCount = sessionCtx.session_count || 0;
  if (sessionCount >= 3) return "understanding";

  return "initial";
}

/**
 * Build the Two-Stage Awareness context block (Part 17 §17.5).
 *
 * Injected only when at least one stage dimension is known.
 * Teaching Stage (T1_TOPIC_STAGE) is structural — declared by the instructor.
 * Learning Stage (CONTEXT_STAGE) is dynamic — inferred at runtime.
 *
 * The block instructs the bot:
 *  - Apply phase enforcement based on Teaching Stage (locked)
 *  - Modulate pacing/tone based on Learning Stage (adaptive)
 *  - NEVER change evaluation gate policy due to Learning Stage alone
 */
function buildTwoStageBlock(t1TopicStage, contextStage) {
  if (!t1TopicStage && !contextStage) return "";

  const lines = ["## מודל שני-השלבים (Part 17 §17.5)"];

  if (t1TopicStage)
    lines.push(`שלב הוראה (T1_TOPIC_STAGE): ${t1TopicStage} — מבני, נקבע על-ידי המרצה, נעול לאורך הסשן.`);

  if (contextStage) {
    const stageDescriptions = {
      initial:      "התחלה — הלומד טרם עיבד את החומר.",
      understanding:"הבנה — הלומד בונה מודל מנטלי ראשוני.",
      attempting:   "ניסיון — הלומד מנסה ליישם.",
      struggling:   "קושי — הלומד מתקשה; הכוון אמפתי לפני לחץ קוגניטיבי.",
      ready:        "מוכנות — הלומד מוכן למעבר שלב.",
      reflecting:   "רפלקציה — הלומד מסכם ומשייך."
    };
    const desc = stageDescriptions[contextStage] || contextStage;
    lines.push(`שלב למידה (CONTEXT_STAGE): ${contextStage} — ${desc}`);
  }

  if (t1TopicStage && contextStage) {
    const isStruggling = contextStage === "struggling";
    const isEvalPhase  = t1TopicStage === "evaluation" || t1TopicStage === "diagnostic";
    if (isEvalPhase && isStruggling) {
      lines.push("הנחיה: שלב הוראה = הערכה + שלב למידה = קושי. רכך קצב, הגבר תמיכה — אל תשנה את מדיניות שער ההערכה.");
    }
  }

  return lines.join("\n");
}


// ─────────────────────────────────────────
// PART 28 — OPAL POPULATION ROUTING
// ─────────────────────────────────────────

/**
 * OPAL (Online Pedagogical Adaptive Library) track routing.
 *
 * learner_population values → track assignment:
 *   "immigrant_m1" / "immigrant_m2" / "immigrant_m3" → Immigrant Track
 *   "haredi_h1"    / "haredi_h2"    / "haredi_h3"    → Haredi Track
 *   "general" or unknown → General Track (no special OPAL tools)
 *
 * Immigrant Track tools (Tiers 1–6, M-track):
 *   Word-in-Context, Register Ladder, Course Glossary, Connector Hunt,
 *   Register Upgrader (immigrant variant), Loanword Bridge (general),
 *   Source Analyzer, Source Synthesizer, Citation Coach
 *
 * Haredi Track tools (Tiers 1–6, H-track):
 *   Style Bridge, Sentence Splitter, Loanword Bridge (Talmudic),
 *   Register Upgrader (Haredi variant), Voice Identifier, Logic Judge
 *
 * The block instructs the LLM *which* OPAL tools are available —
 * it does NOT invoke them; the bot decides when to use them based on context.
 */
function buildOpalTrackBlock(learnerPopulation) {
  if (!learnerPopulation || learnerPopulation === "general") return "";

  const isImmigrant = learnerPopulation.startsWith("immigrant_");
  const isHaredi    = learnerPopulation.startsWith("haredi_");

  if (!isImmigrant && !isHaredi) return "";

  if (isImmigrant) {
    return `## מסלול OPAL — עולים (${learnerPopulation})
כלים פדגוגיים זמינים עבור לומד זה (מסלול עולים):
- Word-in-Context: מילה + הגדרה + 3 משפטים + תיקון 2 שגיאות נפוצות.
- Register Ladder: אותו רעיון ב-4 רמות: שפה יומיומית → פורמלית → אקדמית → מחקרית.
- Course Glossary: 20 מונחי מפתח של הקורס, מותאמים לרמת עברית + שפת האם.
- Connector Hunt: סימון מילות קישור לפי פונקציה (כי, אולם, לכן…).
- Register Upgrader (גרסת עולים): שפה יומיומית → 3 גרסאות (בסיסית/אקדמית/מחקרית).
- Source Analyzer: ניתוח קטע: טענה + ראיה + אמינות + שיטת ציטוט.
- Citation Coach: בדיקת שילוב ציטוטים + עמידה ב-APA + זרימה.
השתמש בכלים אלה כאשר הלומד מתקשה בשפה האקדמית. הפעל כלי בהתאם לצורך — אל תפרסם את רשימת הכלים ישירות ללומד.`;
  }

  // Haredi track
  return `## מסלול OPAL — חרדים (${learnerPopulation})
כלים פדגוגיים זמינים עבור לומד זה (מסלול חרדים):
- Style Bridge: טקסט ישיבתי → עברית אקדמית, זה-לצד-זה, עד 3 תיקונים בסיבוב.
- Sentence Splitter: משפט ישיבתי ארוך → ספירת רעיונות + משפטים אקדמיים קצרים.
- Loanword Bridge: מונח אקדמי זר + אטימולוגיה + גישור תלמודי מושגי.
- Register Upgrader (גרסת חרדים): המרת שפה ישיבתית → עברית אקדמית סטנדרטית.
- Voice Identifier: זיהוי קולות שונים בטקסט ומתחים ביניהם.
- Logic Judge: זיהוי קפיצות לוגיות, סתירות, ניתוק — דוח אבחוני.
השתמש בכלים אלה כאשר הלומד מתקשה במעבר לרגיסטר אקדמי. הפעל כלי בהתאם לצורך — אל תפרסם את רשימת הכלים ישירות ללומד.`;
}


// ─────────────────────────────────────────
// STUDENT MODEL (Part 33)
// ─────────────────────────────────────────

// Load skills_mastery snapshot for a student+course (fire-and-forget safe)
async function loadStudentModel(studentId, courseId) {
  if (!studentId || studentId === "anonymous" || !courseId) return null;
  try {
    const snap = await getDB()
      .ref(`skills_mastery/${studentId}/${courseId}`)
      .get();
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.error("STUDENT MODEL LOAD ERROR:", e.message);
    return null;
  }
}

// Build a Hebrew context block from the Student Model (Part 33 §33.1)
// Injects: skill_levels, error_patterns, attempt_history, learner_population, session_count, progress_flags
function buildStudentModelContextBlock(skillsMastery, sessionCtx) {
  const lines = [];

  if (skillsMastery && typeof skillsMastery === "object") {
    // skill_levels — list skills at "developing" or "proven" status (cap at 5)
    const skillSummaries = [];
    const weakPoints = [];
    for (const [skillId, data] of Object.entries(skillsMastery)) {
      if (!data || typeof data !== "object") continue;
      if (data.status && data.status !== "none") {
        skillSummaries.push(`${skillId}: ${data.status} (${data.mastery_pct ?? 0}%)`);
      }
      // error_patterns — collect recent_weak_points across skills
      if (Array.isArray(data.recent_weak_points)) {
        weakPoints.push(...data.recent_weak_points);
      }
    }
    if (skillSummaries.length > 0)
      lines.push("רמות שליטה: " + skillSummaries.slice(0, 5).join(", "));

    if (weakPoints.length > 0) {
      const unique = [...new Set(weakPoints)].slice(0, 3);
      lines.push("דפוסי שגיאה: " + unique.join(", "));
    }
  }

  // learner_population and session_count live in sessions/{studentId}/{courseId}
  if (sessionCtx?.learner_population)
    lines.push(`אוכלוסיית לומד: ${sessionCtx.learner_population}`);
  if (sessionCtx?.session_count)
    lines.push(`מספר שיחות קודמות: ${sessionCtx.session_count}`);

  // progress_flags — boolean milestone map
  const flags = sessionCtx?.progress_flags;
  if (flags && typeof flags === "object") {
    const done = Object.entries(flags).filter(([, v]) => v === true).map(([k]) => k);
    if (done.length > 0)
      lines.push("אבני דרך שהושלמו: " + done.join(", "));
  }

  return lines.length ? "## מודל הלומד\n" + lines.join("\n") : "";
}


// ─────────────────────────────────────────
// CONTEXT RESOLUTION
// ─────────────────────────────────────────

function resolveContextRules(engine, botConfig) {
  const kernelConfig = engine?.kernel || {};
  const binding = kernelConfig.binding?.contextEnforcement || {};
  const contextType = botConfig.function || "learning";
  const phase = botConfig.phase || "development";
  return binding[contextType]?.[phase] || {};
}


// ─────────────────────────────────────────
// BUILD FULL SYSTEM PROMPT
// ─────────────────────────────────────────

function buildFullSystemPrompt(engine, botConfig, hebrewLevel = null, contextBlock = "") {

  if (!botConfig) return null;

  const kernelConfig = engine?.kernel || {};
  const universal    = kernelConfig.universal || {};
  const contextRules = resolveContextRules(engine, botConfig);

  let kernelBlock = "";

  // ─── UNIVERSAL LAYER ───
  if (universal.epistemicIntegrity)
    kernelBlock += "שמור על יושרה אפיסטמית מלאה. אל תציג השערות כעובדות וסמן אי־ודאות. ";
  if (universal.preserveHumanResponsibility)
    kernelBlock += "הבוט אינו מחליף אחריות אנושית ואינו מקבל החלטות פורמליות. ";
  if (universal.noSkipPrinciple)
    kernelBlock += "אין לדלג על שלבים מבניים הכרחיים בתהליך למידה. ";
  if (universal.processIntegrity)
    kernelBlock += "התהליך קודם לתשובה. אין לעבור שלב ללא עיבוד מוקדם. ";
  if (universal.guidedSelfCorrection)
    kernelBlock += "אפשר תיקון עצמי לפני מתן פתרון ישיר. ";
  if (universal.evaluationRequiresExplicitCriteria)
    kernelBlock += "אין לבצע הערכה ללא קריטריונים מפורשים. ";
  if (universal.preventRoleDrift)
    kernelBlock += "אין לשנות תפקיד במהלך השיחה. ";

  // ─── CONTEXT LAYER ───
  if (contextRules.noFullSolution)
    kernelBlock += "אל תפתור משימות במלואן עבור לומד. ";
  if (contextRules.effortRegulation)
    kernelBlock += "ויסות מאמץ צריך להיות מדורג ותואם לרמת המשתמש. ";
  if (contextRules.cognitiveLoadAwareness)
    kernelBlock += "התאם עומס קוגניטיבי לרמת המשתמש והקשר השימוש. ";

  // ─── BOT LAYER ───
  const systemPrompt = botConfig.systemPrompt || DEFAULT_PROMPT;

  // ─── SOFT CONTEXT PROTOCOL LAYER (process bots only) ───
  // Automatically injected for guided/gated bots so individual SPs do not need
  // to repeat this instruction. Tells the LLM to emit tone + emotionalTrajectory
  // in every %%SESSION_UPDATE%%, which are then restored into the next context block.
  const isProcessBot = ["guided", "gated"].includes(botConfig.processMode);
  const softContextInstruction = isProcessBot
    ? `בכל תגובה, כלול בתוך %%SESSION_UPDATE%% את השדות הבאים (בנוסף לשדות המבניים הרגילים):
"tone": אחד מ: supportive / challenging / neutral / encouraging — תוך שיקוף הטון שהשתמשת בו בתגובה זו.
"emotionalTrajectory": אחד מ: improving / stable / struggling / frustrated / engaged — תוך שיקוף המצב הרגשי שהסטודנט מפגין.
שדות אלה משמשים לשחזור ההמשכיות בשיחה הבאה ואינם גלויים לסטודנט.`
    : "";

  // ─── HEBREW LEVEL LAYER ───
  const hebrewInstructions = {
    "he_a1_arabic": "הסטודנט דובר ערבית/צרפתית ברמת עברית A1. השתמש במשפטים קצרים, מילים פשוטות, והימנע ממושגים מורכבים.",
    "he_a2_arabic": "הסטודנט דובר ערבית/צרפתית ברמת עברית A2. שפה פשוטה אך אפשר להכניס מושגים אקדמיים בסיסיים.",
    "he_b1_haredi": "הסטודנט דובר עברית מקהילה חרדית עם אוצר מילים מוגבל. הימנע מסלנג ומושגים כלליים לא דתיים, השתמש בשפה ברורה ופשוטה.",
    "he_standard":  "הסטודנט דובר עברית ברמה רגילה."
  };

  const hebrewBlock = hebrewLevel && hebrewInstructions[hebrewLevel]
    ? hebrewInstructions[hebrewLevel]
    : "";

  return [
    kernel.trim(),              // Constitution layer
    kernelBlock.trim(),         // Policy layer
    systemPrompt.trim(),        // Bot layer
    softContextInstruction,     // Soft context protocol (process bots only)
    hebrewBlock,                // Hebrew level layer
    contextBlock                // Session context layer
  ].filter(Boolean).join("\n\n");

}


// ─────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────

export async function handler(event) {

  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "GET")
    return { statusCode: 200, headers, body: JSON.stringify({ status: "MilEd chat engine running" }) };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {

    const exportPrompt = event.queryStringParameters?.exportPrompt === "true";

    const {
      message          = "שלום",
      history          = [],
      botType          = null,
      studentId        = "anonymous",
      facultyId        = null,
      classId          = null,
      sessionId        = null,
      hebrewLevel      = null,
      currentStep      = null,          // ← active project stage sent by workspace.html
      ppCurrentStage   = null,
      isNewBotSession  = false,         // ← prevents loading stale history on bot switch
      skillMode        = false,         // ← true when request originates from skills hub
      waveId           = null,          // ← assessment wave (e.g. "wave_1_baseline", "wave_2_midterm")
      stationRoot      = "lesson",      // ← MiledState.root from lesson_view (Part 34 §34.6)
      t1TopicStage     = null,          // ← Teaching Stage (Part 17 §17.5) — declared by instructor at config or runtime
      ppStageTitle        = null,
      ppStageInstructions = null,
      ppStageTaskPrompt   = null,
      ppStageBotHint      = null,
      ppBotPolicy         = null
    } = JSON.parse(event.body || "{}");

    if (!botType)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "botType required" }) };

    // ─── PROCESS RUNTIME GUARD (pilot: critical_text_review only) ───
    const parsedBody = JSON.parse(event.body || "{}");
    if (isProcessRuntimeRequest(parsedBody)) {
      return await handleProcessRuntimeRequest(parsedBody, headers);
    }

    // ─── FACULTY VERIFICATION ───
    // Resolve facultyVerified server-side so clients cannot spoof access to institution-scoped bots.
    const facultyVerified = await verifyFacultyId(facultyId);
    const context = { facultyId, classId, studentId, facultyVerified };

    // ─── LOAD CONFIG ───
    const config = await loadConfig();
    if (!config)
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Configuration load failed" }) };

    const botConfig = await findBot(config, botType, context);
    if (!botConfig)
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Access denied or bot not found", botType }) };

    const engine = config.engine || {};

    // ─── EXPORT MODE ───
    if (exportPrompt) {
      const exportEngine = { ...engine, kernel: { ...(engine?.kernel || {}), private: {} } };
      const fullPrompt   = buildFullSystemPrompt(exportEngine, botConfig);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ botType, botName: botConfig.name, scope: botConfig.scope, owner: botConfig.owner, fullSystemPrompt: fullPrompt })
      };
    }

    // ─── LOAD SESSION CONTEXT ───
    const courseId   = classId;
    const [sessionCtx, studentSkillsMastery] = await Promise.all([
      loadSessionContext(studentId, courseId),
      // Skip Student Model load for anonymous users — loadStudentModel guards internally,
      // but avoiding the Promise.all entry removes the unnecessary async overhead.
      studentId && studentId !== "anonymous" ? loadStudentModel(studentId, courseId) : Promise.resolve(null)
    ]);
    // ppCurrentStage is the authoritative field for personal-project mode.
    // currentStep is accepted for backward compat but is always overridden when ppCurrentStage is present.
    const effectiveCurrentStep = ppCurrentStage != null ? ppCurrentStage : currentStep;
    if (stationRoot === "personal_project" && effectiveCurrentStep == null) {
      console.warn("[chat] personal_project stationRoot but no stage index — ppCurrentStage and currentStep are both null. Bot context will lack stage info.");
    }

    let contextBlock  = "";
    let savedHistory  = [];

    if (sessionCtx) {
      const parts = [];
      if (sessionCtx.studentName) parts.push(`שם הסטודנט: ${sessionCtx.studentName}`);
      if (sessionCtx.gender)      parts.push(`פנייה: ${sessionCtx.gender}`);
      if (sessionCtx.lastStage)   parts.push(`שלב אחרון: ${sessionCtx.lastStage}`);
      if (sessionCtx.nextStep)    parts.push(`הצעד הבא: ${sessionCtx.nextStep}`);
      // ─── RESTORE MILED_SUB (Part 34 §34.8) ───
      // Written by lesson_view.html when student submits work or completes peer review.
      // Lets the bot adapt its response to the student's current sprint state.
      if (sessionCtx.miled_sub)   parts.push(`מצב ספרינט: ${sessionCtx.miled_sub}`);

      // ─── RESTORE SOFT CONTEXT (process bots via %%SESSION_UPDATE%%) ───
      // tone and emotionalTrajectory may be written directly to the session node
      // by process bots (processMode: guided / gated) through %%SESSION_UPDATE%%.
      if (sessionCtx.tone)                parts.push(`טון מבוסס: ${sessionCtx.tone}`);
      if (sessionCtx.emotionalTrajectory) parts.push(`מסלול רגשי: ${sessionCtx.emotionalTrajectory}`);

      // ─── RESTORE TOKEN METADATA (MJ-3) ───
      // Soft/structural fields saved from <!-- META: --> in previous turns.
      // Structural fields (lastStage/nextStep/studentName/gender) are injected only
      // if %%SESSION_UPDATE%% did not already set them at the top level.
      // Known field families:
      //   structural: lastStage, nextStep, studentName, gender, openingComplete, genderConfirmed
      //   soft:       tone, emotionalTrajectory, form
      const meta = sessionCtx.tokenMetadata;
      if (meta && typeof meta === "object") {
        if (meta.lastStage   && !sessionCtx.lastStage)   parts.push(`שלב אחרון: ${meta.lastStage}`);
        if (meta.nextStep    && !sessionCtx.nextStep)    parts.push(`הצעד הבא: ${meta.nextStep}`);
        if (meta.studentName && !sessionCtx.studentName) parts.push(`שם הסטודנט: ${meta.studentName}`);
        if (meta.gender      && !sessionCtx.gender)      parts.push(`פנייה: ${meta.gender}`);
        if (meta.tone               && !sessionCtx.tone)                parts.push(`טון מבוסס: ${meta.tone}`);
        if (meta.emotionalTrajectory && !sessionCtx.emotionalTrajectory) parts.push(`מסלול רגשי: ${meta.emotionalTrajectory}`);
        if (meta.form)               parts.push(`סגנון שיחה: ${meta.form}`);
      }

      if (parts.length > 0)
        contextBlock = "## הקשר מהשיחה הקודמת\n" + parts.join("\n");

      // שחזר history אם הגיע ריק מה-frontend
      if (Array.isArray(sessionCtx.history) && sessionCtx.history.length > 0)
        savedHistory = sessionCtx.history;
    }

    // ─── INJECT CURRENT STEP ───
    // Adds the active project stage to the context block so the bot can enforce gating.
    if (effectiveCurrentStep != null) {
      const stepLine = `שלב נוכחי: ${effectiveCurrentStep}`;
      contextBlock = contextBlock
        ? contextBlock + "\n" + stepLine
        : "## הקשר\n" + stepLine;
    }

    const gatekeepingBlock = buildGatekeepingContextBlock(sessionCtx, effectiveCurrentStep);
    if (gatekeepingBlock) {
      contextBlock = [contextBlock, gatekeepingBlock].filter(Boolean).join("\n\n");
    }

    // ─── INJECT STUDENT MODEL CONTEXT (Part 33) ───
    // skill_levels, error_patterns, attempt_history, learner_population, session_count, progress_flags
    const studentModelBlock = buildStudentModelContextBlock(studentSkillsMastery, sessionCtx);
    if (studentModelBlock) {
      contextBlock = [contextBlock, studentModelBlock].filter(Boolean).join("\n\n");
    }

    // ─── INJECT OPAL TRACK INSTRUCTIONS (Part 28) ───
    // Routes the bot to the appropriate OPAL tool subset based on learner_population.
    // Immigrant track: language-foundation and genre tools.
    // Haredi track: style-conversion and conceptual-bridging tools.
    // No block injected for "general" population.
    const opalTrackBlock = buildOpalTrackBlock(sessionCtx?.learner_population);
    if (opalTrackBlock) {
      contextBlock = [contextBlock, opalTrackBlock].filter(Boolean).join("\n\n");
    }

    // ─── INJECT TWO-STAGE AWARENESS (Part 17 §17.5) ───
    // Teaching Stage (T1_TOPIC_STAGE): structural, declared by instructor.
    //   Source priority: request body → botConfig.t1TopicStage → null
    // Learning Stage (CONTEXT_STAGE): dynamic, inferred from session signals.
    // Both stages are injected together as a single block.
    const effectiveT1 = t1TopicStage || botConfig.t1TopicStage || null;
    const contextStage = inferContextStage(sessionCtx, savedHistory.length);
    const twoStageBlock = buildTwoStageBlock(effectiveT1, contextStage);
    if (twoStageBlock) {
      contextBlock = [contextBlock, twoStageBlock].filter(Boolean).join("\n\n");
    }

    // ─── INJECT COURSE CONTEXT ───
    // Tells the bot which course the student is in (e.g. optics vs management).
    const courseConfig = config.my_courses?.[courseId];
    if (courseConfig) {
      const courseLines = [`קורס: ${courseConfig.name}`];
      if (courseConfig.language)     courseLines.push(`שפת אם: ${courseConfig.language}`);
      if (courseConfig.hebrew_level) courseLines.push(`רמת עברית: ${courseConfig.hebrew_level}`);
      contextBlock = [contextBlock, "## הקשר הקורסי\n" + courseLines.join("\n")]
        .filter(Boolean).join("\n\n");
    }
    
    // ─── INJECT STATION MODE CONTEXT (Part 34 §34.6) ───
    // Derives bot mode from stationRoot and injects it into the context block.
    // This does not override botConfig; it adds a behavioural instruction layer on top.
    if (stationRoot && stationRoot !== "lesson") {
      const STATION_MODE_INSTRUCTIONS = {
        group: "## מצב תחנה\nמצב: עבודת קבוצה (GROUP_STATION). תפקידך: סייע לקבוצה לתכנן ולמבן את עבודתם המשותפת. עודד דיאלוג בין חברי הקבוצה. אל תיתן תשובות ישירות — כוון לתהליך.",
        team_project: "## מצב תחנה\nמצב: פרויקט צוות (TEAM_PROJECT_STATION). תפקידך: ליווי פרויקט רב-שלבי. עקוב אחר מטרות הפרויקט, בדוק שהסטודנטים מגיעים לאבני הדרך. שמור על רציפות בין פגישות.",
        personal_project: "## מצב תחנה\nמצב: פרויקט אישי — Gatekeeper (PERSONAL_PROJECT_STATION). תפקידך: לאמת כל שלב לפי הקריטריונים שהוגדרו. אל תאפשר מעבר לשלב הבא ללא אישור מפורש. בדוק שהתוצר עומד בדרישות לפני שאתה מאשר."
      };
      const stationInstruction = STATION_MODE_INSTRUCTIONS[stationRoot];
      if (stationInstruction) {
        contextBlock = [contextBlock, stationInstruction].filter(Boolean).join("\n\n");
      }

      // ─── INJECT personalProject.systemPromptOverride (Part 34 §34.7) ───
      // If the course defines a custom SP override for the personal project, append it
      // so the lecturer's specific instructions take precedence over the generic station text.
      if (stationRoot === "personal_project") {
        const ppSpOverride = courseConfig?.personalProject?.systemPromptOverride;
        if (ppSpOverride && typeof ppSpOverride === "string" && ppSpOverride.trim()) {
          contextBlock = [contextBlock, "## הנחיות פרויקט מותאמות\n" + ppSpOverride.trim()]
            .filter(Boolean).join("\n\n");
        }
      }
    }

    if (stationRoot === "personal_project") {
      const ppContextBlock = buildPersonalProjectContextBlock({
        currentStep: effectiveCurrentStep,
        ppStageTitle,
        ppStageInstructions,
        ppStageTaskPrompt,
        ppStageBotHint,
        ppBotPolicy,
        courseConfig,
        config
      });
      if (ppContextBlock) {
        contextBlock = [contextBlock, ppContextBlock].filter(Boolean).join("\n\n");
      }
    }

    // ─── SERVER-SIDE STAGE LOCK ───
    // If the bot is invoked with an active project step, check whether that step's
    // unlock state allows further interaction. States that block: "pending_review"
    // (submitted, awaiting lecturer approval) and "relocked" (rejected, resubmit required).
    // "unlocked" (approved) and null/undefined (step not yet submitted) are allowed through.
    // __INIT__ always passes so the opening sequence is never blocked.
    if (effectiveCurrentStep != null && message !== "__INIT__") {
      const stageKeyForLock = normalizeStageStorageKey(effectiveCurrentStep);
      const stepUnlockState = stageKeyForLock
        ? sessionCtx?.continuity?.unlockStates?.[stageKeyForLock]
        : null;
      if (stepUnlockState?.state && stepUnlockState.state !== "unlocked") {
        const lockReply = stepUnlockState.state === "pending_review"
          ? "ההגשה שלך התקבלה ✅ — ממתינים לאישור המרצה לפני שניתן להמשיך לשלב הבא."
          : "שלב זה נעול כרגע ⛔ — ממתינים לאישור המרצה לפני שניתן להמשיך.";
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: lockReply,
            botType, botName: botConfig.name, model: "stage-lock-guard", isThinking: false
          })
        };
      }
    }

    // ─── CLASSROOM MANAGER STAGE LOCK (Part 30) ───
    // Instructor can lock student-level stage advancement via cockpit lockStudent().
    // Reads sessions/{studentId}/{courseId}/stageLock (boolean).
    // Blocks any message except __INIT__ when stageLock === true.
    if (message !== "__INIT__" && sessionCtx?.stageLock === true) {
      const stageLockReply = "שלב זה נעול כרגע ⛔ — המרצה השהה את ההתקדמות. אנא המתן לפתיחה מחדש.";
      logEnforcementEvent(studentId, sessionId, botType, effectiveCurrentStep || "unknown", {
        eventType:          "stage_lock_classroom",
        principleTriggered: "No-Skip",
        userAttempt:        message.slice(0, 80),
        systemAction:       "blocked"
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: stageLockReply,
          botType, botName: botConfig.name, model: "stage-lock-guard", isThinking: false
        })
      };
    }

    // ─── GENDER GATE ───
    // If gender is not yet confirmed, block academic messages and redirect to opening.
    // Short messages (≤ 6 words) are allowed — the student is answering the bot's questions.
    // __INIT__ always passes through to trigger the opening sequence.
    const genderConfirmed = !!(sessionCtx?.genderConfirmed);
    if (message !== "__INIT__" && !genderConfirmed) {
      const wordCount = message.trim().split(/\s+/).length;
      if (wordCount > 6) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: "לפני שנתחיל, שאלה קטנה — איך תרצה שאפנה אליך? בלשון זכר או נקבה? 🙂",
            botType, botName: botConfig.name, model: "kernel-guard", isThinking: false
          })
        };
      }
    }

    // ─── DETECT SKILL ACTIVITY ───
    const isSkillActivity = skillMode || (botConfig._layer || "").startsWith("skills_");
    const activityType    = isSkillActivity ? "skill" : "course";

    // ─── LOG SESSION METADATA (once per session) ───
    if (sessionId) {
      await getDB().ref(`conversations/${sessionId}`).update({
        studentId,
        courseId,
        botType,
        type: activityType,
        updatedAt: Date.now()
      });
    }

    // ─── SKILL SESSION TRACKING — Multi-Wave Schema ───
    if (isSkillActivity && studentId && studentId !== "anonymous") {
      const effectiveWaveId  = waveId || "wave_1_baseline";
      const waveMessageCount = trimmedHistory.length + 1; // proxy for engagement depth
      const db = getDB();
      Promise.all([
        // Top-level summary record (quick reads for dashboard)
        db.ref(`skills_sessions/${studentId}/${botConfig.botType}`).update({
          lastActive:  Date.now(),
          botType:     botConfig.botType,
          botName:     botConfig.name,
          layer:       botConfig._layer,
          sessionId:   sessionId || null,
          latestWave:  effectiveWaveId
        }),
        // Wave-specific record (enables multi-wave comparison)
        db.ref(`skills_sessions/${studentId}/${botConfig.botType}/waves/${effectiveWaveId}`).update({
          waveId:       effectiveWaveId,
          sessionId:    sessionId || null,
          messageCount: waveMessageCount,
          lastActive:   Date.now()
        })
      ]).catch(e => console.error("SKILL SESSION SAVE ERROR:", e.message));
    }
    // ─── CONTEXT-BASED ENFORCEMENT ───
    const contextRules            = resolveContextRules(engine, botConfig);
    const effectiveNoFullSolution = contextRules.noFullSolution === true;

    const model       = selectModel(botConfig.botType);
    const temperature = engine.temperature ?? 0.7;
    const maxTokens   = engine.maxOutputTokens ?? 1024;

    const finalSystemPrompt = buildFullSystemPrompt(engine, botConfig, hebrewLevel, contextBlock);

    // אם ה-frontend שלח history — השתמש בו, אחרת טען מ-Firebase (אם לא בוט חדש)
    const effectiveHistory = (history && history.length > 0)
      ? history
      : (isNewBotSession ? [] : savedHistory);  // ← חדש: מניעת טעינת history ישן

    const trimmedHistory = effectiveHistory
      .filter(m => m && typeof m.content === "string")
      .slice(-14);

    if (effectiveNoFullSolution && detectFullSolutionRequest(message)) {
      logEnforcementEvent(studentId, sessionId, botType, effectiveCurrentStep || "unknown", {
        eventType:          "never_do_trigger",
        principleTriggered: "No-Substitution",
        userAttempt:        message.slice(0, 80),
        systemAction:       "blocked"
      });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "אני כאן כדי לעזור לך לחשוב ולבנות את התשובה בעצמך 🙂 מה כבר ניסית?",
          botType, botName: botConfig.name, model: "kernel-guard", isThinking: false
        })
      };
    }

    const messages = [
      { role: "system", content: finalSystemPrompt },
      ...trimmedHistory.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "MilEd.One"
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens })
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error("LLM ERROR:", response.status, raw);
      throw new Error("LLM request failed");
    }

    const data = JSON.parse(raw);

    let reply = data.choices?.[0]?.message?.content
      || "מצטער, לא הצלחתי לקבל תשובה כרגע.";

    if (effectiveNoFullSolution && looksLikeFullAnswer(reply)) {
      logEnforcementEvent(studentId, sessionId, botType, effectiveCurrentStep || "unknown", {
        eventType:          "agency_guard_triggered",
        principleTriggered: "No-Substitution",
        userAttempt:        message.slice(0, 80),
        systemAction:       "rewritten"
      });
      reply = "בוא נבנה את זה יחד 🙂 מהו הצעד הראשון לדעתך?";
    }

    // ─── LANGUAGE GATE (Post-model, Part 18 §18.3) ───
    // If output has fewer than 30% Hebrew characters when Hebrew output is required,
    // rewrite to a Hebrew fallback and log the violation.
    if (hebrewCharRatio(reply) < 0.30 && reply.length > 50) {
      logEnforcementEvent(studentId, sessionId, botType, effectiveCurrentStep || "unknown", {
        eventType:          "language_violation",
        principleTriggered: "Language-Gate",
        direction:          "post",
        detected:           "low_hebrew_ratio",
        required:           "he_standard",
        systemAction:       "rewritten"
      });
      reply = "מצטער, אנסה שוב בעברית. " + reply;
    }

    // ─── EXTRACT SESSION UPDATE ───
    let sessionUpdate = null;
    const sessionMatch = reply.match(/%%SESSION_UPDATE%%([\s\S]*?)%%END%%/);
    if (sessionMatch) {
      try {
        sessionUpdate = JSON.parse(sessionMatch[1].trim());
        reply = reply.replace(/%%SESSION_UPDATE%%[\s\S]*?%%END%%/, "").trim();
      } catch(e) {
        console.error("SESSION UPDATE PARSE ERROR:", e.message);
      }
    }

    // ─── EXTRACT skill_signal before it reaches sessions/ ───────────
    let skillSignal = null;
    if (sessionUpdate?.skill_signal) {
      skillSignal = sessionUpdate.skill_signal;
      delete sessionUpdate.skill_signal;
    }

    // ─── EXTRACT CONTINUATION TOKEN METADATA (MJ-3) ───
    // Strips the hidden HTML comment from the visible reply and saves it to Firebase.
    // Fields are injected back into the context block on the next request (see RESTORE TOKEN METADATA above).
    // Known structural fields: lastStage, nextStep, studentName, gender, openingComplete, genderConfirmed
    // Known soft fields: tone, emotionalTrajectory, form
    let tokenMetadata = null;
    const metaMatch = reply.match(/<!--\s*META:\s*(\{[\s\S]*?\})\s*-->/);
    if (metaMatch) {
      try {
        tokenMetadata = JSON.parse(metaMatch[1].trim());
        reply = reply.replace(/<!--\s*META:\s*\{[\s\S]*?\}\s*-->/, "").trim();
      } catch(e) {
        console.error("TOKEN META PARSE ERROR:", e.message);
      }
    }

    // ─── SAVE SESSION & LOG CONVERSATION ───
    const saveData = { lastBotType: botType, lastActive: Date.now() };
    if (sessionUpdate) Object.assign(saveData, sessionUpdate);

    // Derive genderConfirmed and openingComplete from session update fields
    if (sessionUpdate?.gender)      saveData.genderConfirmed = true;
    if (sessionUpdate?.studentName) saveData.openingComplete  = true;

    // Persist hidden token metadata if present
    if (tokenMetadata) saveData.tokenMetadata = tokenMetadata;

    // שמור את ה-history המעודכן (14 הודעות אחרונות)
    const updatedHistory = [
      ...trimmedHistory,
      { role: "user",      content: message },
      { role: "assistant", content: reply   }
    ].slice(-14);

    saveData.history = updatedHistory;

    await Promise.all([
      saveSessionContext(studentId, courseId, saveData),
      logMessage(sessionId, "user",      message),
      logMessage(sessionId, "assistant", reply)
    ]);

    // ─── MIRROR lastStage TO course_progress (fire-and-forget) ───
    // Keeps course_progress/{courseId}/{studentId}/lastStage in sync so the
    // lecturer's course_stage_summary endpoint can read it without scanning sessions/.
    const lastStageToMirror = tokenMetadata?.lastStage || sessionUpdate?.lastStage;
    if (lastStageToMirror && studentId && studentId !== "anonymous" && courseId) {
      getDB().ref(`course_progress/${courseId}/${studentId}`).update({
        studentId,
        lastStage: lastStageToMirror,
        lastStageUpdatedAt: Date.now()
      }).catch(e => console.error("COURSE_PROGRESS LAST_STAGE ERROR:", e.message));
    }

    // ─── WRITE skill_signal to skills_mastery (fire-and-forget) ─────
    if (skillSignal && studentId && studentId !== "anonymous") {
      (async () => {
        try {
          const db = getDB();
          const skillKey = String(skillSignal.skill || "").trim();
          if (!skillKey) return;

          const isCourseSignal =
            botType?.startsWith("hebrew_b_") ||
            botType === "skills_learning_full" ||
            COURSE_SKILLS.has(skillKey);

          const isProfessionalSignal =
            botType === "skills_employability_full" ||
            PROFESSIONAL_GROUPS.has(skillKey);

          const signalSource = isProfessionalSignal ? "professional" : "course";
          const payload = {
            rounds:        skillSignal.rounds,
            self:          skillSignal.self,
            score:         skillSignal.score,
            weak_point:    skillSignal.weak_point || null,
            feedback:      skillSignal.feedback || null,
            lesson:        effectiveCurrentStep || null,
            ts:            Date.now(),
            signal_source: signalSource,
            bot_type:      botType
          };

          const refs = [];
          if (isCourseSignal && courseId) {
            refs.push(db.ref(`skills_mastery/${studentId}/${courseId}/${skillKey}`));
          }
          if (isProfessionalSignal) {
            refs.push(db.ref(`skills_mastery/${studentId}/professional_map/${skillKey}`));
          }
          if (!refs.length && courseId) {
            refs.push(db.ref(`skills_mastery/${studentId}/${courseId}/${skillKey}`));
          }

          const globalRef = db.ref(`skills_mastery/${studentId}/global_map/${skillKey}`);

          const recalcAndUpdate = async (ref, meta = {}) => {
            await ref.child("signals").push(payload);
            const snap = await ref.child("signals").get();
            const signals = snap.exists() ? Object.values(snap.val()) : [];
            const total = signals.reduce((s, sig) => s + (sig.score || 0), 0);
            const max = signals.length * 3;
            const masteryPct = max > 0 ? Math.round((total / max) * 100) : 0;
            const status = masteryPct >= 70 ? "proven" : masteryPct >= 30 ? "developing" : "none";
            const recentWeakPoints = signals
              .filter(sig => sig.score === 0 && sig.weak_point)
              .map(sig => sig.weak_point)
              .slice(-5);

            await ref.update({
              mastery_pct: masteryPct,
              status,
              exposures: signals.length,
              last_ts: Date.now(),
              last_updated: `lesson_${effectiveCurrentStep || "?"}`,
              recent_weak_points: recentWeakPoints,
              ...meta
            });
          };

          await Promise.all([
            ...refs.map(ref => recalcAndUpdate(ref, { signal_source: signalSource })),
            recalcAndUpdate(globalRef, { signal_source: signalSource, last_course: courseId || null })
          ]);
        } catch (e) {
          console.error("SKILL SIGNAL WRITE ERROR:", e.message);
        }
      })();
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply, botType, botName: botConfig.name, model,
        isThinking:    model === MODEL_THINKING,
        sessionUpdate
      })
    };

  } catch (err) {
    console.error("CHAT ERROR:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }

};

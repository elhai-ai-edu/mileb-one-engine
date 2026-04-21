/**
 * architect_api.js — Bot Architect API Handler
 * MilEd.One | System version: 4.8
 *
 * Routes:
 *   POST /api/architect/export  — AR-1: Complete — writes bot to Firebase live_configs
 *   POST /api/architect/intake  — AR-2: Complete — parses Tally webhook → writes parsedVariables
 *   POST /api/architect/session — AR-2: Complete — reads parsedVariables → detects stress tests → returns bootstrap context
 *
 * FIREBASE PATHS:
 *   architect_sessions/{sessionId}/parsedVariables     — typed variable map from Tally
 *   architect_sessions/{sessionId}/stressTestQueue[]   — ordered list of triggered stress tests
 *   architect_sessions/{sessionId}/bootstrapMessage    — Hebrew context string for Bot Architect Stage 2
 *   architect_sessions/{sessionId}/status              — "intake_complete" | "bootstrapped"
 *   architect_sessions/{sessionId}/exports/json        — config snippet archive
 *   architect_sessions/{sessionId}/exports/text        — external SP archive
 *   admin/system/live_configs/{botId}                  — chat.js fallback reads this
 *   admin/system/pending_configs/{botId}               — audit trail
 *
 * AUTHORITY:
 *   docs/MASTER_LOGIC.md v4.2 Parts 28, 31–32
 *   docs/BOT_ARCHITECT_SP.md — Stage 1 cluster map, Stage 2 stress test catalog (ST-1 through ST-8)
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_SITE_URL = process.env.SITE_URL || process.env.URL || "http://localhost:8888";
const ARCHITECT_DEFAULT_MODEL = "google/gemini-2.0-flash-001";
const ARCHITECT_DEFAULT_THINKING_BUDGET = 2048;

// ─── Firebase init (same pattern as admin-auth.js) ───
function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

// ─── Re-authenticate requester ───
async function authenticate(db, username, password) {
  const snap = await db.ref(`admin/auth/${username}`).get();
  if (!snap.exists()) return null;
  const record = snap.val();
  if (record.password !== password) return null;
  if (record.role !== "superadmin") return null;
  return record;
}

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

async function loadArchitectBotConfig() {
  const configPath = path.resolve(process.cwd(), "config.json");
  if (fs.existsSync(configPath)) {
    const config = readJsonFile(configPath);
    return config?.system?.bot_architect || {};
  }

  const response = await fetch(new URL("/config.json", SITE_URL));
  if (!response.ok) {
    throw new Error(`Failed to load config.json: HTTP ${response.status}`);
  }

  const config = await response.json();
  return config?.system?.bot_architect || {};
}

function resolveSiteUrl(event) {
  const proto = event?.headers?.["x-forwarded-proto"] || event?.headers?.["X-Forwarded-Proto"] || "https";
  const host = event?.headers?.["x-forwarded-host"] || event?.headers?.["X-Forwarded-Host"] || event?.headers?.host;
  if (host) return `${proto}://${host}`;
  return DEFAULT_SITE_URL;
}

async function loadArchitectSystemPrompt(siteUrl) {
  const botConfig = await loadArchitectBotConfig();
  const promptPath = botConfig.systemPromptPath || "docs/BOT_ARCHITECT_SP.md";
  const resolvedPath = path.resolve(process.cwd(), promptPath);

  if (fs.existsSync(resolvedPath)) {
    return {
      botConfig,
      systemPrompt: readTextFile(resolvedPath)
    };
  }

  const response = await fetch(new URL(`/${promptPath.replace(/^\/+/, "")}`, siteUrl));
  if (!response.ok) {
    throw new Error(`Failed to load prompt file: HTTP ${response.status}`);
  }

  return {
    botConfig,
    systemPrompt: await response.text()
  };
}

function normalizeArchitectHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((entry) => entry && typeof entry.content === "string" && entry.content.trim())
    .map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content.trim()
    }))
    .slice(-20);
}

function resolveArchitectUserMessage(rawMessage, bootstrapMessage) {
  const message = (rawMessage || "").trim();

  if (message === "__INIT__") {
    return bootstrapMessage || "התחל בשלב 1. אין כרגע נתוני שאלון זמינים, ולכן עליך לאסוף את נתוני התכנון מהמרצה בשיחה, שאלה אחת בכל פעם, בעברית.";
  }

  if (message === "__INIT_FREEFORM__") {
    return "התחל בשלב 1 של איסוף הנתונים ללא שאלון מוקדם. עליך להוביל את המרצה דרך האשכולות הנדרשים, שאלה אחת בכל פעם, בעברית, עד שתהיה מפת משתנים מלאה מספיק למעבר לשלב 2.";
  }

  return message;
}

async function loadArchitectSessionContext(db, sessionId) {
  if (!sessionId) return { bootstrapMessage: null, parsedVariables: null };

  const [bootstrapSnap, variablesSnap] = await Promise.all([
    db.ref(`architect_sessions/${sessionId}/bootstrapMessage`).get(),
    db.ref(`architect_sessions/${sessionId}/parsedVariables`).get()
  ]);

  return {
    bootstrapMessage: bootstrapSnap.exists() ? bootstrapSnap.val() : null,
    parsedVariables: variablesSnap.exists() ? variablesSnap.val() : null
  };
}

async function saveArchitectConversation(db, sessionId, messages, reply) {
  if (!sessionId) return;

  const transcript = [
    ...messages
      .filter((entry) => entry.role !== "system")
      .map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "assistant", content: reply }
  ].slice(-40);

  await db.ref(`architect_sessions/${sessionId}/conversation`).set({
    updatedAt: new Date().toISOString(),
    messages: transcript
  });
}

async function handleArchitectChat(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { message, history = [], sessionId } = body;

  if (!message || typeof message !== "string") {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "message is required" }) };
  }

  if (!OPENROUTER_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "OpenRouter is not configured" }) };
  }

  const siteUrl = resolveSiteUrl(event);

  let botConfig;
  let systemPrompt;
  try {
    ({ botConfig, systemPrompt } = await loadArchitectSystemPrompt(siteUrl));
  } catch (error) {
    console.error("ARCHITECT CHAT: failed to load system prompt:", error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to load Architect system prompt" }) };
  }

  const db = getDB();
  let sessionContext;
  try {
    sessionContext = await loadArchitectSessionContext(db, sessionId);
  } catch (error) {
    console.error("ARCHITECT CHAT: failed to load session context:", error.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to load Architect session context" }) };
  }

  const normalizedHistory = normalizeArchitectHistory(history);
  const userMessage = resolveArchitectUserMessage(message, sessionContext.bootstrapMessage);
  const messages = [
    { role: "system", content: systemPrompt },
    ...normalizedHistory,
    { role: "user", content: userMessage }
  ];

  const model = botConfig.model || ARCHITECT_DEFAULT_MODEL;
  const maxTokens = Math.max(Number(botConfig.thinkingBudget || ARCHITECT_DEFAULT_THINKING_BUDGET), 512);

  let response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": siteUrl,
        "X-Title": "MilEd.One"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: maxTokens
      })
    });
  } catch (error) {
    console.error("ARCHITECT CHAT: OpenRouter request failed:", error.message);
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Failed to reach Architect model" }) };
  }

  const raw = await response.text();
  if (!response.ok) {
    console.error("ARCHITECT CHAT: LLM error:", response.status, raw);
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Architect model request failed" }) };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    console.error("ARCHITECT CHAT: invalid LLM JSON:", error.message);
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Invalid Architect model response" }) };
  }

  const reply = data.choices?.[0]?.message?.content?.trim()
    || "מצטער, לא הצלחתי להחזיר תשובה כרגע.";

  try {
    await saveArchitectConversation(db, sessionId, messages, reply);
  } catch (error) {
    console.error("ARCHITECT CHAT: failed to save conversation:", error.message);
  }

  // ─── STRESS TEST LOG (Part 31 §31.3 Stage 2) ───
  // The Bot Architect signals stress test resolution via %%ST_RESOLVED:ST-N%% tokens in its reply.
  // Each resolved token is appended to architect_sessions/{sessionId}/stressTestLog[].
  if (sessionId) {
    const stResolvedMatches = [...reply.matchAll(/%%ST_RESOLVED:(ST-\d+)%%/g)];
    if (stResolvedMatches.length > 0) {
      const logEntries = stResolvedMatches.map(m => ({
        stressTestId: m[1],
        resolvedAt:   new Date().toISOString(),
        turn:         messages.filter(x => x.role === "user").length
      }));
      db.ref(`architect_sessions/${sessionId}/stressTestLog`)
        .transaction(existing => {
          const current = Array.isArray(existing) ? existing : [];
          return [...current, ...logEntries];
        })
        .catch(e => console.error("ARCHITECT CHAT: stressTestLog write error:", e.message));
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      reply,
      botType: botConfig.botId || "bot_architect",
      botName: botConfig.name || "בונה הבוטים"
    })
  };
}

// =============================================================================
// SLUG → VARIABLE MAP (AR-2: Tally field reference → typed variable)
// Slug conventions are set in the Tally form builder as field references.
// Authority: docs/MASTER_LOGIC.md Part 28 + architect_api.js header contract
// =============================================================================

const SLUG_TO_VARIABLE = {
  // ─── Cluster A: Mission & Scope ───
  session_id:               { variable: "SESSION_ID",          type: "DYNAMIC"    },
  cluster_a_name:           { variable: "BOT_NAME",            type: "CONFIG"     },
  cluster_a_function:       { variable: "BOT_FUNCTION",        type: "CONFIG"     },  // learning|teaching|institutional
  cluster_a_phase:          { variable: "PHASE",               type: "CONFIG"     },  // diagnostic|development|reflection|design|analytics
  cluster_a_mission:        { variable: "MISSION_CLAUSE",      type: "CONFIG"     },
  cluster_a_bot_scope:      { variable: "BOT_SCOPE",           type: "CONFIG"     },  // global|institution|faculty_private|course_specific
  cluster_a_scope_limits:   { variable: "SCOPE_LIMITS",        type: "BIND"       },
  cluster_a_enforcement:    { variable: "ENFORCEMENT_LEVEL",   type: "BIND"       },  // soft|medium|strict

  // ─── Cluster B: Audience & Context ───
  cluster_b_language_mode:  { variable: "LANGUAGE_MODE",       type: "BIND"       },  // he_a1_arabic|he_a2_arabic|he_b1_haredi|he_standard
  cluster_b_hebrew_level:   { variable: "HEBREW_LEVEL",        type: "BIND"       },  // alias for LANGUAGE_MODE
  cluster_b_audience:       { variable: "AUDIENCE_LEVEL",      type: "CONFIG"     },
  cluster_b_entry_state:    { variable: "ENTRY_STATE",         type: "CONFIG"     },
  cluster_b_population:     { variable: "LEARNER_POPULATION",  type: "CONFIG"     },

  // ─── Cluster C: Interaction Mode ───
  cluster_c_interaction:    { variable: "INTERACTION_MODE",    type: "STRUCT"     },  // short|long|dialogic|socratic|informational|scaffolding|gated|emotional
  cluster_c_time_horizon:   { variable: "TIME_HORIZON",        type: "CONFIG"     },
  cluster_c_data_tracking:  { variable: "DATA_TRACKING",       type: "CONFIG"     },

  // ─── Cluster D: Persona & Pacing ───
  cluster_d_persona:        { variable: "PERSONA",             type: "CONFIG"     },
  cluster_d_identity:       { variable: "IDENTITY_SENTENCE",   type: "EXPRESSIVE" },
  cluster_d_stuck:          { variable: "STUCK_PROTOCOL",      type: "CONFIG"     },
  cluster_d_emotion_task:   { variable: "EMOTION_TASK_PRIORITY", type: "SOFT"     },
  cluster_d_pacing:         { variable: "PACING_MODE",         type: "SOFT"       },  // fast|adaptive|slow

  // ─── Cluster E: Boundaries & Ethics ───
  cluster_e_never_do:       { variable: "NEVER_DO_LIST",       type: "BIND"       },
  cluster_e_agency:         { variable: "AGENCY_LEVEL",        type: "BIND"       },  // guided|shared|learner_led
  cluster_e_refusal:        { variable: "REFUSAL_STYLE",       type: "CONFIG"     },
  cluster_e_escalation:     { variable: "ESCALATION_RULE",     type: "CONFIG"     },

  // ─── Cluster F: Process & Flow ───
  cluster_f_process_type:   { variable: "PROCESS_TYPE",        type: "STRUCT"     },  // socratic|scaffolding|gated|informational|emotional|guided|adaptive
  cluster_f_stages:         { variable: "STAGES",              type: "STRUCT"     },
  cluster_f_mandatory:      { variable: "MANDATORY_STAGES",    type: "BIND"       },
  cluster_f_readiness:      { variable: "READINESS_SIGNALS",   type: "STRUCT"     },

  // ─── Cluster G: Adaptive Regulation ───
  cluster_g_metacognitive:  { variable: "METACOGNITIVE_TRIGGER",   type: "SOFT"   },
  cluster_g_error_norm:     { variable: "ERROR_NORMALIZATION",      type: "SOFT"   },
  cluster_g_overload:       { variable: "OVERLOAD_DETECTION",       type: "SOFT"   },
  cluster_g_regulation:     { variable: "REGULATION_MODE",          type: "SOFT"   },

  // ─── Cluster H: Knowledge & Closure ───
  cluster_h_kb_domains:     { variable: "KB_DOMAINS",          type: "CONFIG"     },
  cluster_h_forbidden:      { variable: "FORBIDDEN_KNOWLEDGE", type: "BIND"       },
  cluster_h_uncertainty:    { variable: "UNCERTAINTY_POLICY",  type: "BIND"       },  // ask|refer|qualify|decline
  cluster_h_closure_goal:   { variable: "CLOSURE_GOAL",        type: "CONFIG"     },

  // ─── Cluster I: Evaluation ───
  cluster_i_eval_policy:    { variable: "EVALUATION_POLICY",   type: "BIND"       },  // none|feedback-only|rubric-based
  cluster_i_rubric_status:  { variable: "RUBRIC_STATUS",       type: "BIND"       },  // none|draft|approved
  cluster_i_academic_level: { variable: "ACADEMIC_LEVEL",      type: "CONFIG"     },
  cluster_i_data_tracking:  { variable: "DATA_TRACKING_LEVEL", type: "CONFIG"     }
};

// =============================================================================
// TALLY PAYLOAD PARSER
// =============================================================================

/**
 * Parse a Tally webhook payload into a typed variable map.
 * Tally webhook shape:
 *   { eventType: "FORM_RESPONSE", data: { fields: [{ key, label, type, value }] } }
 * The field `key` is the custom reference set in Tally form builder (= the slug).
 * Returns { variables: { VARIABLE_NAME: { value, type, slug } }, sessionId, rawFields }
 */
function parseTallyPayload(body) {
  const fields = body?.data?.fields || body?.fields || [];

  const fieldMap = {};
  for (const f of fields) {
    const slug = f.key || f.slug || f.ref || "";
    if (slug) fieldMap[slug] = f.value ?? f.answer ?? "";
  }

  const variables = {};
  for (const [slug, meta] of Object.entries(SLUG_TO_VARIABLE)) {
    if (slug === "session_id") continue;  // handled separately
    if (fieldMap[slug] !== undefined) {
      variables[meta.variable] = {
        value: fieldMap[slug],
        type:  meta.type,
        slug
      };
    }
  }

  // Extract sessionId from a hidden field if present
  const sessionIdFromForm = fieldMap["session_id"] || null;

  return { variables, sessionIdFromForm, rawFieldCount: fields.length };
}

// =============================================================================
// STRESS TEST DETECTION
// Reference: docs/BOT_ARCHITECT_SP.md — STAGE 2, Stress Test Catalog (ST-1–ST-8)
// Priority order: BIND conflicts → STRUCT conflicts → CONFIG conflicts → Always
// Max 4 stress tests per session.
// =============================================================================

/**
 * Detect which stress tests apply given the parsed variable map.
 * @param {Object} vars - { VARIABLE_NAME: { value, type } }
 * @returns {Array} Ordered array of stress test IDs, max 4.
 */
function detectStressTests(vars) {
  const get = (name) => (vars[name]?.value ?? "").toString().toLowerCase().trim();

  const pacingMode      = get("PACING_MODE");
  const processType     = get("PROCESS_TYPE");
  const interactionMode = get("INTERACTION_MODE");
  const evalPolicy      = get("EVALUATION_POLICY");
  const rubricStatus    = get("RUBRIC_STATUS");
  const enforcementLvl  = get("ENFORCEMENT_LEVEL");
  const phase           = get("PHASE");
  const readinessSignals = get("READINESS_SIGNALS");

  // Infer DNA from process_type + interaction_mode
  const isSocratic    = processType === "socratic"     || interactionMode === "socratic";
  const isScaffolding = processType === "scaffolding";
  const isGatekeeper  = processType === "gated"        || interactionMode === "gated";
  const isInformational = processType === "informational" || interactionMode === "informational";
  const isEmotional   = processType === "emotional"    || interactionMode === "emotional";
  const isLongMode    = interactionMode === "long";
  const isShortMode   = interactionMode === "short";
  const isDevelopmentPhase = phase === "development";

  const triggered = [];

  // ─── BIND priority ─────────────────────────────────────────────────────────

  // ST-2: Evaluative bot without rubric (blocks Stage 3 — highest priority)
  if (evalPolicy && evalPolicy !== "none" && evalPolicy !== "" &&
      (!rubricStatus || rubricStatus === "none" || rubricStatus === "")) {
    triggered.push("ST-2");
  }

  // ST-3: Gatekeeper without exit conditions
  if (isGatekeeper && (!readinessSignals || readinessSignals === "" || readinessSignals === "[]")) {
    triggered.push("ST-3");
  }

  // ─── STRUCT priority ───────────────────────────────────────────────────────

  // ST-5: Informational bot in long mode
  if (isInformational && isLongMode) {
    triggered.push("ST-5");
  }

  // ST-6: Scaffolding in short mode
  if (isScaffolding && isShortMode) {
    triggered.push("ST-6");
  }

  // ─── CONFIG priority ───────────────────────────────────────────────────────

  // ST-1: DNA/pace mismatch — Socratic + Fast pacing
  if (isSocratic && pacingMode === "fast") {
    triggered.push("ST-1");
  }

  // ST-4: Emotional support + strict enforcement in development phase
  if (isEmotional && enforcementLvl === "strict" && isDevelopmentPhase) {
    triggered.push("ST-4");
  }

  // ─── Always triggers ───────────────────────────────────────────────────────

  // ST-7: Phase logic verification — always required
  if (phase) {
    triggered.push("ST-7");
  }

  // ST-8: Confirmation rule offer — for Socratic/Scaffolding in development phase
  if ((isSocratic || isScaffolding) && isDevelopmentPhase) {
    triggered.push("ST-8");
  }

  // Cap at 4, preserving priority order
  return triggered.slice(0, 4);
}

// =============================================================================
// BOOTSTRAP MESSAGE BUILDER
// Produces the Hebrew context string that the frontend sends as the first
// message to the Bot Architect, replacing "__INIT__" when Tally data exists.
// The Bot Architect reads this, acknowledges Stage 1 is complete, and opens Stage 2.
// =============================================================================

function buildBootstrapMessage(vars, stressTestQueue) {
  const v = (name) => vars[name]?.value ?? "";

  const botName        = v("BOT_NAME")         || "(לא הוגדר)";
  const botFunction    = v("BOT_FUNCTION")      || "(לא הוגדר)";
  const phase          = v("PHASE")             || "(לא הוגדר)";
  const missionClause  = v("MISSION_CLAUSE")    || "(לא הוגדר)";
  const audienceLevel  = v("AUDIENCE_LEVEL")    || "(לא הוגדר)";
  const languageMode   = v("LANGUAGE_MODE") || v("HEBREW_LEVEL") || "(לא הוגדר)";
  const population     = v("LEARNER_POPULATION") || "(לא הוגדר)";
  const interactionMode = v("INTERACTION_MODE")  || "(לא הוגדר)";
  const processType    = v("PROCESS_TYPE")       || "(לא הוגדר)";
  const pacingMode     = v("PACING_MODE")        || "(לא הוגדר)";
  const evalPolicy     = v("EVALUATION_POLICY")  || "none";
  const rubricStatus   = v("RUBRIC_STATUS")      || "none";
  const enforcementLvl = v("ENFORCEMENT_LEVEL")  || "(לא הוגדר)";
  const scopeLimits    = v("SCOPE_LIMITS")       || "(לא הוגדר)";
  const neverDoList    = v("NEVER_DO_LIST")       || "(לא הוגדר)";

  const stressCount    = stressTestQueue.length;
  const firstST        = stressTestQueue[0] ?? null;

  // Phase-specific confirmation for ST-7
  const phaseNote = {
    development: "אכיפת No-Skip מלאה, אין פתרון מלא ללומד",
    diagnostic:  "מדידה בלבד — אכיפה קוגניטיבית מינימלית",
    reflection:  "אכיפה רכה — שילוב ויצירת משמעות",
    design:      "שלב עיצוב — אין אכיפה על חבר הסגל",
    analytics:   "שלב ניתוח — אין אכיפה על הלומד"
  }[phase.toLowerCase()] ?? "ודא שהשלב מתאים לקהל היעד";

  let msg = `[TALLY_INTAKE_CONTEXT]
קיבלתי את נתוני השאלון. להלן סיכום ראשוני של ההחלטות שנאספו. אנא המשך ישירות לשלב 2 — בחינת המתחים הפדגוגיים.

**זהות הבוט:**
- שם: ${botName}
- תפקיד: ${botFunction} | שלב: ${phase}
- משימה: ${missionClause}
- הערה לשלב: ${phaseNote}

**קהל יעד:**
- רמת קהל: ${audienceLevel}
- שפה / עברית: ${languageMode}
- אוכלוסייה: ${population}

**עיצוב האינטראקציה:**
- סגנון: ${interactionMode} | סוג תהליך: ${processType}
- קצב: ${pacingMode}
- אכיפה: ${enforcementLvl}

**מדיניות הערכה:**
- מדיניות: ${evalPolicy} | סטטוס רובריקה: ${rubricStatus}

**גבולות:**
- הגבלות תחום: ${scopeLimits}
- Never-Do: ${neverDoList}
`;

  if (stressCount === 0) {
    msg += `
לא זוהו מתחים עיצוביים. ניתן לעבור ישירות לשלב 3 — בניית ה-SP.
האם אתה מאשר שאני יכול להתחיל להרכיב?`;
  } else {
    msg += `
זיהיתי **${stressCount} מתחים עיצוביים** שיש לבחון (${stressTestQueue.join(", ")}).
נתחיל מהחשוב ביותר: **${firstST}**.`;
  }

  return msg;
}

// =============================================================================
// HANDLER: Tally Webhook Intake (AR-2)
// POST /api/architect/intake
// Called by Tally's webhook when a form is submitted.
// =============================================================================

async function handleTallyIntake(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Support both Tally webhook shape { eventType, data } and raw { fields } for testing
  const eventType = body?.eventType;
  if (eventType && eventType !== "FORM_RESPONSE") {
    // Tally sends pings with other eventTypes — acknowledge and ignore
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: "Non-response event acknowledged" }) };
  }

  const { variables, sessionIdFromForm, rawFieldCount } = parseTallyPayload(body);

  if (rawFieldCount === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "No fields found in Tally payload", hint: "Ensure fields have custom references (slugs) set in Tally form builder" })
    };
  }

  // sessionId priority:
  //   1. Tally submissionId — stable, unique, matches redirect URL {{submission_id}}
  //   2. Hidden field session_id — pre-filled from ?session_id= URL param if set by studio
  //   3. Generated UUID — fallback for direct/test calls
  const submissionId = body?.data?.submissionId || body?.data?.responseId || null;
  const sessionId = submissionId || sessionIdFromForm
    || ("tally_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16));

  const db = getDB();
  const now = new Date().toISOString();

  try {
    await Promise.all([
      db.ref(`architect_sessions/${sessionId}/parsedVariables`).set(variables),
      db.ref(`architect_sessions/${sessionId}/status`).set("intake_complete"),
      db.ref(`architect_sessions/${sessionId}/createdAt`).set(now),
      db.ref(`architect_sessions/${sessionId}/tallyMeta`).set({
        eventType:       eventType || null,
        responseId:      body?.data?.responseId || null,
        submissionId:    body?.data?.submissionId || null,
        formId:          body?.data?.formId || null,
        formName:        body?.data?.formName || null,
        studioSessionId: sessionIdFromForm || null,  // cross-ref to studio sessionId if provided
        receivedAt:      now
      })
    ]);
  } catch (e) {
    console.error("ARCHITECT INTAKE: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to write session to Firebase" }) };
  }

  console.log(`ARCHITECT INTAKE: sessionId=${sessionId}, variables=${Object.keys(variables).length}, fields=${rawFieldCount}`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      sessionId,
      variableCount: Object.keys(variables).length,
      message: `Parsed ${Object.keys(variables).length} variables from ${rawFieldCount} fields`
    })
  };
}

// =============================================================================
// HANDLER: Session Bootstrap (AR-2)
// POST /api/architect/session  — body: { sessionId }
// Called by architect_studio.html after Tally completes and before chat opens.
// Reads parsedVariables, detects stress tests, builds bootstrap context.
// =============================================================================

async function handleBootstrapSession(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { sessionId } = body;

  if (!sessionId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "sessionId is required" }) };
  }

  const db = getDB();

  // Read parsedVariables from Firebase
  let variables;
  try {
    const snap = await db.ref(`architect_sessions/${sessionId}/parsedVariables`).get();
    if (!snap.exists()) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Session not found or intake not yet complete",
          hint: "Ensure handleTallyIntake has been called first for this sessionId"
        })
      };
    }
    variables = snap.val();
  } catch (e) {
    console.error("ARCHITECT BOOTSTRAP: Firebase read error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to read session from Firebase" }) };
  }

  // Detect stress tests from variable map
  const stressTestQueue = detectStressTests(variables);

  // Build Hebrew bootstrap message
  const bootstrapMessage = buildBootstrapMessage(variables, stressTestQueue);

  // Write results back to Firebase
  try {
    await Promise.all([
      db.ref(`architect_sessions/${sessionId}/stressTestQueue`).set(stressTestQueue),
      db.ref(`architect_sessions/${sessionId}/bootstrapMessage`).set(bootstrapMessage),
      db.ref(`architect_sessions/${sessionId}/status`).set("bootstrapped"),
      db.ref(`architect_sessions/${sessionId}/bootstrappedAt`).set(new Date().toISOString())
    ]);
  } catch (e) {
    console.error("ARCHITECT BOOTSTRAP: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to write bootstrap data to Firebase" }) };
  }

  console.log(`ARCHITECT BOOTSTRAP: sessionId=${sessionId}, stressTests=[${stressTestQueue.join(",")}]`);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      sessionId,
      stressTestQueue,
      stressTestCount: stressTestQueue.length,
      bootstrapMessage
    })
  };
}

// =============================================================================
// HANDLER: Export (AR-1 — complete)
// =============================================================================

function validateConfigSnippet(snippet) {
  const errors = [];

  if (!snippet.name || typeof snippet.name !== "string" || !snippet.name.trim())
    errors.push({ field: "name", layer: "Layer 1: Mission and Scope", error: "name is required and must be a non-empty string" });

  if (!snippet.botType || typeof snippet.botType !== "string" || !snippet.botType.trim())
    errors.push({ field: "botType", layer: "Layer 1: Mission and Scope", error: "botType is required and must be a non-empty string" });

  const validFunctions = ["learning", "teaching", "institutional"];
  if (!snippet.function || !validFunctions.includes(snippet.function))
    errors.push({ field: "function", layer: "Layer 1: Mission and Scope", error: `function must be one of: ${validFunctions.join(", ")}` });

  const validPhases = ["diagnostic", "development", "reflection", "design", "analytics"];
  if (!snippet.phase || !validPhases.includes(snippet.phase))
    errors.push({ field: "phase", layer: "Layer 1: Mission and Scope", error: `phase must be one of: ${validPhases.join(", ")}` });

  if (!snippet.systemPrompt || typeof snippet.systemPrompt !== "string" || snippet.systemPrompt.length < 200)
    errors.push({ field: "systemPrompt", layer: "Layer 2-6: System Prompt body", error: "systemPrompt is required and must be at least 200 characters" });

  const validScopes = ["global", "institution", "faculty_private", "course_specific"];
  if (!snippet.scope || !validScopes.includes(snippet.scope))
    errors.push({ field: "scope", layer: "Layer 7: Scope and Access", error: `scope must be one of: ${validScopes.join(", ")}` });

  if (!snippet.owner || typeof snippet.owner !== "string" || !snippet.owner.trim())
    errors.push({ field: "owner", layer: "Layer 7: Scope and Access", error: "owner is required and must be a non-empty string" });

  if (snippet.thinkingBudget !== undefined && (typeof snippet.thinkingBudget !== "number" || snippet.thinkingBudget < 512))
    errors.push({ field: "thinkingBudget", layer: "Engine Config", error: "thinkingBudget must be a number >= 512" });

  return errors;
}

async function handleExport(event) {
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { sessionId, configSnippet, externalSP, requesterUsername, requesterPassword } = body;

  if (!sessionId || !configSnippet || !requesterUsername || !requesterPassword)
    return { statusCode: 400, headers, body: JSON.stringify({ error: "sessionId, configSnippet, requesterUsername, requesterPassword are required" }) };

  const db = getDB();
  let requester;
  try {
    requester = await authenticate(db, requesterUsername, requesterPassword);
  } catch (e) {
    console.error("ARCHITECT EXPORT: Firebase auth error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Auth service unavailable" }) };
  }
  if (!requester)
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid credentials or insufficient role" }) };

  const validationErrors = validateConfigSnippet(configSnippet);
  if (validationErrors.length > 0)
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Config snippet validation failed", validationErrors }) };

  const botId = configSnippet.botType
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 64);

  const now = new Date().toISOString();
  const botRecord = { ...configSnippet, createdAt: now, createdBy: requesterUsername, sessionId, source: "architect_export" };

  try {
    await Promise.all([
      db.ref(`admin/system/pending_configs/${botId}`).set(botRecord),
      db.ref(`admin/system/live_configs/${botId}`).set(botRecord),
      db.ref(`architect_sessions/${sessionId}/exports/json`).set(configSnippet),
      db.ref(`architect_sessions/${sessionId}/exports/text`).set(externalSP || null)
    ]);
  } catch (e) {
    console.error("ARCHITECT EXPORT: Firebase write error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to save bot to Firebase" }) };
  }

  let devMessage = null;
  if (process.env.IS_DEV === "true") {
    try {
      const configPath = path.resolve(process.cwd(), "config.json");
      const raw = fs.readFileSync(configPath, "utf8");
      const cfg = JSON.parse(raw);
      if (!cfg.universal) cfg.universal = {};
      if (!cfg.universal.items) cfg.universal.items = {};
      cfg.universal.items[botId] = botRecord;
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), "utf8");
      devMessage = `Bot written to config.json (IS_DEV). botId: ${botId}`;
      console.log("ARCHITECT EXPORT:", devMessage);
    } catch (e) {
      console.warn("ARCHITECT EXPORT: IS_DEV config.json write failed (non-fatal):", e.message);
    }
  }

  if (process.env.IS_DEV !== "true" && process.env.NETLIFY_BUILD_HOOK_URL) {
    try {
      fetch(process.env.NETLIFY_BUILD_HOOK_URL, { method: "POST" }).catch(() => {});
    } catch { /* fire-and-forget */ }
  }

  const message = devMessage
    ?? `Bot saved to Firebase live_configs. botId: ${botId}. Will be available within 60 seconds via chat.js fallback.`;

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, botId, message }) };
}

// =============================================================================
// ENTRY POINT
// =============================================================================

export async function handler(event) {
  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const action = event.path.split("/").filter(Boolean).at(-1);

  switch (action) {
    case "chat":    return handleArchitectChat(event);
    case "export":  return handleExport(event);
    case "intake":  return handleTallyIntake(event);
    case "session": return handleBootstrapSession(event);
    default:
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Unknown architect route",
          validRoutes: ["/api/architect/chat", "/api/architect/export", "/api/architect/intake", "/api/architect/session"]
        })
      };
  }
}

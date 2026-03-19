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

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";


// ─────────────────────────────────────────
// FIREBASE INIT (identical pattern to submit.js)
// ─────────────────────────────────────────

function getDB() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL
    });
  }
  return getDatabase();
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

function hasAccess(bot, context) {
  const scope = bot.scope || "global";
  const owner = bot.owner || null;
  const facultyId = context.facultyId || null;
  const classId   = context.classId   || null;
  void classId;
  if (scope === "global")          return true;
  if (scope === "institution")     return !!facultyId;
  if (scope === "faculty_private") return !!(owner && facultyId && owner === facultyId);
  if (scope === "course_specific") return true;
  return false;
}


// ─────────────────────────────────────────
// BOT RESOLUTION
// ─────────────────────────────────────────

function findBot(config, botType, context = {}) {
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

function detectFullSolutionRequest(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes("תפתור לי") ||
    lower.includes("תכתוב לי את העבודה") ||
    lower.includes("תענה במקומי") ||
    lower.includes("solve for me") ||
    lower.includes("write it for me")
  );
}

function looksLikeFullAnswer(reply) {
  return reply.length > 1200;
}

const DEFAULT_PROMPT =
  "אתה עוזר לימודי סוקרטי וחם. ענה בעברית ושאל שאלות במקום לתת תשובות ישירות.";


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
    kernel.trim(),        // Constitution layer
    kernelBlock.trim(),   // Policy layer
    systemPrompt.trim(),  // Bot layer
    hebrewBlock,          // Hebrew level layer
    contextBlock          // Session context layer
  ].filter(Boolean).join("\n\n");

}


// ─────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────

exports.handler = async (event) => {

  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
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
      isNewBotSession  = false          // ← חדש: מונע טעינת history ישן בהחלפת בוט
    } = JSON.parse(event.body || "{}");

    if (!botType)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "botType required" }) };

    const context = { facultyId, classId, studentId };

    // ─── LOAD CONFIG ───
    const config = await loadConfig();
    if (!config)
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Configuration load failed" }) };

    const botConfig = findBot(config, botType, context);
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
    const sessionCtx = await loadSessionContext(studentId, courseId);

    let contextBlock  = "";
    let savedHistory  = [];

    if (sessionCtx) {
      const parts = [];
      if (sessionCtx.studentName) parts.push(`שם הסטודנט: ${sessionCtx.studentName}`);
      if (sessionCtx.gender)      parts.push(`פנייה: ${sessionCtx.gender}`);
      if (sessionCtx.lastStage)   parts.push(`שלב אחרון: ${sessionCtx.lastStage}`);
      if (sessionCtx.nextStep)    parts.push(`הצעד הבא: ${sessionCtx.nextStep}`);
      if (parts.length > 0)
        contextBlock = "## הקשר מהשיחה הקודמת\n" + parts.join("\n");

      // שחזר history אם הגיע ריק מה-frontend
      if (Array.isArray(sessionCtx.history) && sessionCtx.history.length > 0)
        savedHistory = sessionCtx.history;
    }
    
    // ─── LOG SESSION METADATA (once per session) ───
    if (sessionId) {
      await getDB().ref(`conversations/${sessionId}`).update({
        studentId,
        courseId,
        botType,
        updatedAt: Date.now()
      });
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

    if (effectiveNoFullSolution && looksLikeFullAnswer(reply))
      reply = "בוא נבנה את זה יחד 🙂 מהו הצעד הראשון לדעתך?";

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

    // ─── SAVE SESSION & LOG CONVERSATION ───
    const saveData = { lastBotType: botType, lastActive: Date.now() };
    if (sessionUpdate) Object.assign(saveData, sessionUpdate);

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

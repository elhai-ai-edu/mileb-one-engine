import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const FUNCTIONS_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(FUNCTIONS_DIR, "..");
const kernelPath = path.resolve(PROJECT_ROOT, "kernel.txt");
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
      isNewBotSession  = false,         // ← prevents loading stale history on bot switch
      skillMode        = false,         // ← true when request originates from skills hub
      waveId           = null           // ← assessment wave (e.g. "wave_1_baseline", "wave_2_midterm")
    } = JSON.parse(event.body || "{}");

    if (!botType)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "botType required" }) };

    const context = { facultyId, classId, studentId };

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

    // ─── INJECT CURRENT STEP ───
    // Adds the active project stage to the context block so the bot can enforce gating.
    if (currentStep != null) {
      const stepLine = `שלב נוכחי: ${currentStep}`;
      contextBlock = contextBlock
        ? contextBlock + "\n" + stepLine
        : "## הקשר\n" + stepLine;
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

    // ─── EXTRACT skill_signal before it reaches sessions/ ───────────
    let skillSignal = null;
    if (sessionUpdate?.skill_signal) {
      skillSignal = sessionUpdate.skill_signal;
      delete sessionUpdate.skill_signal;
    }

    // ─── EXTRACT CONTINUATION TOKEN METADATA (MJ-3) ───
    // Strips the hidden HTML comment from the visible reply and saves it to Firebase.
    // Format: <!-- META: {"form":"...","name":"...","tone":"...","emotionalTrajectory":"..."} -->
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
            lesson:        currentStep || null,
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
              last_updated: `lesson_${currentStep || "?"}`,
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

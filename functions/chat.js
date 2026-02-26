// functions/chat.js — MilEd.One v4.6
// Scope-aware authorization + Owner-aware bots + Kernel injection + Logging + Model routing

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";


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
  "admin_analytics"
];

function selectModel(botType) {
  if (botType && THINKING_BOT_TYPES.includes(botType))
    return MODEL_THINKING;
  return MODEL_FAST;
}


// ─────────────────────────────────────────
// CONFIG CACHE
// ─────────────────────────────────────────

let cachedConfig = null;

async function loadConfig() {

  if (cachedConfig) return cachedConfig;

  try {

    const res = await fetch(`${SITE_URL}/config.json`);

    if (!res.ok) return null;

    cachedConfig = await res.json();

    return cachedConfig;

  } catch (e) {

    console.error("config load error:", e.message);

    return null;
  }
}


// ─────────────────────────────────────────
// AUTHORIZATION LAYER (NEW)
// ─────────────────────────────────────────

function hasAccess(bot, context) {

  const scope = bot.scope || "global";
  const owner = bot.owner || null;

  const facultyId = context.facultyId || null;
  const classId   = context.classId   || null;

  // GLOBAL — accessible to all

  if (scope === "global")
    return true;


  // INSTITUTION — accessible to all institutional users

  if (scope === "institution")
    return true;


  // FACULTY PRIVATE — owner only

  if (scope === "faculty_private")
    return owner && facultyId && owner === facultyId;


  // COURSE SPECIFIC (RECOMMENDED — stage 1 simple allow)

  if (scope === "course_specific")
    return true;


  return false;
}


// ─────────────────────────────────────────
// BOT RESOLUTION (UPDATED)
// ─────────────────────────────────────────

function findBot(config, botType, context = {}) {

  if (!config || !botType)
    return null;


  // universal layer

  for (let id in config.universal?.items || {}) {

    const bot = config.universal.items[id];

    if (bot.botType === botType && hasAccess(bot, context))
      return bot;
  }


  // branches layer

  for (let branch in config.branches || {}) {

    for (let id in config.branches[branch]?.items || {}) {

      const bot = config.branches[branch].items[id];

      if (bot.botType === botType && hasAccess(bot, context))
        return bot;
    }
  }

  return null;
}


// ─────────────────────────────────────────
// MESSAGE ANALYSIS
// ─────────────────────────────────────────

function analyzeMessage(message) {

  const isQuestion =
    message.includes("?") ||
    message.includes("מה") ||
    message.includes("איך") ||
    message.includes("למה") ||
    message.includes("מתי") ||
    message.includes("איפה");

  const wordCount =
    message.trim().split(/\s+/).length;

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
// MAIN HANDLER
// ─────────────────────────────────────────

exports.handler = async (event) => {

  const headers = {

    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"

  };


  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };


  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };


  try {

    // ─────────────────────────────────────
    // INPUT PARSE (UPDATED)
    // ─────────────────────────────────────

    const {

      message   = "שלום",
      history   = [],
      botType   = null,

      studentId = "anonymous",

      facultyId = null,        // NEW
      classId   = null,        // EXISTING

      sessionId = null         // RECOMMENDED

    } = JSON.parse(event.body || "{}");



    // context object

    const context = {

      facultyId,
      classId,
      studentId

    };



    // ─────────────────────────────────────
    // LOAD CONFIG
    // ─────────────────────────────────────

    const config = await loadConfig();


    const botConfig = findBot(config, botType, context);


    const systemPrompt =
      botConfig?.systemPrompt || DEFAULT_PROMPT;


    const model = selectModel(botType);


    const logContent =
      config?.engine?.logContent ?? false;



    // ─────────────────────────────────────
    // KERNEL INJECTION
    // ─────────────────────────────────────

    const kernel = config?.engine?.kernel || {};

    let kernelBlock = "";

    if (kernel.preserveAgency)
      kernelBlock += "שמור על סוכנות הלומד. ";

    if (kernel.noFullSolutionForStudent)
      kernelBlock += "אל תפתור משימות במלואן עבור סטודנט. ";

    if (kernel.noSkipStructuralSteps)
      kernelBlock += "אל תדלג על שלבים מבניים בתהליך חשיבה. ";

    if (kernel.evaluationRequiresExplicitCriteria)
      kernelBlock += "אין לבצע הערכה ללא קריטריונים מפורשים ומאושרים. ";

    if (kernel.preventRoleMutation)
      kernelBlock += "אין לשנות תפקיד במהלך השיחה. ";

    if (kernel.invisibleEffortRegulation)
      kernelBlock += "ויסות מאמץ צריך להיות מדורג ואינו גלוי למשתמש. ";


    const finalSystemPrompt =
      kernelBlock
        ? kernelBlock + "\n\n" + systemPrompt
        : systemPrompt;



    // ─────────────────────────────────────
    // HISTORY LIMIT
    // ─────────────────────────────────────

    const trimmedHistory =
      history.slice(-14);



    // ─────────────────────────────────────
    // PRE GUARD
    // ─────────────────────────────────────

    if (kernel.noFullSolutionForStudent && detectFullSolutionRequest(message)) {

      return {

        statusCode: 200,
        headers,

        body: JSON.stringify({

          reply:
            "אני כאן כדי לעזור לך לחשוב ולבנות את התשובה בעצמך 🙂 מה כבר ניסית?",

          botType,
          botName: botConfig?.name || null,
          model: "kernel-guard",
          isThinking: false

        })
      };
    }



    // ─────────────────────────────────────
    // BUILD MESSAGE STACK
    // ─────────────────────────────────────

    const messages = [

      { role: "system", content: finalSystemPrompt },

      ...trimmedHistory.map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),

      { role: "user", content: message }

    ];



    // ─────────────────────────────────────
    // CALL MODEL
    // ─────────────────────────────────────

    const response = await fetch(OPENROUTER_URL, {

      method: "POST",

      headers: {

        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  SITE_URL,
        "X-Title":       "MilEd.One"

      },

      body: JSON.stringify({

        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7

      })

    });



    const data  = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      JSON.stringify(data);



    // ─────────────────────────────────────
    // POST GUARD
    // ─────────────────────────────────────

    let finalReply = reply;

    if (kernel.noFullSolutionForStudent && looksLikeFullAnswer(reply)) {

      finalReply =
        "בוא נבנה את זה יחד 🙂 מהו הצעד הראשון לדעתך?";

    }



    // ─────────────────────────────────────
    // RESEARCH LOGGING (UPDATED)
    // ─────────────────────────────────────

    const { isQuestion, wordCount } =
      analyzeMessage(message);


    const logEntry = {

      timestamp: new Date().toISOString(),

      studentId,
      facultyId,          // NEW
      sessionId,          // NEW
      classId,

      botType,
      botName: botConfig?.name || "unknown",

      scope: botConfig?.scope || "global",     // NEW
      owner: botConfig?.owner || null,         // NEW

      layer: botConfig?._layer || "unknown",

      model,
      isThinking: model === MODEL_THINKING,

      messageWordCount: wordCount,
      messageIsQuestion: isQuestion,

      replyLength: finalReply.length,

      tokensUsed: data.usage || null

    };


    if (logContent) {

      logEntry.messageContent = message;

      logEntry.replyContent =
        finalReply.slice(0, 200);

    }


    console.log("RESEARCH_LOG:", JSON.stringify(logEntry));



    // ─────────────────────────────────────
    // RESPONSE
    // ─────────────────────────────────────

    return {

      statusCode: 200,
      headers,

      body: JSON.stringify({

        reply: finalReply,
        botType,
        botName: botConfig?.name || null,
        model,
        isThinking: model === MODEL_THINKING

      })

    };


  } catch (err) {

    console.error("ERROR:", err);

    return {

      statusCode: 500,
      headers,

      body: JSON.stringify({

        error: err.message

      })
    };
  }
};

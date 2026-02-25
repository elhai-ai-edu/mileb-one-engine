// functions/chat.js — MilEd.One v4.4
// Dynamic config + Model routing + Kernel injection + Guards + Enhanced research logging

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";

// ── ניתוב מודלים ──────────────────────────────────────────
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

// ── Cache של config ───────────────────────────────────────
let cachedConfig = null;

async function loadConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const res = await fetch(`${SITE_URL}/config.json`);
    if (!res.ok) return null;
    cachedConfig = await res.json();
    return cachedConfig;
  } catch (e) {
    console.error('config error:', e.message);
    return null;
  }
}

// ── חיפוש בוט לפי botType ─────────────────────────────────
function findBot(config, botType) {
  if (!config || !botType) return null;

  for (let id in config.universal?.items || {}) {
    if (config.universal.items[id].botType === botType)
      return config.universal.items[id];
  }

  for (let branch in config.branches || {}) {
    for (let id in config.branches[branch]?.items || {}) {
      if (config.branches[branch].items[id].botType === botType)
        return config.branches[branch].items[id];
    }
  }

  return null;
}

// ── ניתוח שאלה ────────────────────────────────────────────
function analyzeMessage(message) {
  const isQuestion = message.includes('?') || message.includes('מה') ||
                     message.includes('איך') || message.includes('למה') ||
                     message.includes('מתי') || message.includes('איפה');
  const wordCount = message.trim().split(/\s+/).length;
  return { isQuestion, wordCount };
}

// ── Kernel Guards ─────────────────────────────────────────
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
  return reply.length > 1200; // heuristic ראשוני
}

const DEFAULT_PROMPT = "אתה עוזר לימודי סוקרטי וחם. ענה בעברית ושאל שאלות במקום לתת תשובות ישירות.";

// ── פונקציה ראשית ─────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const {
      message   = "שלום",
      history   = [],
      botType   = null,
      studentId = "anonymous",
      classId   = null
    } = JSON.parse(event.body || "{}");

    const model      = selectModel(botType);
    const config     = await loadConfig();
    const botConfig  = findBot(config, botType);
    const logContent = config?.engine?.logContent ?? false;
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── Kernel Injection ───────────────────────────────────
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

    const finalSystemPrompt = kernelBlock
      ? kernelBlock + "\n\n" + systemPrompt
      : systemPrompt;

    // ── הגבלת היסטוריה ─────────────────────────────────────
    const trimmedHistory = history.slice(-14);

    // ── Role Mutation Guard ────────────────────────────────
    if (kernel.preventRoleMutation) {
      trimmedHistory.forEach(m => {
        if (m.role === "system") {
          m.role = "assistant";
        }
      });
    }

    // ── Kernel Pre-Guard ───────────────────────────────────
    if (kernel.noFullSolutionForStudent && detectFullSolutionRequest(message)) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "אני כאן כדי לעזור לך לחשוב ולבנות את התשובה בעצמך 🙂 בוא נתחיל בצעד הראשון יחד — מה כבר יש לך?",
          botType,
          botName: botConfig?.name || null,
          model: "kernel-guard",
          isThinking: false
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

    // ── קריאה ל-OpenRouter ─────────────────────────────────
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  SITE_URL,
        "X-Title":       "MilEd.One"
      },
      body: JSON.stringify({ model, messages, max_tokens: 1024, temperature: 0.7 })
    });

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);

    // ── Kernel Post-Guard ──────────────────────────────────
    if (kernel.noFullSolutionForStudent && looksLikeFullAnswer(reply)) {
      console.warn("Kernel detected possible full solution.");
    }

    // ── ניתוח הודעה למחקר ─────────────────────────────────
    const { isQuestion, wordCount } = analyzeMessage(message);

    const logEntry = {
      timestamp: new Date().toISOString(),
      studentId,
      classId,
      botType,
      botName: botConfig?.name || "unknown",
      layer: botConfig?._layer || "unknown",
      model,
      isThinking: model === MODEL_THINKING,
      historyLength: trimmedHistory.length,
      sessionTurn: Math.floor(trimmedHistory.length / 2) + 1,
      messageWordCount: wordCount,
      messageIsQuestion: isQuestion,
      replyLength: reply.length,
      tokensUsed: data.usage || null
    };

    if (logContent) {
      logEntry.messageContent = message;
      logEntry.replyContent   = reply.slice(0, 200);
    }

    console.log("RESEARCH_LOG:", JSON.stringify(logEntry));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        botType,
        botName: botConfig?.name || null,
        model,
        isThinking: model === MODEL_THINKING
      })
    };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

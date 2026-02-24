// functions/chat.js — MilEd.One v4.1
// Dynamic config + Model routing (Flash / Flash Thinking)

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

// ── Cache של config — נטען פעם אחת בלבד ─────────────────
let cachedConfig = null;

async function loadConfig() {
  if (cachedConfig) return cachedConfig; // ← מחזיר מה-cache
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

    // ── בחירת מודל לפי סוג הבוט ───────────────────────
    const model = selectModel(botType);

    // ── טעינת config מה-cache ומציאת הבוט ─────────────
    const config       = await loadConfig();
    const botConfig    = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── הגבלת היסטוריה ל-14 הודעות אחרונות (7 סיבובים) ─
    const trimmedHistory = history.slice(-14);

    // ── בניית הודעות ────────────────────────────────────
    const messages = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory.map(m => ({
        role:    m.role === "assistant" ? "assistant" : "user",
        content: m.content
      })),
      { role: "user", content: message }
    ];

    // ── קריאה ל-OpenRouter ───────────────────────────────
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
        max_tokens:  1024,
        temperature: 0.7
      })
    });

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);

    // ── Log מחקרי ────────────────────────────────────────
    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp:     new Date().toISOString(),
      studentId,     classId,      botType,
      botName:       botConfig?.name   || "unknown",
      layer:         botConfig?._layer || "unknown",
      model,
      isThinking:    model === MODEL_THINKING,
      messageLength: message.length,
      replyLength:   reply.length,
      historyLength: trimmedHistory.length,
      tokensUsed:    data.usage || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        botType,
        botName:   botConfig?.name || null,
        model,
        isThinking: model === MODEL_THINKING
      })
    };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

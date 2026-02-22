// functions/chat.js — MilEd.One v3.2 — OpenRouter + Dynamic Config

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL      = "google/gemini-2.0-flash-001";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";
const DEFAULT_PROMPT     = "אתה עוזר לימודי סוקרטי וחם. ענה בעברית ושאל שאלות במקום לתת תשובות ישירות.";

// ── טעינת config.json דרך fetch ───────────────────────────
async function loadConfig() {
  try {
    const res = await fetch(`${SITE_URL}/config.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('config fetch error:', e.message);
    return null;
  }
}

// ── חיפוש בוט לפי botType ─────────────────────────────────
function findBot(config, botType) {
  if (!config || !botType) return null;

  // חפש ב-universal
  for (let id in config.universal?.items || {}) {
    if (config.universal.items[id].botType === botType)
      return config.universal.items[id];
  }

  // חפש בכל ה-branches
  for (let branch in config.branches || {}) {
    for (let id in config.branches[branch]?.items || {}) {
      if (config.branches[branch].items[id].botType === botType)
        return config.branches[branch].items[id];
    }
  }

  return null;
}

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
      message    = "שלום",
      history    = [],
      botType    = null,
      studentId  = "anonymous",
      classId    = null
    } = JSON.parse(event.body || "{}");

    // ── טעינת config ומציאת הבוט ───────────────────────
    const config       = await loadConfig();
    const botConfig    = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── בניית הודעות ────────────────────────────────────
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({
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
        model:       DEFAULT_MODEL,
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
      botName:       botConfig?.name  || "unknown",
      layer:         botConfig?._layer || "unknown",
      model:         DEFAULT_MODEL,
      messageLength: message.length,
      replyLength:   reply.length,
      historyLength: history.length,
      tokensUsed:    data.usage || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        botType,
        botName: botConfig?.name || null,
        model:   DEFAULT_MODEL
      })
    };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

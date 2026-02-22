// functions/chat.js — MilEd.One v3.0 — OpenRouter
const fs   = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL      = "google/gemini-2.0-flash-001";

// ── טעינת config ──────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
  } catch (e) {
    console.error('config error:', e.message);
    return null;
  }
}

// ── חיפוש בוט לפי botType ─────────────────────────────────
function findBot(config, botType) {
  if (!config || !botType) return null;
  for (let id in config.universal?.items || {}) {
    if (config.universal.items[id].botType === botType) return config.universal.items[id];
  }
  for (let branch in config.branches || {}) {
    for (let id in config.branches[branch]?.items || {}) {
      if (config.branches[branch].items[id].botType === botType)
        return config.branches[branch].items[id];
    }
  }
  return null;
}

const DEFAULT_PROMPT = "אתה עוזר לימודי מועיל וחם. ענה בצורה ממוקדת וברורה בעברית.";

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
    const { message, history = [], botType = null, studentId = "anonymous", classId = null }
      = JSON.parse(event.body || "{}");

    if (!message?.trim())
      return { statusCode: 400, headers, body: JSON.stringify({ error: "נדרשת הודעה" }) };

    const config       = loadConfig();
    const botConfig    = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── בניית הודעות בפורמט OpenAI ───────────────────────
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      { role: "user", content: message }
    ];

    // ── קריאה ל-OpenRouter ────────────────────────────────
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":   "application/json",
        "HTTP-Referer":   "https://cozy-seahorse-7c5204.netlify.app",
        "X-Title":        "MilEd.One"
      },
      body: JSON.stringify({
        model:       DEFAULT_MODEL,
        messages,
        temperature: 0.7,
        max_tokens:  1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "שגיאה בתקשורת עם המודל", details: response.status }) };
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || "לא התקבלה תשובה";

    // ── Log מחקרי ────────────────────────────────────────
    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp:     new Date().toISOString(),
      studentId,     classId,      botType,
      botName:       botConfig?.name || "unknown",
      model:         DEFAULT_MODEL,
      messageLength: message.length,
      replyLength:   reply.length,
      historyLength: history.length,
      tokensUsed:    data.usage || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, botType, botName: botConfig?.name || null, model: DEFAULT_MODEL })
    };

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "שגיאה פנימית", details: err.message }) };
  }
};

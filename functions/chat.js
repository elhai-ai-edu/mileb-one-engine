// functions/chat.js — MilEd.One v2.2
const fs   = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── טעינת config ──────────────────────────────────────────
function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
  } catch (e) {
    console.error('config error:', e.message);
    return null;
  }
}

// ── חיפוש בוט ────────────────────────────────────────────
function findBot(config, botType) {
  if (!config || !botType) return null;
  for (let id in config.universal?.items || {}) {
    if (config.universal.items[id].botType === botType) return config.universal.items[id];
  }
  for (let branch in config.branches || {}) {
    for (let id in config.branches[branch]?.items || {}) {
      if (config.branches[branch].items[id].botType === botType) return config.branches[branch].items[id];
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

    const config     = loadConfig();
    const botConfig  = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── בניית בקשה ──────────────────────────────────────
    const contents = [
      ...history.map(m => ({
        role:  m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const requestBody = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    };

    // ── כתובת ה-API הנכונה ───────────────────────────────
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini error:", response.status, errText);
      return { statusCode: 502, headers, body: JSON.stringify({ error: "שגיאה בתקשורת עם המודל", details: response.status }) };
    }

    const data  = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה";

    // ── Log מחקרי ────────────────────────────────────────
    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp: new Date().toISOString(),
      studentId, classId, botType,
      botName:       botConfig?.name || "unknown",
      messageLength: message.length,
      replyLength:   reply.length,
      tokensUsed:    data.usageMetadata || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, botType, botName: botConfig?.name || null, model: "gemini-1.5-flash-latest" })
    };

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "שגיאה פנימית", details: err.message }) };
  }
};

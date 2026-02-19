// functions/chat.js
// MilEd.One — מנוע מרכזי v2.1
// =========================================================

const fs   = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = "gemini-1.5-flash"; // מודל יציב ונתמך
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── טעינת config.json ─────────────────────────────────────
function loadConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('שגיאה בטעינת config:', e.message);
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

const DEFAULT_PROMPT = "אתה עוזר לימודי מועיל וחם. ענה בצורה ממוקדת וברורה בעברית.";

// ── פונקציה ראשית ─────────────────────────────────────────
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
    const { message, history = [], botType = null, studentId = "anonymous", classId = null }
      = JSON.parse(event.body || "{}");

    if (!message?.trim())
      return { statusCode: 400, headers, body: JSON.stringify({ error: "נדרשת הודעה" }) };

    // ── מציאת הבוט ──────────────────────────────────────
    const config    = loadConfig();
    const botConfig = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── בניית הבקשה ─────────────────────────────────────
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
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1024
      }
    };

    // ── קריאה ל-Gemini ───────────────────────────────────
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

    // ── Log לצרכי מחקר ───────────────────────────────────
    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp:     new Date().toISOString(),
      studentId,     classId,      botType,
      botName:       botConfig?.name || "unknown",
      messageLength: message.length,
      replyLength:   reply.length,
      historyLength: history.length,
      tokensUsed:    data.usageMetadata || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, botType, botName: botConfig?.name || null, model: GEMINI_MODEL })
    };

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "שגיאה פנימית", details: err.message }) };
  }
};('שגיאה בטעינת config:', e.message);
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

const DEFAULT_PROMPT = "אתה עוזר לימודי מועיל וחם. ענה בצורה ממוקדת וברורה בעברית.";

// ── פונקציה ראשית ─────────────────────────────────────────
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
    const { message, history = [], botType = null, studentId = "anonymous", classId = null }
      = JSON.parse(event.body || "{}");

    if (!message?.trim())
      return { statusCode: 400, headers, body: JSON.stringify({ error: "נדרשת הודעה" }) };

    // ── מציאת הבוט ──────────────────────────────────────
    const config    = loadConfig();
    const botConfig = findBot(config, botType);
    const systemPrompt = botConfig?.systemPrompt || DEFAULT_PROMPT;

    // ── בניית הבקשה ─────────────────────────────────────
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
      generationConfig: {
        temperature:     0.7,
        maxOutputTokens: 1024
      }
    };

    // ── קריאה ל-Gemini ───────────────────────────────────
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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

    // ── Log לצרכי מחקר ───────────────────────────────────
    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp:     new Date().toISOString(),
      studentId,     classId,      botType,
      botName:       botConfig?.name || "unknown",
      messageLength: message.length,
      replyLength:   reply.length,
      historyLength: history.length,
      tokensUsed:    data.usageMetadata || null
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply, botType, botName: botConfig?.name || null, model: GEMINI_MODEL })
    };

  } catch (err) {
    console.error("Function error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "שגיאה פנימית", details: err.message }) };
  }
};

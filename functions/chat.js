// functions/chat.js
// MilEd.One — מנוע מרכזי v2.0
// קורא systemPrompt ישירות מ-config.json
// =========================================================

const fs = require('fs');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ── טעינת config.json ────────────────────────────────────
// config.json יושב בroot של הפרויקט
function loadConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'config.json');
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('שגיאה בטעינת config.json:', e.message);
    return null;
  }
}

// ── חיפוש בוט לפי botType בכל המבנה ההיררכי ─────────────
function findBotConfig(config, botType) {
  if (!config || !botType) return null;

  // חפש בשכבת universal
  if (config.universal?.items) {
    for (let id in config.universal.items) {
      const item = config.universal.items[id];
      if (item.botType === botType) return item;
    }
  }

  // חפש בכל ה-branches
  if (config.branches) {
    for (let branch in config.branches) {
      const items = config.branches[branch]?.items;
      if (!items) continue;
      for (let id in items) {
        const item = items[id];
        if (item.botType === botType) return item;
      }
    }
  }

  return null;
}

// ── ברירת מחדל אם לא נמצא בוט ───────────────────────────
const DEFAULT_SYSTEM_PROMPT = `אתה עוזר לימודי מועיל וחם.
ענה בצורה ממוקדת וברורה בעברית.`;

const DEFAULT_THINKING_BUDGET = 512;

// ── פונקציה ראשית ─────────────────────────────────────────
exports.handler = async (event) => {

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const {
      message,
      history    = [],
      botType    = null,
      studentId  = "anonymous",
      classId    = null
    } = JSON.parse(event.body || "{}");

    if (!message?.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "נדרשת הודעה" }) };
    }

    // ── טעינת config ──────────────────────────────────────
    const config = loadConfig();
    const engineConfig = config?.engine || {};

    // ── מציאת הבוט הנכון ──────────────────────────────────
    const botConfig = findBotConfig(config, botType);

    const systemPrompt    = botConfig?.systemPrompt    || DEFAULT_SYSTEM_PROMPT;
    const thinkingBudget  = botConfig?.thinkingBudget  || engineConfig.defaultThinkingBudget || DEFAULT_THINKING_BUDGET;
    const model           = engineConfig.defaultModel  || "gemini-2.0-flash";
    const temperature     = engineConfig.temperature   || 0.7;
    const maxOutputTokens = engineConfig.maxOutputTokens || 1024;

    // ── בניית בקשה ל-Gemini ───────────────────────────────
    const contents = [
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const requestBody = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens,
        thinkingConfig: { thinkingBudget }
      }
    };

    // ── קריאה ל-Gemini ────────────────────────────────────
    const url = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "שגיאה בתקשורת עם המודל", details: response.status })
      };
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה";

    // ── Logging לצרכי מחקר ────────────────────────────────
    if (engineConfig.logMetadata !== false) {
      const logEntry = {
        timestamp:      new Date().toISOString(),
        studentId,
        classId,
        botType,
        botName:        botConfig?.name || "unknown",
        layer:          botConfig?._layer || "unknown",
        model,
        thinkingBudget,
        messageLength:  message.length,
        replyLength:    reply.length,
        historyLength:  history.length,
        tokensUsed:     data.usageMetadata || null
      };
      console.log("RESEARCH_LOG:", JSON.stringify(logEntry));
    }

    // ── תשובה ────────────────────────────────────────────
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply,
        botType,
        botName:  botConfig?.name || null,
        model
      })
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "שגיאה פנימית בשרת", details: err.message })
    };
  }
};

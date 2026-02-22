// functions/chat.js — MilEd.One v3.1 — OpenRouter (ללא fs)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL      = "google/gemini-2.0-flash-001";
const DEFAULT_PROMPT     = "אתה עוזר לימודי סוקרטי וחם. ענה בעברית ושאל שאלות במקום לתת תשובות ישירות.";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const { message = "שלום", history = [], studentId = "anonymous", classId = null, botType = null }
      = JSON.parse(event.body || "{}");

    const messages = [
      { role: "system", content: DEFAULT_PROMPT },
      ...history.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      { role: "user", content: message }
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  "https://cozy-seahorse-7c5204.netlify.app",
        "X-Title":       "MilEd.One"
      },
      body: JSON.stringify({ model: DEFAULT_MODEL, messages, max_tokens: 1024, temperature: 0.7 })
    });

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || JSON.stringify(data);

    console.log("RESEARCH_LOG:", JSON.stringify({
      timestamp: new Date().toISOString(),
      studentId, classId, botType, model: DEFAULT_MODEL,
      messageLength: message.length, replyLength: reply.length
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ reply, model: DEFAULT_MODEL }) };

  } catch (err) {
    console.error("Error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

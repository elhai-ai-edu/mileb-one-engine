// functions/chat.js — MilEd.One v2.5 (Final Release)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash"; // חזרה למודל יציב יותר
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
    if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

    try {
        const { message, history = [], classId = "general" } = JSON.parse(event.body || "{}");

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_KEY_HERE") {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "⚠️ שגיאה: מפתח ה-API לא הוגדר בנטליפיי. אנא הגדר GEMINI_API_KEY ב-Environment Variables." }) };
        }

        const contents = [
            ...history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
            { role: "user", parts: [{ text: message }] }
        ];

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents,
                systemInstruction: { parts: [{ text: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית ברורה.` }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: `❌ שגיאה מה-AI: ${data.error?.message || "תקלה לא ידועה"}` }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה מהמודל.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (err) {
        return { statusCode: 200, headers, body: JSON.stringify({ reply: `🔥 שגיאת שרת: ${err.message}` }) };
    }
};

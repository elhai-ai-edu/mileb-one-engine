// functions/chat.js — MilEd.One v2.4 (Robust Version)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Content-Type": "application/json"
    };

    // טיפול ב-CORS
    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
    if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

    try {
        const { message, history = [], systemPrompt = "אתה עוזר לימודי מועיל. ענה בעברית." } = JSON.parse(event.body || "{}");

        if (!GEMINI_API_KEY) {
            return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing API Key in Netlify settings" }) };
        }

        // בניית היסטוריית השיחה
        const contents = [
            ...history.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            })),
            { role: "user", parts: [{ text: message }] }
        ];

        const requestBody = {
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        };

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini Error:", data);
            return { statusCode: response.status, headers, body: JSON.stringify({ error: "שגיאה מהמודל", details: data }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה";

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply })
        };

    } catch (err) {
        console.error("Serverless Error:", err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: "שגיאה פנימית", details: err.message }) };
    }
};

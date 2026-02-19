// functions/chat.js — MilEd.One v2.7 (Stable Release)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
// שינוי ל-v1 (הגרסה היציבה והנתמכת)
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
    
    try {
        const { message, history = [], classId = "general" } = JSON.parse(event.body || "{}");

        if (!GEMINI_API_KEY) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "⚠️ חסר מפתח API בנטליפיי." }) };
        }

        const cleanContents = [];
        history.forEach(m => {
            if (m.content && m.content.trim().length > 0) {
                cleanContents.push({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: [{ text: m.content.trim() }]
                });
            }
        });

        if (!message || message.trim().length === 0) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "לא כתבת הודעה." }) };
        }
        
        cleanContents.push({
            role: "user",
            parts: [{ text: message.trim() }]
        });

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: cleanContents,
                // גרסת v1 תומכת ב-systemInstruction עבור מודל 1.5 flash
                systemInstruction: { parts: [{ text: `אתה עוזר למידה אקדמי מומחה. ענה בעברית ברורה ומקצועית.` }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return { statusCode: 200, headers, body: JSON.stringify({ reply: `❌ שגיאת מודל: ${data.error?.message || "תקלה בתקשורת"}` }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (err) {
        console.error("Crash:", err);
        return { statusCode: 200, headers, body: JSON.stringify({ reply: `🔥 תקלה טכנית: ${err.message}` }) };
    }
};

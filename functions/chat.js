// functions/chat.js — MilEd.One v2.9 (Stable Beta)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
// חזרה ל-v1beta - הגרסה שבוודאות מכילה את המודל הזה
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

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

        // בניית מערך ההודעות
        let contents = [];
        
        // הוספת היסטוריה קיימת
        history.forEach(m => {
            if (m.content && m.content.trim()) {
                contents.push({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: [{ text: m.content }]
                });
            }
        });

        // הוספת ההנחיה והודעת המשתמש הנוכחית כהודעה אחת כדי למנוע שגיאות מבנה
        const systemPrompt = `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית.`;
        const finalMessage = contents.length === 0 ? `${systemPrompt}\n\nשאלה: ${message}` : message;

        contents.push({
            role: "user",
            parts: [{ text: finalMessage }]
        });

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error Detail:", JSON.stringify(data));
            return { statusCode: 200, headers, body: JSON.stringify({ reply: `❌ שגיאה: ${data.error?.message || "תקלה בתקשורת"}` }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (err) {
        return { statusCode: 200, headers, body: JSON.stringify({ reply: `🔥 תקלה טכנית: ${err.message}` }) };
    }
};

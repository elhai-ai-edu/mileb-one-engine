// functions/chat.js — MilEd.One v2.6 (Auto-Fix Empty Messages)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
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

        // --- ניקוי היסטוריה מהודעות ריקות כדי למנוע את שגיאת ה-'data' ---
        const cleanContents = [];
        
        // הוספת היסטוריה קודמת (רק אם יש בה טקסט)
        history.forEach(m => {
            if (m.content && m.content.trim().length > 0) {
                cleanContents.push({
                    role: m.role === "assistant" ? "model" : "user",
                    parts: [{ text: m.content.trim() }]
                });
            }
        });

        // הוספת ההודעה הנוכחית (חייבת להיות קיימת)
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
                systemInstruction: { parts: [{ text: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית.` }] }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return { statusCode: 200, headers, body: JSON.stringify({ reply: `❌ שגיאה: ${data.error?.message || "תקלה בתקשורת"}` }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (err) {
        console.error("Crash:", err);
        return { statusCode: 200, headers, body: JSON.stringify({ reply: `🔥 תקלה טכנית: ${err.message}` }) };
    }
};

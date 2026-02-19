// functions/chat.js — MilEd.One v2.8 (Universal Compatibility)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
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

        // בניית הקשר המערכת בתוך ההודעה הראשונה (במקום בשדה נפרד)
        const systemContext = `הנחיית מערכת: אתה עוזר למידה אקדמי בקורס ${classId}. ענה תמיד בעברית מקצועית ומסייעת.`;
        
        const contents = [];
        
        // אם זו ההודעה הראשונה, נשלב את ההנחיה
        if (history.length === 0) {
            contents.push({
                role: "user",
                parts: [{ text: `${systemContext}\n\nהודעת הסטודנט: ${message}` }]
            });
        } else {
            // אם יש היסטוריה, נוסיף אותה כרגיל
            history.forEach(m => {
                if (m.content && m.content.trim()) {
                    contents.push({
                        role: m.role === "assistant" ? "model" : "user",
                        parts: [{ text: m.content }]
                    });
                }
            });
            contents.push({
                role: "user",
                parts: [{ text: message }]
            });
        }

        const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (!response.ok) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: `❌ שגיאה: ${data.error?.message || "תקלה בתקשורת"}` }) };
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";

        return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

    } catch (err) {
        return { statusCode: 200, headers, body: JSON.stringify({ reply: `🔥 תקלה טכנית: ${err.message}` }) };
    }
};

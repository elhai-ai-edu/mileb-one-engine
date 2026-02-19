// functions/chat.js — MilEd.One v6.0 (Endpoint Fix)
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        const body = JSON.parse(event.body || "{}");
        const { message, history = [], classId = "general" } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "⚠️ חסר מפתח API בנטליפיי." }) };
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // תיקון: הוספת הקידומת models/ ושינוי מבנה ה-systemInstruction
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash", // הספרייה כבר מוסיפה את הקידומת בעצמה בגרסאות חדשות
            systemInstruction: {
                parts: [{ text: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית בצורה ברורה ומקצועית.` }]
            }
        });

        const validHistory = (history || [])
            .filter(m => m.content && m.content.trim().length > 0)
            .filter(m => !m.content.includes("❌") && !m.content.includes("🔥") && !m.content.includes("הבוט מתאתחל"))
            .map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content.trim() }],
            }));

        const chat = model.startChat({ history: validHistory });

        const result = await chat.sendMessage(message.trim());
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply: text })
        };

    } catch (err) {
        console.error("Final Error Trace:", err);
        // אם flash עדיין לא עובד, נסה להחליף את המודל ל-gemini-pro כגיבוי אחרון
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `מערכת הלמידה בתהליך התחברות. אנא נסה לשלוח את ההודעה שוב בעוד רגע. (קוד שגיאה: ${err.message})` }) 
        };
    }
};

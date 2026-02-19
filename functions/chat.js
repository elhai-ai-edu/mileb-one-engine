// functions/chat.js — MilEd.One v4.0 (Official Google SDK)
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        const { message, history = [], classId = "general" } = JSON.parse(event.body || "{}");

        if (!process.env.GEMINI_API_KEY) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "⚠️ שגיאה: מפתח ה-API לא מוגדר בנטליפיי." }) };
        }

        // אתחול הספרייה של גוגל
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית מקצועית.`
        });

        // המרת היסטוריית השיחה לפורמט של גוגל
        const chat = model.startChat({
            history: history.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
            })),
        });

        // שליחת ההודעה
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply: text })
        };

    } catch (err) {
        console.error("SDK Error:", err);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `🔥 שגיאה בספריית גוגל: ${err.message}` }) 
        };
    }
};

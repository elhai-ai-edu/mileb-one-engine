// functions/chat.js — MilEd.One v5.0 (Strict Content Filter)
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

        if (!process.env.GEMINI_API_KEY) {
            return { statusCode: 200, headers, body: JSON.stringify({ reply: "⚠️ חסר מפתח API בנטליפיי." }) };
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית.`
        });

        // ניקוי וסינון היסטוריה - לוקחים רק הודעות תקינות ומתעלמים משגיאות קודמות
        const validHistory = history
            .filter(m => m.content && typeof m.content === 'string' && m.content.trim().length > 0)
            .filter(m => !m.content.includes("❌") && !m.content.includes("🔥")) // מסנן הודעות שגיאה קודמות
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
        console.error("Detailed Error:", err);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `הבוט מתאתחל... נסה לשלוח את ההודעה שוב. (פרטים: ${err.message})` }) 
        };
    }
};

// functions/chat.js — MilEd.One v7.0 (The Bulletproof Version)
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing in Netlify settings");

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // משתמשים במודל ללא הגדרות נוספות כדי למנוע 404
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const body = JSON.parse(event.body || "{}");
        const { message, classId = "כללי" } = body;

        // הזרקת ההנחיות ישירות לתוך השאלה
        const fullPrompt = `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית על השאלה הבאה: ${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply: text })
        };

    } catch (err) {
        console.error("Error:", err);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `תקשורת עם ג'מיני נכשלה. וודא שהמפתח בנטליפיי מעודכן. (שגיאה: ${err.message})` }) 
        };
    }
};

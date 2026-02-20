// functions/chat.js — MilEd.One v9.0 (Ultra-Stable)
exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        // ניקוי המפתח מרווחים מיותרים (קורה הרבה בהעתקה)
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
        if (!apiKey) throw new Error("מפתח ה-API חסר בנטליפיי");

        const body = JSON.parse(event.body || "{}");
        const { message, classId = "כללי" } = body;

        // שימוש ב-v1beta ובמודל המפורש
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: message }]
            }],
            systemInstruction: {
                parts: [{ text: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה תמיד בעברית.` }]
            },
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // אם flash עדיין עושה בעיות, ננסה להחליף למודל 1.0 הישן והיציב כגיבוי בתוך השגיאה
            console.error("Gemini Error:", data);
            throw new Error(data.error?.message || "תקלה בשרתי גוגל");
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה";

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply })
        };

    } catch (err) {
        console.error("Internal Error:", err);
        return { 
            statusCode: 200, 
            headers, 
            body: JSON.stringify({ reply: `⚠️ חיבור נכשל: ${err.message}.` }) 
        };
    }
};

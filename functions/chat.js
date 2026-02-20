// functions/chat.js — MilEd.One v8.0 (Direct Fetch - No SDK)
exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("מפתח ה-API חסר בהגדרות נטליפיי");

        const body = JSON.parse(event.body || "{}");
        const { message, classId = "כללי" } = body;

        // שימוש בגרסה היציבה v1 ובמודל gemini-1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{ text: `אתה עוזר למידה אקדמי בקורס ${classId}. ענה בעברית על השאלה: ${message}` }]
            }]
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);
            throw new Error(data.error?.message || "שגיאה בתקשורת מול גוגל");
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
            body: JSON.stringify({ reply: `⚠️ שגיאה בחיבור: ${err.message}. וודא שהמפתח בנטליפיי תקין.` }) 
        };
    }
};

const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
  // בדיקה שהבקשה היא מסוג POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message, classId } = JSON.parse(event.body);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // כאן אפשר להוסיף הנחיה (Prompt) ספציפית לפי classId בעתיד
    const prompt = `אתה עוזר למידה אקדמי בקורס שמזההו הוא ${classId}. ענה לסטודנט בעברית בצורה מקצועית ומסייעת: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect to AI" }),
    };
  }
};

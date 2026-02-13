exports.handler = async function(event) {

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "שלום";

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "אתה בוט פדגוגי סוקרטי." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const text = await response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: response.status,
        raw: text
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};

exports.handler = async function(event) {

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

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: data.choices?.[0]?.message?.content || "שגיאה"
    })
  };
};

export default async function handler(req, res) {
  const { message } = req.body;

  export default async function handler(req, res) {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4-0613",
        input: message
      })
    });

    const data = await response.json();

    // בדיקה של המידע שמוחזר
    let reply = "אין תשובה";

    if (data.output && Array.isArray(data.output)) {
      // מחזיר את הטקסט הראשון שנמצא ב-output
      for (const item of data.output) {
        if (item.type === "output_text" && item.text) {
          reply = item.text;
          break;
        }
      }
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
}

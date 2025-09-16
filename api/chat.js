const { OpenAI } = require("openai");

// את ה‑API Key שמים ב־Environment Variables ב‑Vercel כ־OPENAI_API_KEY
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    // שליחה ישירה ל־assistant דרך chat.completions
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // מודל אמין ויעיל
      messages: [
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content || "אין תשובה";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};

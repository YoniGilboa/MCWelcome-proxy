// Node.js CommonJS + node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch(
      "https://api.openai.com/v1/assistants/asst_vpIYytqyYNerkuX554nLubH1/responses",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          input: [
            {
              role: "user",
              content: [
                { type: "text", text: message }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // בדיקה בסיסית
    if (!data.output || !Array.isArray(data.output) || data.output.length === 0) {
      return res.status(200).json({ reply: "אין תשובה" });
    }

    // מצא את ההודעה הראשונה של האסיסטנט
    const assistantMsg = data.output.find(item => item.type === "message");
    const reply = assistantMsg?.content?.[0]?.text?.value || "אין תשובה";

    res.status(200).json({ reply });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};

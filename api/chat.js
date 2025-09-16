const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/assistants/asst_vpIYytqyYNerkuX554nLubH1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          input: message,
        }),
      }
    );

    const data = await response.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "אין תשובה";

    if (data.output && Array.isArray(data.output)) {
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
};

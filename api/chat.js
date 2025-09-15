export default async function handler(req, res) {
  const { message } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",               // או הדגם שהוגדר לאסיסטנט
        assistant_id: "asst_vpIYytqyYNerkuX554nLubH1", // MCWelcome
        input: message
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let message;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    message = body.message;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    // 1. צור thread חדש
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const thread = await threadRes.json();

    // 2. הוסף הודעה ל-thread
    await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "user",
        content: message,
      }),
    });

    // 3. הרץ את ה-assistant
    let run = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistant_id: "asst_vpIYytqyYNerkuX554nLubH1", // MCWelcome
      }),
    });
    run = await run.json();

    // 4. המתן לסיום הריצה
    let status = run.status;
    while (status === "queued" || status === "in_progress") {
      await new Promise((r) => setTimeout(r, 1500));
      const checkRun = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
      );
      const runStatus = await checkRun.json();
      status = runStatus.status;
    }

    // 5. שלוף הודעות אחרונות
    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      }
    );
    const messagesData = await messagesRes.json();

    const lastAssistantMessage = messagesData.data.find(
      (m) => m.role === "assistant"
    );

    const reply =
      lastAssistantMessage?.content?.[0]?.text?.value || "אין תשובה";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling Assistants API:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};

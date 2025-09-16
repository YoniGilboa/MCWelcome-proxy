module.exports = async function handler(req, res) {
  const { message } = req.body;

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
    if (!thread.id) {
      return res.status(500).json({ error: "Failed to create thread" });
    }

    // 2. הוסף את הודעת המשתמש
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

    // 3. הפעל את ה-assistant שלך (MCWelcome)
    const runRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistant_id: "asst_vpIYytqyYNerkuX554nLubH1",
        }),
      }
    );

    const run = await runRes.json();
    if (!run.id) {
      return res.status(500).json({ error: "Failed to start run" });
    }

    // 4. חכה שהריצה תסתיים
    let runStatus = run;
    while (runStatus.status !== "completed") {
      await new Promise((r) => setTimeout(r, 1000));
      const statusRes = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        {
          headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        }
      );
      runStatus = await statusRes.json();
      if (runStatus.status === "failed") {
        return res.status(500).json({ error: "Run failed" });
      }
    }

    // 5. שלוף הודעות אחרונות מה-thread
    const messagesRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      }
    );
    const messagesData = await messagesRes.json();

    // מצא את ההודעה האחרונה של הסוכן
    const lastAssistantMessage = messagesData.data.find(
      (m) => m.role === "assistant"
    );

    let reply = "אין תשובה";

    if (lastAssistantMessage && lastAssistantMessage.content) {
      if (lastAssistantMessage.content[0]?.text?.value) {
        reply = lastAssistantMessage.content[0].text.value;
      } else {
        reply = JSON.stringify(lastAssistantMessage.content);
      }
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};

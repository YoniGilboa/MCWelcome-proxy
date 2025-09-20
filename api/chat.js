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
    const assistantId = "asst_vpIYytqyYNerkuX554nLubH1";
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Step 1: Create a thread
    if (!threadId) {
      const threadResponse = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.text();
        console.error("Thread creation failed:", error);
        return res.status(500).json({ error: "Failed to create thread" });
      }

      const thread = await threadResponse.json();
      const threadId = thread.id;
    }

    // Step 2: Add message to thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        role: "user",
        content: message
      })
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error("Message creation failed:", error);
      return res.status(500).json({ error: "Failed to add message" });
    }

    // Step 3: Run the assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error("Run creation failed:", error);
      return res.status(500).json({ error: "Failed to run assistant" });
    }

    const run = await runResponse.json();
    const runId = run.id;

    // Step 4: Poll for completion
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (runStatus !== "completed" && runStatus !== "failed" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      if (!statusResponse.ok) {
        console.error("Status check failed");
        break;
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== "completed") {
      return res.status(500).json({ error: "Assistant run did not complete successfully" });
    }

    // Step 5: Get the response
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    if (!messagesResponse.ok) {
      const error = await messagesResponse.text();
      console.error("Messages retrieval failed:", error);
      return res.status(500).json({ error: "Failed to retrieve messages" });
    }

    const messages = await messagesResponse.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(messages, null, 2));

    let reply = "אין תשובה";

    // Find the assistant's response (most recent message with role "assistant")
    if (messages.data && messages.data.length > 0) {
      const assistantMessage = messages.data.find(msg => msg.role === "assistant");
      if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
        const textContent = assistantMessage.content.find(content => content.type === "text");
        if (textContent && textContent.text && textContent.text.value) {
          reply = textContent.text.value;
        }
      }
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
};

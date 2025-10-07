const fetch = require("node-fetch");
let threadId = null;
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    //return res.status(405).json({ error: "Method not allowed" });
    threadId = null;
    return new Response(JSON.stringify({ reset: true, error: "Method not allowed" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const { message, userData } = req.body;

  if (!message) {
    //return res.status(400).json({ error: "No message provided" });
    threadId = null;
    return new Response(JSON.stringify({ reset: true, error: "No message provided" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const assistantId = "asst_vpIYytqyYNerkuX554nLubH1";
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      //return res.status(500).json({ error: "OpenAI API key not configured" });
      threadId = null;
      return new Response(JSON.stringify({ reset: true, error: "OpenAI API key not configured" }), {
        headers: { "Content-Type": "application/json" }
      });
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
        //return res.status(500).json({ error: "Failed to create thread" });
        threadId = null;
        return new Response(JSON.stringify({ reset: true, error: "Failed to create thread" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const thread = await threadResponse.json();
      threadId = thread.id;
    }

    // Step 2: Add message to thread
    let messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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

    // אם יש שגיאה שה-thread נעול בגלל run פעיל → פותחים thread חדש
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.error("Message creation failed:", errorText);

      if (errorText.includes("while a run") && errorText.includes("is active")) {
        console.log("Thread is locked by active run. Creating new thread...");

        // פותחים thread חדש
        const newThreadResponse = await fetch("https://api.openai.com/v1/threads", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2"
          },
          body: JSON.stringify({})
        });

         if (!newThreadResponse.ok) {
          const err2 = await newThreadResponse.text();
          console.error("Thread recreation failed:", err2);
          //return res.status(500).json({ error: "Failed to recover from locked thread" });
           threadId = null;
           return new Response(JSON.stringify({ reset: true, error: "Failed to recover from locked thread" }), {
             headers: { "Content-Type": "application/json" }
           });
        }

        const newThread = await newThreadResponse.json();
        threadId = newThread.id;

        // שולחים שוב את ההודעה ל-thread החדש
        messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
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
          const err3 = await messageResponse.text();
          console.error("Message creation retry failed:", err3);
          //return res.status(500).json({ error: "Failed to add message after recreating thread" });
          threadId = null;
          return new Response(JSON.stringify({ reset: true, error: "Failed to add message after recreating thread" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } else {
        //return res.status(500).json({ error: "Failed to add message" });
        threadId = null;
        return new Response(JSON.stringify({ reset: true, error: "Failed to add message" }), {
            headers: { "Content-Type": "application/json" }
        });
      }
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
      //return res.status(500).json({ error: "Failed to run assistant" });
      threadId = null;
      return new Response(JSON.stringify({ reset: true, error: "Failed to run assistant" }), {
            headers: { "Content-Type": "application/json" }
      });
    }

    const run = await runResponse.json();
    const runId = run.id;

    // Step 4: Poll for completion
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    // 🔹 fetch עם timeout
    async function fetchWithTimeout(resource, options = {}, timeout = 3000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
         const response = await fetch(resource, {
         ...options,
         signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(id);
      }
    }

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

      // 🔹 טיפול במצב requires_action (function call)
      if (runStatus === "requires_action") {
          const toolCalls = statusData.required_action?.submit_tool_outputs?.tool_calls || [];

          for (const call of toolCalls) {
            if (call.function.name === "send_summary_to_make") {
              const args = JSON.parse(call.function.arguments);
              console.log("Calling Make webhook with:", args);

              try {
                // קריאה ל־Make עם timeout של 3 שניות
                const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
                console.log("Function call args:", args, JSON.stringify(args, null, 2));

                //await fetchWithTimeout(process.env.MAKE_WEBHOOK_URL, {
                await fetchWithTimeout("https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3", {      
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(args)
                }, 10000);
                
                //Debug calling Make
                console.log("Make response status:", response.status);
                console.log("Make response body:", await response.text());
                if (!response.ok) {
                  console.error("Make webhook returned an error status:", response.status);
                }
                
              } catch (error) {
                console.error("Make webhook call failed or timed out:", error);
                // 👆 השגיאה תירשם רק בלוג של Vercel, לא נשלחת ללקוח
              }

              // מחזירים תשובה ל־Assistant כדי לשחרר אותו
              await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                  "OpenAI-Beta": "assistants=v2"
                },
                body: JSON.stringify({
                  tool_outputs: [
                    {
                      tool_call_id: call.id,
                      output: JSON.stringify({ success: true })
                    }
                  ]
                })
              });

              // ❌ אין reset כאן — הצ'אט ממשיך רגיל, reset יהיה רק בכפתור ה־frontend
            }
          }
        }

      attempts++;
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
      //return res.status(500).json({ error: "Failed to retrieve messages" });
      return new Response(JSON.stringify({ reset: true, error: "Failed to retrieve message" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const messages = await messagesResponse.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(messages, null, 2));

    let reply = "אין תשובה";

    // Find the assistant's response (most recent message with role "assistant")
    if (messages.data && messages.data.length > 0) {
      const assistantMessage = messages.data.find(msg => msg.role === "assistant");

      // אם יש tool call → תטפל בזה
      if (assistantMessage?.content) {
        const textContent = assistantMessage.content.find(c => c.type === "text");
        if (textContent?.text?.value) {
          reply = textContent.text.value;
        }
      }

      // אם זו הודעת סיכום קרא ל make      
      //if (message === "send_summary" && userData) {
      //  await fetchWithTimeout("https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3", {
      //    method: "POST",
      //    headers: { "Content-Type": "application/json" },
      //    body: JSON.stringify(userData)
      //  }, 10000);
      //}
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    //res.status(500).json({ error: "Failed to fetch response" });
    return new Response(JSON.stringify({ reset: true, error: "Failed to etch response" }), {
        headers: { "Content-Type": "application/json" }
      });
  }
};

// Step 6: קריאה ל make בסיום הצאט
    let userData = null;

    //  נקראת מ index.html בסוף הצאט לאפשר גישה ל userData שמכיל את התשובות לשאלון וסיכום הצאט של האסיסטנט
    async function callMake(data) {
      userData = data;
      console.log("📩 userData loaded into chat.js:", userData);
      
      try {
        const response = await fetchWithTimeout("https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        }, 10000);
        console.log("✅ Data sent to Make");
      } catch (err) {
        console.error("❌ Error sending to Make:", err);
      }
    }
       
      //userData = data;
      //console.log("📩 userData loaded into chat.js:", userData);

      // קריאה ל־Make עם timeout של 3 שניות
      //const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

      //await fetchWithTimeout(process.env.MAKE_WEBHOOK_URL, {
      //await fetchWithTimeout("https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3", {      
      //  method: "POST",
      //  headers: { "Content-Type": "application/json" },
      //  body: JSON.stringify(userData)
     // }, 10000);
    }

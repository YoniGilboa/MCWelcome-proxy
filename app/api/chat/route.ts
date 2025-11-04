import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.OPENAI_ASSISTANT_ID || '';
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/35i403axct5gyl2xskvrpjmjflby8rg3';

// Helper function for fetch with timeout
async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout = 10000) {
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

export async function POST(req: NextRequest) {
  try {
    const { message, threadId, userData, resetThread, fileIds } = await req.json();

    // Reset thread if requested
    if (resetThread) {
      return NextResponse.json({ reset: true, threadId: null });
    }

    // Create a new thread if one doesn't exist
    let currentThreadId = threadId;
    if (!currentThreadId) {
      const thread = await openai.beta.threads.create();
      currentThreadId = thread.id;
    }

    // Add the user's message to the thread with file attachments if provided
    try {
      const messagePayload: any = {
        role: 'user',
        content: message,
      };

      // Attach files if provided
      if (fileIds && fileIds.length > 0) {
        messagePayload.attachments = fileIds.map((fileId: string) => ({
          file_id: fileId,
          tools: [{ type: 'file_search' }, { type: 'code_interpreter' }]
        }));
      }

      await openai.beta.threads.messages.create(currentThreadId, messagePayload);
    } catch (error: any) {
      // If thread is locked by active run, create a new thread
      if (error.message?.includes('while a run') && error.message?.includes('is active')) {
        console.log('Thread is locked by active run. Creating new thread...');
        const newThread = await openai.beta.threads.create();
        currentThreadId = newThread.id;
        
        const messagePayload: any = {
          role: 'user',
          content: message,
        };

        if (fileIds && fileIds.length > 0) {
          messagePayload.attachments = fileIds.map((fileId: string) => ({
            file_id: fileId,
            tools: [{ type: 'file_search' }, { type: 'code_interpreter' }]
          }));
        }

        await openai.beta.threads.messages.create(currentThreadId, messagePayload);
      } else {
        throw error;
      }
    }

    // Run the assistant
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id: assistantId,
    });

    // Poll for completion and handle function calls
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const runData = await openai.beta.threads.runs.retrieve(
        run.id,
        {
          thread_id: currentThreadId
        }
      );
      runStatus = runData.status;

      // Handle function calls (requires_action)
      if (runStatus === 'requires_action' && runData.required_action?.type === 'submit_tool_outputs') {
        const toolCalls = runData.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (const call of toolCalls) {
          if (call.function.name === 'send_summary_to_make') {
            const args = JSON.parse(call.function.arguments);
            console.log('Calling Make webhook with:', args);

            try {
              const response = await fetchWithTimeout(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(args)
              }, 10000);

              console.log('Make response status:', response.status);
              if (!response.ok) {
                console.error('Make webhook returned an error status:', response.status);
              }
            } catch (error) {
              console.error('Make webhook call failed or timed out:', error);
            }

            toolOutputs.push({
              tool_call_id: call.id,
              output: JSON.stringify({ success: true })
            });
          }
        }

        // Submit tool outputs
        if (toolOutputs.length > 0) {
          await openai.beta.threads.runs.submitToolOutputs(
            run.id,
            {
              thread_id: currentThreadId,
              tool_outputs: toolOutputs
            }
          );
        }
      }

      attempts++;
    }

    // Send userData to Make if provided (for summary)
    if (userData && message === 'send_summary') {
      try {
        await fetchWithTimeout(MAKE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        }, 10000);
      } catch (error) {
        console.error('Failed to send summary to Make:', error);
      }
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const assistantMessages = messages.data.filter((msg) => msg.role === 'assistant');
    
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[0];
      const textContent = lastMessage.content.find((content) => content.type === 'text');
      
      const responseText = textContent && 'text' in textContent
        ? textContent.text.value
        : 'Sorry, I could not generate a response.';

      return NextResponse.json({
        response: responseText,
        threadId: currentThreadId,
      });
    }

    return NextResponse.json(
      { error: 'No response from assistant' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message', reset: true },
      { status: 500 }
    );
  }
}

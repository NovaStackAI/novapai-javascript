// NovaPAI JavaScript SDK Example
// Install: npm install openai
// Docs: https://novapai.ai

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseURL: "https://api.novapai.ai/router/v1",
});

// ── Basic Chat ──────────────────────────────────────────────
async function basicChat() {
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Hello!" },
    ],
  });
  console.log(response.choices[0].message.content);
}

// ── Streaming ───────────────────────────────────────────────
async function streamChat() {
  const stream = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [{ role: "user", content: "Tell me a joke" }],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
  }
  console.log();
}

// ── Multi-turn Conversation ─────────────────────────────────
async function multiTurnChat() {
  const messages = [{ role: "system", content: "You are a helpful assistant." }];

  async function chat(userInput) {
    messages.push({ role: "user", content: userInput });
    const response = await client.chat.completions.create({
      model: "deepseek-v4-pro",
      messages,
    });
    const reply = response.choices[0].message.content;
    messages.push({ role: "assistant", content: reply });
    return reply;
  }

  console.log(await chat("What is 1+1?"));
  console.log(await chat("Multiply that by 10"));
}

// ── Function Calling ────────────────────────────────────────
async function functionCalling() {
  const tools = [{
    type: "function",
    function: {
      name: "get_weather",
      description: "Get current weather for a city",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name" }
        },
        required: ["city"]
      }
    }
  }];

  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
    tools,
  });

  const toolCall = response.choices[0].message.tool_calls[0];
  console.log(`Function: ${toolCall.function.name}`);
  console.log(`Args: ${toolCall.function.arguments}`);

  // Simulate function result and continue
  const functionResult = JSON.stringify({ city: "Tokyo", temperature: 22, condition: "sunny" });
  const final = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      { role: "user", content: "What's the weather in Tokyo?" },
      response.choices[0].message,
      { role: "tool", tool_call_id: toolCall.id, content: functionResult }
    ]
  });
  console.log(final.choices[0].message.content);
}

// ── JSON Mode (Structured Output) ───────────────────────────
async function jsonMode() {
  const response = await client.chat.completions.create({
    model: "deepseek-v4-pro",
    messages: [
      { role: "system", content: "Extract company info as JSON." },
      { role: "user", content: "Apple Inc. is based in Cupertino, founded in 1976." }
    ],
    response_format: { type: "json_object" }
  });
  const data = JSON.parse(response.choices[0].message.content);
  console.log(JSON.stringify(data, null, 2));
}

// ── List Available Models ───────────────────────────────────
async function listModels() {
  const models = await client.models.list();
  models.data.forEach((model) => console.log(model.id));
}

await basicChat();
await streamChat();
await multiTurnChat();
await functionCalling();
await jsonMode();
await listModels();

// NovaPAI JavaScript SDK Example
// Install: npm install openai
// Docs: https://api.novapai.ai

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

// ── List Available Models ───────────────────────────────────
async function listModels() {
  const models = await client.models.list();
  models.data.forEach((model) => console.log(model.id));
}

basicChat();

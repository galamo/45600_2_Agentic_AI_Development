import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

export const SYSTEM_PROMPT = `You are a helpful assistant with access to MCP tools over stdio.

Available tools:
- getCountries: fetch country data from public web APIs. You can filter by name or region, or list a sample of countries.
- calculator: add two numbers (a + b) and return the sum.

Guidelines:
- Use getCountries when the user asks about countries, capitals, regions, populations, or currencies.
- Use calculator when the user asks to add, sum, or calculate with two numbers.
- Present country results clearly: name, capital, region, population.
- For math, show the calculation and the result.
- If a tool returns an error, explain it and suggest how to fix the query.`;

export function createModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY in agent/.env");
  }
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  return new ChatOpenAI({
    model,
    temperature: 0.2,
    apiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
  });
}

export function toLangChainMessages(messages) {
  return (messages || []).map((m) => {
    if (m.role === "assistant") return new AIMessage(m.content);
    if (m.role === "system") return new SystemMessage(m.content);
    return new HumanMessage(m.content);
  });
}

export function getLastAiText(result) {
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || msg?.type === "ai" || msg?.role === "assistant") {
      const content = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (content.trim()) return content.trim();
    }
  }
  return "";
}

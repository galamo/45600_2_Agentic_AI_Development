import { ChatOpenRouter } from "@langchain/openrouter";
import { getEnv } from "../config/env.js";

export function createOpenRouterChatModel(model: string) {
  const env = getEnv();
  return new ChatOpenRouter({
    model,
    apiKey: env.OPENROUTER_API_KEY,
    temperature: 0.1,
  });
}

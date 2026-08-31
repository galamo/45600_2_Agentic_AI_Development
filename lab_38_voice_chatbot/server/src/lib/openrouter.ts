import { ChatOpenRouter } from "@langchain/openrouter";
import { getConfig } from "../config";

export function createOpenRouterChatModel(temperature = 0.3) {
  const config = getConfig();

  return new ChatOpenRouter({
    model: config.OPENROUTER_MODEL,
    apiKey: config.OPENROUTER_API_KEY,
    temperature,
  });
}

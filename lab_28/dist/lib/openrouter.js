import { ChatOpenRouter } from "@langchain/openrouter";
import { getEnv } from "./env.js";
export function createOpenRouterChatModel(temperature = 0.2) {
    const env = getEnv();
    return new ChatOpenRouter({
        model: env.OPENROUTER_MODEL,
        apiKey: env.OPENROUTER_API_KEY,
        temperature,
    });
}

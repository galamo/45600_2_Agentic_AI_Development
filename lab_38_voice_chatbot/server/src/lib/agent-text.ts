import { AIMessage } from "@langchain/core/messages";

export function getLastAiText(result: { messages?: unknown[] }): string {
  const messages = result.messages ?? [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as {
      type?: string;
      role?: string;
      content?: unknown;
    };

    const isAi =
      msg instanceof AIMessage ||
      msg?.type === "ai" ||
      msg?.role === "assistant";

    if (!isAi) continue;

    const content =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content ?? "");

    if (content.trim()) return content.trim();
  }

  throw new Error("Agent returned no AI text output.");
}

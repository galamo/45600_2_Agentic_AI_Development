// USED_SKILL_(langchain-openrouter-agent)
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { createOpenRouterChatModel } from "../lib/openrouter";
import { getLastAiText } from "../lib/agent-text";
import { logger } from "../lib/logger";

const SYSTEM_PROMPT = `You are a friendly voice assistant in a chat application.

Answer questions clearly and concisely in 1–3 short sentences so they sound natural when read aloud.
Use plain language. Do not use markdown, bullet lists, or code blocks unless the user explicitly asks for code.`;

export function createChatAgent() {
  return createAgent({
    model: createOpenRouterChatModel(0.3),
    tools: [],
    systemPrompt: SYSTEM_PROMPT,
  });
}

export async function runChatAgent(question: string): Promise<string> {
  const agent = createChatAgent();

  logger.info("Chat agent starting", { questionLength: question.length });

  const result = await agent.invoke({
    messages: [new HumanMessage(question)],
  });

  const answer = getLastAiText(result);

  logger.info("Chat agent finished", { answerLength: answer.length });

  return answer;
}

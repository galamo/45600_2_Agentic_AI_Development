// USED_SKILL_(langchain-openrouter-agent)
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { createOpenRouterChatModel } from "../lib/openrouter.js";
import { createSkillsAwareMiddleware } from "../lib/skills-middleware.js";
import { getLastAiText } from "../lib/agent-text.js";
import { logger } from "../lib/logger.js";

const SYSTEM_PROMPT = `You are a writing assistant in a two-agent LangGraph workflow.

You receive a user question plus research notes from a researcher agent.
You have on-demand skills. Before drafting, load and follow the clear-writing
skill (read its SKILL.md via the filesystem tools).

Base the answer only on the provided notes. Return only the final answer prose.`;

export function createWriterAgent() {
  const { middleware } = createSkillsAwareMiddleware([
    "/skills/clear-writing/",
  ]);

  return createAgent({
    model: createOpenRouterChatModel(0.4),
    tools: [],
    systemPrompt: SYSTEM_PROMPT,
    middleware,
  });
}

export async function runWriter(
  userQuery: string,
  researchNotes: string
): Promise<string> {
  const agent = createWriterAgent();

  logger.info("Writer agent starting", {
    userQuery,
    notesLength: researchNotes.length,
  });

  const result = await agent.invoke({
    messages: [
      new HumanMessage(
        [
          `User question:\n${userQuery}`,
          "",
          `Research notes:\n${researchNotes}`,
          "",
          "Write the final answer.",
        ].join("\n")
      ),
    ],
  });

  const finalAnswer = getLastAiText(result);
  logger.info("Writer agent finished", {
    answerLength: finalAnswer.length,
  });

  return finalAnswer;
}

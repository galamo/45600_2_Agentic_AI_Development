// USED_SKILL_(langchain-openrouter-agent)
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { createOpenRouterChatModel } from "../lib/openrouter.js";
import { createSkillsAwareMiddleware } from "../lib/skills-middleware.js";
import { getLastAiText } from "../lib/agent-text.js";
import { logger } from "../lib/logger.js";


const SYSTEM_PROMPT = `You are a research assistant in a two-agent LangGraph workflow.

You have on-demand skills. When researching a topic, load and follow the
research-outline skill (read its SKILL.md via the filesystem tools) before writing notes.

Return only the research notes text — no preamble about which skill you used.`;

export function createResearcherAgent() {
  const { middleware } = createSkillsAwareMiddleware([
    "/skills/research-outline/",
  ]);
  console.log("middleware", middleware);

  return createAgent({
    model: createOpenRouterChatModel(0.3),
    tools: [],
    systemPrompt: SYSTEM_PROMPT,
    middleware,
  });
}

export async function runResearcher(userQuery: string): Promise<string> {
  const agent = createResearcherAgent();

  logger.info("Researcher agent starting", { userQuery });

  const result = await agent.invoke({
    messages: [
      new HumanMessage(
        `Research this question and produce structured notes:\n\n${userQuery}`
      ),
    ],
  });

  const researchNotes = getLastAiText(result);
  logger.info("Researcher agent finished", {
    notesLength: researchNotes.length,
  });

  return researchNotes;
}

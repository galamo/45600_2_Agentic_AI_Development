import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";
import { createOpenRouterChatModel } from "../lib/openrouter.js";
import { checkNpmDeprecatedTool } from "../skills/npm-deprecated.tool.js";
import { logger } from "../lib/logger.js";
const SYSTEM_PROMPT = `You are an npm package analyst.

You have one skill available as a tool: check_npm_deprecated.
When the user gives you an npm package name, use this tool to check if the package is deprecated.

After receiving the tool result:
- Clearly state whether the package is deprecated or not.
- If deprecated, quote the deprecation notice and suggest alternatives if you know of any.
- Always mention the latest version number.
- Keep the answer concise (2–4 sentences).`;
export function createNpmCheckerAgent() {
    const model = createOpenRouterChatModel(0.2);
    return createReactAgent({
        llm: model,
        tools: [checkNpmDeprecatedTool],
        prompt: SYSTEM_PROMPT,
    });
}
export async function checkPackage(packageName) {
    const agent = createNpmCheckerAgent();
    logger.info("npm-checker agent starting", { packageName });
    const result = await agent.invoke({
        messages: [new HumanMessage(`Is the npm package "${packageName}" deprecated?`)],
    });
    const messages = result.messages;
    const lastAi = [...messages]
        .reverse()
        .find((m) => m._getType?.() === "ai");
    const answer = typeof lastAi?.content === "string"
        ? lastAi.content
        : JSON.stringify(lastAi?.content ?? "No response");
    logger.info("npm-checker agent finished", { packageName, answer });
    return answer;
}

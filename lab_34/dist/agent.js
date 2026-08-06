import { query } from "@anthropic-ai/claude-agent-sdk";
import { logger } from "./lib/logger.js";
/**
 * Ask a web-connected Claude agent a question.
 * Uses built-in WebSearch + WebFetch; no interactive permission prompts.
 */
export async function askWebAgent(question) {
    logger.info("Agent query started", { question });
    let answer = "";
    const toolsUsed = [];
    for await (const message of query({
        prompt: question,
        options: {
            model: "claude-sonnet-5",
            systemPrompt: "You are a helpful research assistant with live web access. " +
                "Use WebSearch and/or WebFetch to find current, accurate information. " +
                "Answer clearly and concisely. Cite source URLs when useful.",
            allowedTools: ["WebSearch", "WebFetch"],
            permissionMode: "bypassPermissions",
            allowDangerouslySkipPermissions: true,
        },
    })) {
        if (message.type === "assistant" && message.message?.content) {
            for (const block of message.message.content) {
                if ("name" in block && typeof block.name === "string") {
                    toolsUsed.push(block.name);
                    logger.info("Agent tool call", { tool: block.name });
                }
            }
        }
        else if (message.type === "result") {
            if (message.subtype === "success") {
                console.log(message);
                answer = message.result;
                logger.info("Agent query succeeded", {
                    durationMs: message.duration_ms,
                    toolsUsed,
                });
            }
            else {
                const subtype = message.subtype;
                const errors = "errors" in message && Array.isArray(message.errors)
                    ? message.errors
                    : [subtype];
                logger.error("Agent query failed", { subtype, errors });
                throw new Error(`Agent failed (${subtype}): ${errors.join("; ")}`);
            }
        }
    }
    if (!answer) {
        throw new Error("Agent returned no answer");
    }
    return answer;
}
class MyAgentResearch {
    async runAgent(question) {
        // implement the for loop here!
        return query({
            prompt: question,
            options: {
                systemPrompt: "bla",
                allowedTools: ["WebSearch", "WebFetch"],
            }
        });
    }
}
async function main() {
    const newAgent = new MyAgentResearch();
    const result = await newAgent.runAgent("What is the capital of France?");
}
main();

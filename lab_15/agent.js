/**
 * HOW SKILLS WORK IN THIS LAB
 * ─────────────────────────────────────────────────────────────────────────────
 * A "skill" is a self-contained sub-agent focused on one specific task.
 * This lab has one skill: the PDF Analyzer Skill (agents/pdf-analyzer.agent.js).
 *
 * The main agent (this file) stays simple:
 *   - It receives a PDF path from the user
 *   - It calls analyze_pdf (the skill's tool wrapper) and presents the result
 *
 * All the complex work — opening the file, parsing pages, reasoning about
 * structure — happens inside the skill, invisibly.
 *
 * Agent hierarchy:
 *
 *   Main Agent  ← you are here
 *     └── analyze_pdf tool        tools/analyze-pdf.tool.js
 *           └── PDF Analyzer Skill       agents/pdf-analyzer.agent.js
 *                 └── extract_pdf_text tool    tools/extract-pdf-text.tool.js
 *                       └── pdf-parse (no AI)       utils/pdf-reader.util.js
 *
 * createAgent() — how it works:
 *   createAgent({ model, tools, systemPrompt }) creates a ReAct-style executor.
 *   On invoke({ messages }), it runs a loop until the LLM returns a final answer:
 *     1. LLM receives the full message history
 *     2. LLM decides: call a tool OR produce a final text response
 *     3. If a tool is called → result appended to history → back to step 1
 *   Both the main agent and the skill use createAgent — they just have
 *   different tools and system prompts scoped to their roles.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { AIMessage } from "@langchain/core/messages";
import { createAnalyzePdfTool } from "./tools/analyze-pdf.tool.js";
import path from "path";
import { existsSync } from "fs";

const DEFAULT_SYSTEM_PROMPT = `You are a helpful document assistant.

When the user provides a PDF path, call analyze_pdf to analyze the document.
Present the analysis clearly. Answer any follow-up questions based on the analysis.
Do not make up information — only use what analyze_pdf returns.`;

function usage() {
  console.log(`Usage: npm run agent -- "<pdf-path>" [options]

Analyze a PDF document using an AI-powered skill (sub-agent).

Options:
  --debug    Print the full agent trace (tool calls, iterations)
  --help     Show this help

Environment (.env):
  OPENROUTER_API_KEY     Required — from https://openrouter.ai/keys
  OPENROUTER_MODEL       Default: openai/gpt-4.1-mini  (main agent model)
  SKILL_MODEL            Default: same as OPENROUTER_MODEL (PDF Analyzer Skill model)

Example:
  npm run agent -- ./document.pdf
  npm run agent -- --debug ./report.pdf
`);
}

function parseArgs(argv) {
  const args = { pdfPath: "", debug: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--debug") { args.debug = true; continue; }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    args.pdfPath = args.pdfPath ? `${args.pdfPath} ${arg}` : arg;
  }
  return args;
}

function getLastAiMessage(result) {
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || msg?.type === "ai" || msg?.role === "assistant") {
      const content = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (content.trim()) return content.trim();
    }
  }
  throw new Error("Agent returned no output.");
}

function printDebugTrace(result) {
  const messages = result?.messages ?? [];
  console.log("\n── Agent Trace ─────────────────────────────────────────────");
  for (const msg of messages) {
    const role = msg?.type ?? msg?.role ?? "unknown";
    if (role === "system") continue;
    console.log(`\n[${role.toUpperCase()}]`);
    if (msg.tool_calls?.length) {
      for (const call of msg.tool_calls) {
        console.log(`  → tool call: ${call.name}(${JSON.stringify(call.args)})`);
      }
    }
    const content = typeof msg.content === "string"
      ? msg.content
      : JSON.stringify(msg.content ?? "");
    if (content.trim()) console.log(content.trim().slice(0, 600));
  }
  console.log("────────────────────────────────────────────────────────────\n");
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) { usage(); return; }

  const pdfPath = parsed.pdfPath?.trim();
  if (!pdfPath) {
    console.error("Error: PDF path is required.\n");
    usage();
    process.exit(1);
  }

  const absolutePath = path.resolve(pdfPath);
  if (!existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY. Copy .env.example to .env and add your key.");
    process.exit(1);
  }

  const modelId = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4.1-mini";
  // Allow using a different model for the skill (e.g. a cheaper one for extraction).
  const skillModelId = process.env.SKILL_MODEL?.trim() || modelId;

  const model = new ChatOpenRouter({
    model: modelId,
    apiKey,
    temperature: 0.2,
    maxTokens: 800,
  });

  // The main agent only has one tool: analyze_pdf.
  // That tool internally runs the PDF Analyzer Skill (a full sub-agent).
  const analyzePdfTool = createAnalyzePdfTool({ apiKey, modelId: skillModelId });

  const agent = createAgent({
    model,
    tools: [analyzePdfTool],
    systemPrompt: process.env.SYSTEM_PROMPT?.trim() || DEFAULT_SYSTEM_PROMPT,
  });

  console.log(`Main agent model : ${modelId}`);
  console.log(`Skill model      : ${skillModelId}`);
  console.log(`PDF              : ${absolutePath}\n`);

  const result = await agent.invoke({
    messages: [{ role: "user", content: `Analyze this PDF: ${absolutePath}` }],
  });

  if (parsed.debug) printDebugTrace(result);

  console.log(getLastAiMessage(result));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

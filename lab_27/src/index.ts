import "dotenv/config";
import { getEnv } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import {
  getGraphInfo,
  runResearchWriteGraph,
} from "./graph/research-write-graph.js";

function usage() {
  console.log(`Usage: npm run agent -- "<question>"

LangGraph workflow with two createAgent nodes, each loading Agent Skills
via createSkillsMiddleware (skills API for createAgent).

Flow:
  userQuery → researcher → researchNotes → writer → finalAnswer

Environment (.env):
  OPENROUTER_API_KEY   Required
  OPENROUTER_MODEL     Default: openai/gpt-4o-mini

Example:
  npm run agent -- "Why is the sky blue?"
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    usage();
    return;
  }

  const userQuery = args.join(" ").trim() || "Why is the sky blue?";
  const env = getEnv();
  const info = getGraphInfo();

  logger.info("Lab 27 starting", {
    model: env.OPENROUTER_MODEL,
    flow: info.flow,
  });

  console.log(`Model : ${env.OPENROUTER_MODEL}`);
  console.log(`Flow  : ${info.flow}`);
  console.log(`Query : ${userQuery}\n`);

  const result = await runResearchWriteGraph(userQuery);

  console.log("── Research notes ──────────────────────────────────────");
  console.log(result.researchNotes);
  console.log("\n── Final answer ────────────────────────────────────────");
  console.log(result.finalAnswer);
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error("Lab 27 failed", { error: message });
  console.error(message);
  process.exit(1);
});

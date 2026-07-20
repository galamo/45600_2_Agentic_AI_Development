import "dotenv/config";
import { getEnv } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { checkPackage } from "./agent/npm-checker.agent.js";
function usage() {
    console.log(`Usage: npm run agent -- "<package-name>"

LangChain ReAct agent with an npm-deprecation skill implemented as a LangChain tool.

The agent receives an npm package name, calls the check_npm_deprecated tool
(which queries registry.npmjs.org), and reports whether the package is deprecated.

Skill: skills/check-npm-deprecated/SKILL.md
Tool:  src/skills/npm-deprecated.tool.ts

Environment (.env):
  OPENROUTER_API_KEY   Required
  OPENROUTER_MODEL     Default: openai/gpt-4o-mini

Examples:
  npm run agent -- "request"
  npm run agent -- "lodash"
  npm run agent -- "left-pad"
`);
}
async function main() {
    const args = process.argv.slice(2);
    if (args.includes("--help") || args.includes("-h")) {
        usage();
        return;
    }
    const packageName = args.join(" ").trim();
    if (!packageName) {
        usage();
        process.exit(1);
    }
    const env = getEnv();
    logger.info("Lab 28 starting", {
        model: env.OPENROUTER_MODEL,
        packageName,
    });
    console.log(`Model   : ${env.OPENROUTER_MODEL}`);
    console.log(`Package : ${packageName}\n`);
    const answer = await checkPackage(packageName);
    console.log("── Result ──────────────────────────────────────────────");
    console.log(answer);
}
main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Lab 28 failed", { error: message });
    console.error(message);
    process.exit(1);
});

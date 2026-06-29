/**
 * Lab 13 CLI — LangChain agent that spawns the MCP server via stdio.
 */
import "dotenv/config";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import { runToolsAgent, listMcpTools } from "./agents/tools-agent.js";
import { resolveMcpServerScript } from "./lib/mcp-client.js";

function usage() {
  console.log(`Usage: npm run chat -- [options]

LangChain agent with MCP tools over stdio (getCountries, calculator).

Options:
  --message "<text>"    Single user message (omit with --interactive)
  --interactive, -i     Multi-turn chat in the terminal
  --list-tools          List MCP tools (spawns stdio server briefly)
  --help, -h            Show this help

Environment (agent/.env):
  OPENROUTER_API_KEY    Required
  OPENROUTER_MODEL      Default: openai/gpt-4o-mini
  MCP_SERVER_SCRIPT     Default: ../mcp-server/index.js
  VERBOSE               Set to 1 for LangChain agent verbose logging

Examples:
  npm run chat -- --message "What is the capital of Japan?"
  npm run chat -- --message "What is 42 plus 58?"
  npm run chat -- -i
  npm run chat -- --list-tools
`);
}

function parseArgs(argv) {
  const args = {
    message: "",
    interactive: false,
    listTools: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg === "--list-tools") {
      args.listTools = true;
      continue;
    }
    if (arg === "--interactive" || arg === "-i") {
      args.interactive = true;
      continue;
    }
    if (arg === "--message") {
      const value = argv[++i];
      if (!value) throw new Error("--message requires a value");
      args.message = value;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    args.message = args.message ? `${args.message} ${arg}` : arg;
  }

  return args;
}

function validateArgs(args) {
  if (args.listTools) return;
  if (!args.interactive && !args.message.trim()) {
    throw new Error("Provide --message for a single turn, or use --interactive");
  }
}

async function runSingleTurn(message) {
  console.log(`\nMCP server (stdio): ${resolveMcpServerScript()}\n`);
  const result = await runToolsAgent({ messages: [], userMessage: message });
  console.log(`Agent: ${result.reply}\n`);
}

async function runInteractive() {
  const messages = [];
  const rl = readline.createInterface({ input, output });

  console.log(`\nLab 13 agent (MCP stdio). Type "exit" or "quit" to end.`);
  console.log(`MCP server: ${resolveMcpServerScript()}\n`);

  try {
    while (true) {
      const userMessage = (await rl.question("You: ")).trim();
      if (!userMessage) continue;
      if (/^(exit|quit)$/i.test(userMessage)) break;

      const result = await runToolsAgent({ messages, userMessage });

      messages.push({ role: "user", content: userMessage });
      messages.push({ role: "assistant", content: result.reply });

      console.log(`\nAgent: ${result.reply}\n`);
    }
  } finally {
    rl.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(args);
  if (args?.message?.toLowerCase() === "help") {
    usage();
    return;
  }

  if (args.listTools) {
    console.log(`Spawning MCP server: ${resolveMcpServerScript()}\n`);
    const tools = await listMcpTools();
    console.log("Available MCP tools:");
    for (const tool of tools) {
      console.log(`  - ${tool.name}: ${tool.description ?? "(no description)"}`);
    }
    return;
  }

  validateArgs(args);

  if (args.interactive) {
    await runInteractive();
  } else {
    await runSingleTurn(args.message);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

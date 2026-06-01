import "dotenv/config";
import { createAgent } from "langchain";
import { AIMessage } from "@langchain/core/messages";
import { resolveModel } from "./model.js";
import {
  MAX_SUBJECT_LENGTH,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_USER_PROMPT_TEMPLATE,
  buildUserPrompt,
} from "./prompts.js";

const tools = []; //useless 

function usage() {
  console.log(`Usage: npm run agent -- "<subject>"

Write a short happy kids story (max 5 sentences) about the subject.

Options:
  --system "<text>"   Override the system prompt for this run
  --user "<text>"     Override the user prompt template ({subject} is replaced)
  --help              Show this help

Environment (.env):
  OPENROUTER_API_KEY   Required
  OPENROUTER_MODEL     Default: openrouter:gpt-5.4
  SYSTEM_PROMPT        Optional default system prompt
  USER_PROMPT          Optional default user prompt template

Subject must be at most ${MAX_SUBJECT_LENGTH} characters.

Example:
  npm run agent -- "a bunny who loves carrots"
`);
}

function parseArgs(argv) {
  const args = {
    subject: "",
    systemPrompt: process.env.SYSTEM_PROMPT?.trim() || "",
    userPromptTemplate: process.env.USER_PROMPT?.trim() || "",
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg === "--system") {
      const value = argv[++i];
      if (!value) throw new Error("--system requires a value");
      args.systemPrompt = value;
      continue;
    }
    if (arg === "--user") {
      const value = argv[++i];
      if (!value) throw new Error("--user requires a value");
      args.userPromptTemplate = value;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    args.subject = args.subject ? `${args.subject} ${arg}` : arg;
  }

  return args;
}

function validateSubject(subject) {
  const trimmed = subject.trim();
  if (!trimmed) {
    throw new Error(
      `Please provide a story subject (max ${MAX_SUBJECT_LENGTH} characters).`,
    );
  }
  if (trimmed.length > MAX_SUBJECT_LENGTH) {
    throw new Error(
      `Subject is too long (${trimmed.length} chars). Keep it to ${MAX_SUBJECT_LENGTH} characters or fewer.`,
    );
  }
  return trimmed;
}

function getStoryText(result) {
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || msg?.type === "ai" || msg?.role === "assistant") {
      const content =
        typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (content.trim()) return content.trim();
    }
  }
  throw new Error("Agent returned no story text.");
}

async function main() {
  // input and system validation
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY. Copy .env.example to .env and add your key.");
    process.exit(1);
  }

  const subject = validateSubject(parsed.subject);
  const systemPrompt = (parsed.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
  const userPromptTemplate = parsed.userPromptTemplate || DEFAULT_USER_PROMPT_TEMPLATE;
  const userPrompt = buildUserPrompt(subject, userPromptTemplate);
  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter:gpt-5.4";

  const agent = createAgent({
    model: resolveModel(model),
    tools, // usless ignore
    systemPrompt,
  });

  console.log(`Model: ${model}`);
  console.log(`Subject: ${subject}\n`);

  const result = await agent.invoke({
    messages: [{ role: "user", content: userPrompt }],
  });

  console.log(getStoryText(result));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

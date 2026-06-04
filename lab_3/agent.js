import "dotenv/config";
import { createAgent } from "langchain";
import { AIMessage } from "@langchain/core/messages";
import { resolveModel } from "./model.js";
import {
  MAX_SUBJECT_LENGTH,
  MAX_TITLE_LENGTH,
  DEFAULT_STORY_LINES,
  MAX_STORY_LINES,
  MOODS,
  DEFAULT_MOOD,
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_USER_PROMPT_TEMPLATE,
  buildSystemPrompt,
  buildUserPrompt,
} from "./prompts.js";

const tools = []; //useless

function usage() {
  console.log(`Usage: npm run agent -- [options] "<subject>"

Write a short kids story about the subject.

Options:
  --title "<text>"    Story title (included on the first line)
  --mood happy|scary  Story tone (default: happy)
  --lines <n>         Max story lines, 1-${MAX_STORY_LINES} (default: ${DEFAULT_STORY_LINES})
  --system "<text>"   Override the system prompt for this run
  --user "<text>"     Override the user prompt template ({subject} is replaced)
  --help              Show this help

Environment (.env):
  OPENROUTER_API_KEY   Required
  OPENROUTER_MODEL     Default: openrouter:gpt-5.4
  SYSTEM_PROMPT        Optional default system prompt (skips auto mood/length/title rules)
  USER_PROMPT          Optional default user prompt template

Subject must be at most ${MAX_SUBJECT_LENGTH} characters.
Title must be at most ${MAX_TITLE_LENGTH} characters.

Examples:
  npm run agent -- "a bunny who loves carrots"
  npm run agent -- --title "Midnight Paws" --mood scary --lines 8 "a cat in an old attic"
`);
}

function parseArgs(argv) {
  const args = {
    subject: "",
    title: "",
    mood: DEFAULT_MOOD,
    lines: DEFAULT_STORY_LINES,
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
    if (arg === "--title") {
      const value = argv[++i];
      if (!value) throw new Error("--title requires a value");
      args.title = value;
      continue;
    }
    if (arg === "--mood") {
      const value = argv[++i];
      if (!value) throw new Error(`--mood requires one of: ${MOODS.join(", ")}`);
      args.mood = value;
      continue;
    }
    if (arg === "--lines") {
      const value = argv[++i];
      if (!value) throw new Error("--lines requires a number");
      args.lines = value;
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

function validateTitle(title) {
  const trimmed = title.trim();
  if (!trimmed) return "";
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Title is too long (${trimmed.length} chars). Keep it to ${MAX_TITLE_LENGTH} characters or fewer.`,
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
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    console.error("Missing API KEY - OPENROUTER_API_KEY");
    process.exit(1);
  }

  const subject = validateSubject(parsed.subject);
  const title = validateTitle(parsed.title);
  const useCustomSystem = Boolean(parsed.systemPrompt?.trim());
  const systemPrompt = useCustomSystem
    ? parsed.systemPrompt.trim()
    : buildSystemPrompt({
        mood: parsed.mood,
        lines: parsed.lines,
        title,
      });
  const userPromptTemplate = parsed.userPromptTemplate || DEFAULT_USER_PROMPT_TEMPLATE;
  const userPrompt = buildUserPrompt(subject, {
    template: userPromptTemplate,
    title,
    mood: parsed.mood,
    lines: parsed.lines,
  });
  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter:gpt-5.4";

  const agent = createAgent({
    model: resolveModel(model),
    tools,
    systemPrompt,
  });

  console.log(`Model: ${model}`);
  console.log(`Subject: ${subject}`);
  if (title) console.log(`Title: ${title}`);
  console.log(`Mood: ${parsed.mood}`);
  console.log(`Max lines: ${parsed.lines}\n`);

  const result = await agent.invoke({
    messages: [{ role: "user", content: userPrompt }],
  });

  console.log(getStoryText(result));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

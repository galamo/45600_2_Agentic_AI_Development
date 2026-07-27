import "dotenv/config";
import { AIMessage } from "@langchain/core/messages";
import {
  DEFAULT_SYSTEM_PROMPT,
  MAX_SUBJECT_LENGTH,
  runKidsStory,
} from "./src/story-agent.js";

function usage() {
  console.log(`Usage: npm run agent -- "<subject>"

Write a short happy kids story (max 5 sentences) about the subject.

Options:
  --system "<text>"   Override the system prompt for this run
  --image             Also generate and save a story illustration
  --debug             Print agent iterations, tool calls, and token usage
  --help              Show this help

Environment (.env):
  OPENROUTER_API_KEY        Required
  OPENROUTER_MODEL          Default: openai/gpt-5.5 (also try openai/gpt-5.4)
  OPENROUTER_IMAGE_MODEL    Default: openai/gpt-image-1-mini
  SYSTEM_PROMPT             Optional default system prompt

Subject must be at most ${MAX_SUBJECT_LENGTH} characters.

Example:
  npm run agent -- "a bunny who loves carrots"
  npm run agent -- --image "a bunny who loves carrots"
`);
}

function parseArgs(argv) {
  const args = {
    subject: "",
    systemPrompt: process.env.SYSTEM_PROMPT?.trim() || "",
    generateImage: false,
    debug: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }
    if (arg === "--image") {
      args.generateImage = true;
      continue;
    }
    if (arg === "--debug") {
      args.debug = true;
      continue;
    }
    if (arg === "--system") {
      const value = argv[++i];
      if (!value) {
        throw new Error("--system requires a value");
      }
      args.systemPrompt = value;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    args.subject = args.subject ? `${args.subject} ${arg}` : arg;
  }

  return args;
}

function isAiMessage(msg) {
  return msg instanceof AIMessage || msg?.type === "ai" || msg?.role === "assistant";
}

function extractReasoningFromMessage(msg) {
  const parts = [];
  const seen = new Set();

  const add = (text) => {
    const trimmed = text?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    parts.push(trimmed);
  };

  for (const block of msg.contentBlocks ?? []) {
    if (block.type === "reasoning") add(block.reasoning);
  }

  if (Array.isArray(msg.content)) {
    for (const block of msg.content) {
      if (block?.type === "reasoning") add(block.reasoning ?? block.text);
    }
  }

  add(msg.additional_kwargs?.reasoning_content);

  for (const detail of msg.additional_kwargs?.reasoning_details ?? []) {
    if (detail?.type === "reasoning.text") add(detail.text);
    if (detail?.type === "reasoning.summary") add(detail.summary);
  }

  return parts;
}

function hasEncryptedReasoningOnly(msg) {
  const details = msg.additional_kwargs?.reasoning_details ?? [];
  if (details.length === 0) return false;
  if (extractReasoningFromMessage(msg).length > 0) return false;
  return details.some((detail) => detail?.type === "reasoning.encrypted");
}

function wrapText(text, width) {
  const lines = [];
  for (const paragraph of text.split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > width) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function printReasoning(result) {
  const blocks = [];
  let encryptedOnly = false;

  for (const msg of result?.messages ?? []) {
    if (!isAiMessage(msg)) continue;
    blocks.push(...extractReasoningFromMessage(msg));
    if (hasEncryptedReasoningOnly(msg)) encryptedOnly = true;
  }

  if (blocks.length === 0 && encryptedOnly) {
    const innerWidth = 58;
    console.log(`\n┌─ Reasoning (encrypted) ${"─".repeat(16)}┐`);
    console.log(`│ ${"The model reasoned internally, but OpenRouter returned".padEnd(innerWidth)} │`);
    console.log(`│ ${"only an encrypted trace (not human-readable).".padEnd(innerWidth)} │`);
    console.log(`│ ${"".padEnd(innerWidth)} │`);
    console.log(`│ ${"Tip: set OPENROUTER_MODEL=openai/gpt-5.4 for reliable".padEnd(innerWidth)} │`);
    console.log(`│ ${"readable reasoning summaries.".padEnd(innerWidth)} │`);
    console.log(`└${"─".repeat(innerWidth + 2)}┘\n`);
    return true;
  }

  if (blocks.length === 0) return false;

  const innerWidth = 58;
  const top = `┌─ Reasoning${blocks.length > 1 ? ` (${blocks.length} steps)` : ""} `;
  const pad = "─".repeat(Math.max(0, innerWidth + 2 - top.length));
  console.log(`\n${top}${pad}┐`);

  blocks.forEach((text, index) => {
    if (blocks.length > 1) {
      console.log(`│ Step ${index + 1}${" ".repeat(innerWidth - 5 - String(index + 1).length)} │`);
      console.log(`├${"─".repeat(innerWidth + 2)}┤`);
    }
    for (const line of wrapText(text, innerWidth)) {
      console.log(`│ ${line.padEnd(innerWidth)} │`);
    }
    if (index < blocks.length - 1) {
      console.log(`├${"─".repeat(innerWidth + 2)}┤`);
    }
  });

  console.log(`└${"─".repeat(innerWidth + 2)}┘\n`);
  return true;
}

function getMessageRole(msg) {
  const type = msg?.type ?? msg?.role;
  if (type === "human" || type === "user") return "user";
  if (isAiMessage(msg)) return "assistant";
  if (type === "tool") return "tool";
  if (type === "system") return "system";
  return type ?? "unknown";
}

function formatMessageContent(msg) {
  if (typeof msg.content === "string") return msg.content.trim();
  if (Array.isArray(msg.content)) {
    return msg.content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block?.type === "text") return block.text;
        return JSON.stringify(block, null, 2);
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return String(msg.content ?? "").trim();
}

function formatTokenUsage(usage) {
  if (!usage) return null;
  const parts = [
    `tokens: ${usage.total_tokens ?? "?"}`,
    `prompt: ${usage.prompt_tokens ?? "?"}`,
    `completion: ${usage.completion_tokens ?? "?"}`,
  ];
  const reasoning = usage.completion_tokens_details?.reasoning_tokens;
  if (reasoning != null) parts.push(`reasoning: ${reasoning}`);
  if (usage.cost != null) parts.push(`cost: $${Number(usage.cost).toFixed(6)}`);
  return parts.join(" · ");
}

function printBoxSection(title, lines, innerWidth = 58) {
  const divider = `├${"─".repeat(innerWidth + 2)}┤`;
  console.log(divider);
  console.log(`│ ${title.padEnd(innerWidth)} │`);
  console.log(divider);
  for (const line of lines) {
    if (line === "") {
      console.log(`│ ${"".padEnd(innerWidth)} │`);
      continue;
    }
    for (const wrapped of wrapText(line, innerWidth)) {
      console.log(`│ ${wrapped.padEnd(innerWidth)} │`);
    }
  }
}

function printAgentTrace(result) {
  const messages = result?.messages ?? [];
  if (messages.length === 0) return false;

  const innerWidth = 58;
  let iteration = 0;
  let toolCallCount = 0;
  let totalCost = 0;
  const sections = [];

  for (const msg of messages) {
    const role = getMessageRole(msg);
    const lines = [];

    if (role === "user") {
      sections.push({ title: "Input · user", lines: [formatMessageContent(msg) || "(empty)"] });
      continue;
    }

    if (role === "system") {
      sections.push({ title: "System", lines: [formatMessageContent(msg) || "(empty)"] });
      continue;
    }

    if (role === "assistant") {
      iteration += 1;
      const usage = formatTokenUsage(msg.response_metadata?.tokenUsage);
      if (msg.response_metadata?.tokenUsage?.cost != null) {
        totalCost += Number(msg.response_metadata.tokenUsage.cost);
      }

      const reasoning = extractReasoningFromMessage(msg);
      if (reasoning.length > 0) {
        lines.push("reasoning:");
        for (const part of reasoning) lines.push(`  ${part}`);
      }

      const text = formatMessageContent(msg);
      if (text) {
        if (lines.length > 0) lines.push("");
        lines.push("response:");
        lines.push(`  ${text}`);
      }

      if (msg.tool_calls?.length > 0) {
        if (lines.length > 0) lines.push("");
        lines.push("tool_calls:");
        for (const call of msg.tool_calls) {
          toolCallCount += 1;
          const argsJson = JSON.stringify(call.args ?? {}, null, 2);
          lines.push(`  → ${call.name}(${argsJson})`);
        }
      }

      if (!text && !reasoning.length && !msg.tool_calls?.length) {
        lines.push("(empty assistant message)");
      }

      const title = `Iteration ${iteration} · assistant${usage ? ` · ${usage}` : ""}`;
      sections.push({ title, lines });
      continue;
    }

    if (role === "tool") {
      const toolName = msg.name ?? "tool";
      const toolCallId = msg.tool_call_id ? ` · id ${msg.tool_call_id}` : "";
      sections.push({
        title: `Iteration ${iteration} · tool · ${toolName}${toolCallId}`,
        lines: [formatMessageContent(msg) || "(empty tool result)"],
      });
    }
  }

  const header = `┌─ Agent trace · ${iteration} iteration${iteration === 1 ? "" : "s"} · ${toolCallCount} tool call${toolCallCount === 1 ? "" : "s"} `;
  console.log(`\n${header}${"─".repeat(Math.max(0, innerWidth + 2 - header.length))}┐`);

  for (const section of sections) {
    printBoxSection(section.title, section.lines, innerWidth);
  }

  const summaryLines = [
    `messages: ${messages.length}`,
    `iterations: ${iteration}`,
    `tool calls: ${toolCallCount}`,
  ];
  if (totalCost > 0) summaryLines.push(`total cost: $${totalCost.toFixed(6)}`);

  console.log(`├${"─".repeat(innerWidth + 2)}┤`);
  printBoxSection("Summary", summaryLines, innerWidth);
  console.log(`└${"─".repeat(innerWidth + 2)}┘\n`);
  return true;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    usage();
    return;
  }

  const { story, imagePath, modelId, imageModel, result } = await runKidsStory({
    subject: parsed.subject,
    generateImage: parsed.generateImage,
    systemPrompt: parsed.systemPrompt || DEFAULT_SYSTEM_PROMPT,
  });

  console.log(`Model: ${modelId}`);
  if (parsed.generateImage && imageModel) {
    console.log(`Image model: ${imageModel}`);
  }
  if (parsed.debug) {
    console.log("Debug: on (agent trace enabled)");
  }
  console.log(`Subject: ${parsed.subject.trim()}\n`);

  if (parsed.debug) {
    printAgentTrace(result);
  } else {
    printReasoning(result);
  }

  console.log(story);

  if (parsed.generateImage && imagePath) {
    console.log(`\nImage saved: ${imagePath}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});

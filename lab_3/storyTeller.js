import { createAgent } from "langchain";
import { AIMessage } from "@langchain/core/messages";
import { getStoryModel, resolveModel } from "./model.js";
import {
  MAX_SUBJECT_LENGTH,
  MAX_TITLE_LENGTH,
  DEFAULT_STORY_LINES,
  DEFAULT_USER_PROMPT_TEMPLATE,
  buildSystemPrompt,
  buildUserPrompt,
  normalizeMood,
  normalizeStoryLines,
} from "./prompts.js";

export { MAX_SUBJECT_LENGTH, MAX_TITLE_LENGTH };

export function validateSubject(subject) {
  const trimmed = String(subject ?? "").trim();
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

export function validateTitle(title) {
  const trimmed = String(title ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Title is too long (${trimmed.length} chars). Keep it to ${MAX_TITLE_LENGTH} characters or fewer.`,
    );
  }
  return trimmed;
}

function optionalString(value, fieldName) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string when provided.`);
  }
  return value;
}

/**
 * Validates JSON body for the story-teller chat entrypoint.
 */
export function validateStoryRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("Request body must be a JSON object.");
  }

  const {
    subject,
    title,
    mood,
    lines,
    systemPrompt,
    userPromptTemplate,
  } = body;

  if (subject === undefined || subject === null) {
    throw new Error("subject is required.");
  }
  if (typeof subject !== "string") {
    throw new Error("subject must be a string.");
  }

  if (title !== undefined && title !== null && typeof title !== "string") {
    throw new Error("title must be a string when provided.");
  }

  if (mood !== undefined && mood !== null && typeof mood !== "string") {
    throw new Error("mood must be a string when provided.");
  }

  if (
    lines !== undefined &&
    lines !== null &&
    typeof lines !== "number" &&
    typeof lines !== "string"
  ) {
    throw new Error("lines must be a number or string when provided.");
  }

  const system = optionalString(systemPrompt, "systemPrompt");
  const userTemplate = optionalString(userPromptTemplate, "userPromptTemplate");

  return {
    subject: validateSubject(subject),
    title: validateTitle(title ?? ""),
    mood: normalizeMood(mood),
    lines: normalizeStoryLines(lines),
    systemPrompt: system.trim(),
    userPromptTemplate: userTemplate.trim(),
  };
}

export function getStoryText(result) {
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

export async function runStoryTeller({
  subject,
  title = "",
  mood,
  lines,
  systemPrompt = "",
  userPromptTemplate = "",
}) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing API KEY - OPENROUTER_API_KEY");
  }

  const validatedSubject = validateSubject(subject);
  const validatedTitle = validateTitle(title);
  const normalizedMood = normalizeMood(mood);
  const lineCount = normalizeStoryLines(lines);
  const resolvedModel = getStoryModel();

  const useCustomSystem = Boolean(systemPrompt?.trim());
  const resolvedSystemPrompt = useCustomSystem
    ? systemPrompt.trim()
    : buildSystemPrompt({
        mood: normalizedMood,
        lines: lineCount,
        title: validatedTitle,
      });
  const template = userPromptTemplate || DEFAULT_USER_PROMPT_TEMPLATE;
  const userPrompt = buildUserPrompt(validatedSubject, {
    template,
    title: validatedTitle,
    mood: normalizedMood,
    lines: lineCount,
  });

  const agent = createAgent({
    model: resolveModel(resolvedModel),
    tools: [],
    systemPrompt: resolvedSystemPrompt,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: userPrompt }],
  });

  return {
    story: getStoryText(result),
    subject: validatedSubject,
    title: validatedTitle,
    mood: normalizedMood,
    lines: lineCount,
    model: resolvedModel,
  };
}

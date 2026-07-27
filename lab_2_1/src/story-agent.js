import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { AIMessage } from "@langchain/core/messages";
import { createGenerateStoryImageTool } from "../tools/generate-story-image.tool.js";
import { createSaveStoryImageTool } from "../tools/save-story-image.tool.js";

export const MAX_SUBJECT_LENGTH = 80;

export const DEFAULT_SYSTEM_PROMPT = `You write short, happy stories for young children (ages 4–8).

Rules:
- Write at most 5 sentences total.
- Use simple words and a warm, cheerful tone.
- End on a positive note.
- Do not include a title, labels, or metadata—only the story text.
- You have access to generate_story_image and save_story_image tools.
- Call generate_story_image ONLY when the user explicitly asks for an image, picture, or illustration.
- generate_story_image returns an imageId; it does not save the file.
- Call save_story_image with that imageId ONLY when the user explicitly wants the image saved, or when you are told to save the illustration.
- If the user did not ask for an image, write the story only and do not call any tools.`;

export function validateSubject(subject) {
  const trimmed = subject.trim();
  if (!trimmed) {
    throw new Error("Please provide a story subject (max 80 characters).");
  }
  if (trimmed.length > MAX_SUBJECT_LENGTH) {
    throw new Error(
      `Subject is too long (${trimmed.length} chars). Keep it to ${MAX_SUBJECT_LENGTH} characters or fewer.`,
    );
  }
  return trimmed;
}

export function getStoryText(result) {
  const messages = result?.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof AIMessage || msg?.type === "ai" || msg?.role === "assistant") {
      const content = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
      if (content.trim()) return content.trim();
    }
  }
  throw new Error("Agent returned no story text.");
}

export function getSavedImagePath(result) {
  const messages = result?.messages ?? [];
  for (const msg of messages) {
    const content = typeof msg.content === "string" ? msg.content : String(msg.content ?? "");
    const match = content.match(/saved to (generated-images\/[^\s]+)/i);
    if (match) return match[1];
  }
  return null;
}

/**
 * Run the kids-story agent and return the story (and optional saved image path).
 * @param {{ subject: string, generateImage?: boolean, systemPrompt?: string }} options
 */
export async function runKidsStory({
  subject,
  generateImage = false,
  systemPrompt = "",
}) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY. Copy .env.example to .env and add your key.");
  }

  const validatedSubject = validateSubject(subject);
  const resolvedSystemPrompt = (
    systemPrompt?.trim() ||
    process.env.SYSTEM_PROMPT?.trim() ||
    DEFAULT_SYSTEM_PROMPT
  ).trim();
  const modelId = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-5.5";
  const imageModel = process.env.OPENROUTER_IMAGE_MODEL?.trim() || "openai/gpt-image-1-mini";

  const model = new ChatOpenRouter({
    model: modelId,
    apiKey,
    temperature: 0.8,
    maxTokens: 1200,
    modelKwargs: {
      reasoning: { effort: "medium", summary: "detailed" },
    },
  });

  const generateStoryImageTool = createGenerateStoryImageTool({
    apiKey,
    imageModel,
  });
  const saveStoryImageTool = createSaveStoryImageTool();

  const agent = createAgent({
    model,
    tools: [generateStoryImageTool, saveStoryImageTool],
    systemPrompt: resolvedSystemPrompt,
  });

  const userPrompt = generateImage
    ? `Write a short happy story for kids about: ${validatedSubject}

After writing the story, generate an illustration image for it, then save it to disk.`
    : `Write a short happy story for kids about: ${validatedSubject}`;

  const result = await agent.invoke({
    messages: [{ role: "user", content: userPrompt }],
  });

  const story = getStoryText(result);
  const imagePath = generateImage ? getSavedImagePath(result) : null;

  return {
    story,
    imagePath,
    modelId,
    imageModel: generateImage ? imageModel : null,
    result,
  };
}

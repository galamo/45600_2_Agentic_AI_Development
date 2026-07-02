import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { requestOpenRouterImage } from "../services/openrouter-images.service.js";

export const STORY_IMAGE_AGENT_SYSTEM_PROMPT = `You create kid-friendly story illustrations.

Rules:
- Read the story text and optional visual direction from the user.
- Craft a single clear, warm, colorful children's-book illustration prompt.
- Call render_illustration exactly once with your final visual prompt.
- After the tool succeeds, reply with a short confirmation that includes the visual prompt you used.
- Do not invent image data — only use what render_illustration returns.`;

function buildRenderIllustrationTool({ apiKey, imageModel }) {
  return tool(
    async ({ visualPrompt }) => {
      const prompt = visualPrompt.trim();
      if (!prompt) {
        return JSON.stringify({ success: false, error: "visualPrompt is required." });
      }

      try {
        const imageBase64 = await requestOpenRouterImage({
          apiKey,
          model: imageModel,
          prompt,
        });

        return JSON.stringify({
          success: true,
          visualPrompt: prompt,
          imageBase64,
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error: err.message || String(err),
        });
      }
    },
    {
      name: "render_illustration",
      description:
        "Render a kid-friendly story illustration from a visual prompt using the configured image model.",
      schema: z.object({
        visualPrompt: z
          .string()
          .describe(
            "A detailed children's-book illustration prompt: warm, colorful, kid-friendly style.",
          ),
      }),
    },
  );
}

/**
 * Factory for a reusable story-image sub-agent.
 * @param {{ apiKey: string, imageModel: string, model?: import("@langchain/core/language_models/chat_models").BaseChatModel, systemPrompt?: string }} options
 */
export function createStoryImageAgent({
  apiKey,
  imageModel,
  model,
  systemPrompt = STORY_IMAGE_AGENT_SYSTEM_PROMPT,
}) {
  const chatModel =
    model ??
    new ChatOpenRouter({
      model: imageModel,
      apiKey,
      temperature: 0.7,
      maxTokens: 800,
    });

  const renderIllustrationTool = buildRenderIllustrationTool({ apiKey, imageModel });

  return createAgent({
    model: chatModel,
    tools: [renderIllustrationTool],
    systemPrompt,
  });
}

function buildStoryImageUserMessage({ storyText, imagePrompt }) {
  const trimmedStory = storyText.trim();
  const trimmedPrompt = imagePrompt?.trim();

  if (trimmedPrompt) {
    return `Story text:\n${trimmedStory}\n\nVisual direction:\n${trimmedPrompt}`;
  }

  return `Story text:\n${trimmedStory}\n\nCreate a kid-friendly illustration prompt from this story, then render it.`;
}

function parseToolPayload(content) {
  if (typeof content !== "string" || !content.trim()) return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Extract the rendered image payload from an agent invoke result.
 * @param {{ messages?: Array<{ type?: string, role?: string, name?: string, content?: unknown }> }} result
 */
export function extractRenderedImageFromResult(result) {
  const messages = result?.messages ?? [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const isToolMessage = msg?.type === "tool" || msg?.role === "tool";
    if (!isToolMessage || msg?.name !== "render_illustration") continue;

    const payload = parseToolPayload(
      typeof msg.content === "string" ? msg.content : String(msg.content ?? ""),
    );
    if (payload?.success && payload.imageBase64) {
      return {
        imageBase64: payload.imageBase64,
        visualPrompt: payload.visualPrompt,
      };
    }
    if (payload?.error) {
      throw new Error(payload.error);
    }
  }

  throw new Error("Story image agent did not produce an illustration.");
}

/**
 * Run the story-image agent and return generated image data.
 * @param {{ apiKey: string, imageModel: string, storyText: string, imagePrompt?: string, model?: import("@langchain/core/language_models/chat_models").BaseChatModel, systemPrompt?: string }} options
 */
export async function generateStoryImage({
  apiKey,
  imageModel,
  storyText,
  imagePrompt,
  model,
  systemPrompt,
}) {
  const trimmedStory = storyText?.trim();
  if (!trimmedStory) {
    throw new Error("storyText is required to generate an illustration.");
  }

  const agent = createStoryImageAgent({
    apiKey,
    imageModel,
    model,
    systemPrompt,
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: buildStoryImageUserMessage({ storyText: trimmedStory, imagePrompt }),
      },
    ],
  });

  return extractRenderedImageFromResult(result);
}

// USED_SKILL_(langchain-openrouter-agent)
import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { z } from "zod";
import { getAgentText, parseJsonFromAgentText } from "../utils/json-parse.js";
import { imageToBase64DataUrl } from "../utils/vision.js";

const KeywordsSchema = z.object({
  keywords: z
    .array(z.string())
    .describe(
      "Short searchable keywords for the image: objects, colors, themes, scene, style, and visible text",
    ),
});

export type ImageKeywordsResult = z.infer<typeof KeywordsSchema>;

const SYSTEM_PROMPT = `You are an image keyword extraction agent.

Analyze the provided image and return only valid JSON with this exact shape:
{
  "keywords": ["keyword1", "keyword2", "..."]
}

Rules:
- Include 8–20 concise keywords.
- Cover objects, scene, colors, mood, style, and any visible text.
- Use lowercase except for proper nouns.
- Include synonyms that would help search.
- Do not invent details that are not visible.
- Do not include markdown or extra fields.`;

function createOpenRouterVisionModel() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY in .env");
  }

  const modelId =
    process.env.OPENROUTER_VISION_MODEL?.trim() || "openai/gpt-4o-mini";

  return new ChatOpenRouter({
    model: modelId,
    apiKey,
    temperature: 0.1,
  });
}

export function createImageKeywordsAgent() {
  return createAgent({
    model: createOpenRouterVisionModel(),
    tools: [],
    systemPrompt: SYSTEM_PROMPT,
  });
}

export async function analyzeImageKeywords(
  imagePath: string,
): Promise<ImageKeywordsResult> {
  const agent = createImageKeywordsAgent();
  const { dataUrl } = imageToBase64DataUrl(imagePath);

  const result = await agent.invoke({
    messages: [
      new HumanMessage({
        content: [
          {
            type: "text",
            text: "Analyze this image and return the keywords JSON.",
          },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      }),
    ],
  });

  const rawText = getAgentText(result);
  return KeywordsSchema.parse(parseJsonFromAgentText(rawText));
}

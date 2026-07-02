import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { generateStoryImage } from "../agents/story-image.agent.js";
import { putStoryImage } from "../utils/story-image-store.util.js";

/**
 * Tool wrapper that delegates illustration work to the story-image sub-agent.
 * Returns an imageId for the main agent to optionally persist via save_story_image.
 */
export function createGenerateStoryImageTool({ apiKey, imageModel, model }) {
  return tool(
    async ({ storyText, imagePrompt }) => {
      const trimmedStory = storyText.trim();
      if (!trimmedStory) {
        return "Error: storyText is required to generate an illustration.";
      }

      try {
        const { imageBase64, visualPrompt } = await generateStoryImage({
          apiKey,
          imageModel,
          storyText: trimmedStory,
          imagePrompt,
          model,
        });

        const imageId = putStoryImage({
          imageBase64,
          visualPrompt,
          storyText: trimmedStory,
        });

        return JSON.stringify({
          success: true,
          imageId,
          visualPrompt,
          message:
            "Illustration generated. Use save_story_image with this imageId when the user wants the file saved.",
        });
      } catch (err) {
        return `Error generating illustration: ${err.message || String(err)}`;
      }
    },
    {
      name: "generate_story_image",
      description:
        "Generate a kid-friendly illustration for a story using the story-image agent. " +
        "Call this ONLY when the user explicitly asks for an image, picture, or illustration. " +
        "Returns an imageId — use save_story_image to persist the file when appropriate.",
      schema: z.object({
        storyText: z
          .string()
          .describe("The complete story text that should be illustrated."),
        imagePrompt: z
          .string()
          .optional()
          .describe(
            "Optional visual description for the image. If omitted, the image agent derives one from the story.",
          ),
      }),
    },
  );
}

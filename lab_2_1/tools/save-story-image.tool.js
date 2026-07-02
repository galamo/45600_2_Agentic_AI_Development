import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { saveStoryImage } from "../utils/save-story-image.util.js";
import { getStoryImage } from "../utils/story-image-store.util.js";

/**
 * Tool that lets the main agent persist a generated illustration to disk.
 */
export function createSaveStoryImageTool({ outputDir } = {}) {
  return tool(
    async ({ imageId, storyText }) => {
      const entry = getStoryImage(imageId);
      if (!entry) {
        return `Error: no generated image found for imageId "${imageId}". Call generate_story_image first.`;
      }

      try {
        const { relativePath } = await saveStoryImage({
          imageBase64: entry.imageBase64,
          storyText: storyText?.trim() || entry.storyText,
          outputDir,
        });

        return `Image saved to ${relativePath}`;
      } catch (err) {
        return `Error saving image: ${err.message || String(err)}`;
      }
    },
    {
      name: "save_story_image",
      description:
        "Save a previously generated story illustration to generated-images/. " +
        "Use after generate_story_image when the user explicitly wants the image saved, " +
        "or when you were instructed to save the illustration.",
      schema: z.object({
        imageId: z
          .string()
          .describe("The imageId returned by generate_story_image."),
        storyText: z
          .string()
          .optional()
          .describe("Optional story text for the filename. Defaults to the text used during generation."),
      }),
    },
  );
}


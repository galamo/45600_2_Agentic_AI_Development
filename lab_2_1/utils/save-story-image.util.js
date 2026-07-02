import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_OUTPUT_DIR = path.join(__dirname, "..", "generated-images");

export function slugifyStory(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function ensureOutputDir(outputDir = DEFAULT_OUTPUT_DIR) {
  await fs.mkdir(outputDir, { recursive: true });
}

/**
 * Persist a base64 PNG illustration for a story.
 * @param {{ imageBase64: string, storyText: string, outputDir?: string }} options
 * @returns {Promise<{ filePath: string, relativePath: string, fileName: string }>}
 */
export async function saveStoryImage({ imageBase64, storyText, outputDir = DEFAULT_OUTPUT_DIR }) {
  const trimmedStory = storyText?.trim() || "story";
  await ensureOutputDir(outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storySlug = slugifyStory(trimmedStory) || "story";
  const fileName = `story-${storySlug}-${timestamp}.png`;
  const filePath = path.join(outputDir, fileName);

  await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));

  const relativePath = path.join("generated-images", fileName);
  return { filePath, relativePath, fileName };
}

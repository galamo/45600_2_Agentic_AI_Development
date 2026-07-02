import { randomUUID } from "node:crypto";

const store = new Map();

/**
 * In-memory store for generated images so agents exchange compact image IDs
 * instead of large base64 payloads in LLM context.
 */
export function putStoryImage({ imageBase64, visualPrompt, storyText }) {
  const imageId = randomUUID();
  store.set(imageId, {
    imageBase64,
    visualPrompt,
    storyText: storyText?.trim() || "",
    createdAt: Date.now(),
  });
  return imageId;
}

export function getStoryImage(imageId) {
  return store.get(imageId) ?? null;
}

export function takeStoryImage(imageId) {
  const entry = store.get(imageId);
  if (!entry) return null;
  store.delete(imageId);
  return entry;
}

export function clearStoryImageStore() {
  store.clear();
}

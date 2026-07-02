import axios from "axios";

const OPENROUTER_IMAGES_URL = "https://openrouter.ai/api/v1/images";

export const DEFAULT_IMAGE_REQUEST_PARAMS = {
  n: 1,
  aspect_ratio: "1:1",
  output_format: "png",
};

/**
 * Request a single image from the OpenRouter images API.
 * @param {{ apiKey: string, model: string, prompt: string }} options
 * @returns {Promise<string>} base64-encoded PNG data
 */
export async function requestOpenRouterImage({ apiKey, model, prompt }) {
  try {
    const { data: result } = await axios.post(
      OPENROUTER_IMAGES_URL,
      {
        model,
        prompt,
        ...DEFAULT_IMAGE_REQUEST_PARAMS,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const imageData = result?.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error("OpenRouter image API returned no image data.");
    }

    return imageData;
  } catch (err) {
    const status = err.response?.status;
    const errorText = err.response?.data ?? err.message;
    if (status) {
      throw new Error(
        `OpenRouter image API failed (${status}): ${typeof errorText === "string" ? errorText : JSON.stringify(errorText)}`,
      );
    }
    throw err;
  }
}

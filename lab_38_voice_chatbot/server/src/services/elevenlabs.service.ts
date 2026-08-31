import axios from "axios";
import { getConfig } from "../config";
import { logger } from "../lib/logger";

export type SpeechResult = {
  audioBase64: string;
  mimeType: "audio/mpeg";
};

function elevenLabsErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : "ElevenLabs TTS failed";
  }

  const status = err.response?.status;
  const raw = err.response?.data;

  let detail = err.message;
  if (typeof raw === "string") {
    detail = raw;
  } else if (raw instanceof ArrayBuffer) {
    detail = Buffer.from(raw).toString("utf8");
  } else if (raw && typeof raw === "object" && "detail" in raw) {
    detail = String((raw as { detail: unknown }).detail);
  }

  if (status === 402) {
    return "ElevenLabs TTS failed: account has no credits or requires a paid plan (HTTP 402).";
  }

  return `ElevenLabs TTS failed (HTTP ${status ?? "unknown"}): ${detail}`;
}

export async function textToSpeech(text: string): Promise<SpeechResult> {
  const config = getConfig();
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${config.ELEVENLABS_VOICE_ID}`;

  logger.info("ElevenLabs TTS request", {
    textLength: text.length,
    voiceId: config.ELEVENLABS_VOICE_ID,
  });

  try {
    const response = await axios.post<ArrayBuffer>(
      url,
      {
        text,
        model_id: config.ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": config.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    const audioBase64 = Buffer.from(response.data).toString("base64");

    logger.info("ElevenLabs TTS finished", {
      audioBytes: response.data.byteLength,
    });

    return {
      audioBase64,
      mimeType: "audio/mpeg",
    };
  } catch (err) {
    const message = elevenLabsErrorMessage(err);
    logger.error("ElevenLabs TTS failed", { error: message });
    throw new Error(message);
  }
}

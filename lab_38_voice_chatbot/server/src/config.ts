import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
  OPENROUTER_MODEL: z.string().default("openai/gpt-4o-mini"),
  ELEVENLABS_API_KEY: z.string().min(1, "ELEVENLABS_API_KEY is required"),
  ELEVENLABS_VOICE_ID: z.string().default("21m00Tcm4TlvDq8ikWAM"),
  ELEVENLABS_MODEL_ID: z.string().default("eleven_multilingual_v2"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default("info"),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim(),
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini",
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY?.trim(),
    ELEVENLABS_VOICE_ID:
      process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM",
    ELEVENLABS_MODEL_ID:
      process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2",
    PORT: process.env.PORT ?? "3001",
    LOG_LEVEL: process.env.LOG_LEVEL?.trim() || "info",
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(message);
  }

  cached = parsed.data;
  return cached;
}

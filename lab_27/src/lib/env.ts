import "dotenv/config";

export type LabEnv = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  LOG_LEVEL: string;
};

let cached: LabEnv | null = null;

export function getEnv(): LabEnv {
  if (cached) return cached;

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY in .env (see .env.example)");
  }

  cached = {
    OPENROUTER_API_KEY: apiKey,
    OPENROUTER_MODEL:
      process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini",
    LOG_LEVEL: process.env.LOG_LEVEL?.trim() || "info",
  };

  return cached;
}

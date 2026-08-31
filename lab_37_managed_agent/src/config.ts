import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  AGENT_ID: z.string().min(1, "AGENT_ID is required"),
  ENVIRONMENT_ID: z.string().min(1, "ENVIRONMENT_ID is required"),
  PORT: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues.map((issue) => issue.message).join(", ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const config = {
  anthropicApiKey: parsedEnv.data.ANTHROPIC_API_KEY,
  agentId: parsedEnv.data.AGENT_ID,
  environmentId: parsedEnv.data.ENVIRONMENT_ID,
  port: Number(parsedEnv.data.PORT ?? 3000),
};

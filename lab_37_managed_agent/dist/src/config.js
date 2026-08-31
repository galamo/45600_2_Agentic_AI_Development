"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    ANTHROPIC_API_KEY: zod_1.z.string().min(1, "ANTHROPIC_API_KEY is required"),
    AGENT_ID: zod_1.z.string().min(1, "AGENT_ID is required"),
    ENVIRONMENT_ID: zod_1.z.string().min(1, "ENVIRONMENT_ID is required"),
    PORT: zod_1.z.string().optional(),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    const message = parsedEnv.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid environment configuration: ${message}`);
}
exports.config = {
    anthropicApiKey: parsedEnv.data.ANTHROPIC_API_KEY,
    agentId: parsedEnv.data.AGENT_ID,
    environmentId: parsedEnv.data.ENVIRONMENT_ID,
    port: Number(parsedEnv.data.PORT ?? 3000),
};

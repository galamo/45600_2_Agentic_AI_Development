import "dotenv/config";

export type LabEnv = {
  MCP_PORT: number;
  LOG_LEVEL: string;
};

let cached: LabEnv | null = null;

export function getEnv(): LabEnv {
  if (cached) return cached;

  const portRaw = process.env.MCP_PORT?.trim();
  const port = portRaw ? Number(portRaw) : 3300;
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("MCP_PORT must be a positive number");
  }

  cached = {
    MCP_PORT: port,
    LOG_LEVEL: process.env.LOG_LEVEL?.trim() || "info",
  };

  return cached;
}

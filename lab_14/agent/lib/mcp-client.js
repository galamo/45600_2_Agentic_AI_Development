import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MCP_SCRIPT = path.resolve(__dirname, "../../mcp-server/index.js");

export function resolveMcpServerScript() {
  return process.env.MCP_SERVER_SCRIPT || DEFAULT_MCP_SCRIPT;
}

export function formatMcpToolResult(result) {
  const texts = (result.content || [])
    .filter((c) => c.type === "text")
    .map((c) => c.text);
  return texts.join("\n") || JSON.stringify(result);
}

/**
 * Spawn the MCP server as a child process (stdio).
 * Lab 14 calls client.callTool() directly — no LangChain tool wrapper here.
 */
export async function connectToolsMcpStdio() {
  const scriptPath = resolveMcpServerScript();

  const transport = new StdioClientTransport({
    command: "node",
    args: [scriptPath],
    stderr: "inherit",
    env: { ...process.env },
  });

  const client = new Client(
    { name: "lab14-tools-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);

  return {
    client,
    transport,
    scriptPath,
    close: async () => {
      try {
        await transport.close();
      } catch {
        /* ignore */
      }
    },
  };
}

export async function listMcpToolDefinitions(client) {
  const { tools } = await client.listTools();
  return tools;
}

export { DEFAULT_MCP_SCRIPT };

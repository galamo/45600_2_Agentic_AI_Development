import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// ResolveMCP_OLD
// ResolveMCP_NEW - what you build
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_MCP_SCRIPT = path.resolve(__dirname, "../../mcp-server/index.js");

function mcpInputSchemaToZod(jsonSchema) {
  if (!jsonSchema || typeof jsonSchema !== "object") return z.object({});
  const props = jsonSchema.properties;
  const required = new Set(jsonSchema.required || []);
  if (!props || typeof props !== "object") return z.object({});

  const shape = {};
  for (const [key, prop] of Object.entries(props)) {
    if (!prop || typeof prop !== "object") {
      shape[key] = z.any().optional().nullable();
      continue;
    }
    let field;
    switch (prop.type) {
      case "string":
        field = z.string();
        break;
      case "number":
      case "integer":
        field = z.number();
        break;
      case "boolean":
        field = z.boolean();
        break;
      default:
        field = z.any();
    }
    if (!required.has(key)) field = field.optional().nullable();
    shape[key] = field;
  }
  return z.object(shape);
}

async function getMcpToolsAsLangChain(mcpClient) {
  const { tools } = await mcpClient.listTools();
  return tools.map((t) => {
    const name = t.name;
    const description = t.description ?? `Call MCP tool: ${name}`;
    const schema = mcpInputSchemaToZod(t.inputSchema);
    return new DynamicStructuredTool({
      name,
      description,
      schema,
      func: async (args) => {
        const result = await mcpClient.callTool({ name, arguments: args });
        const texts = (result.content || [])
          .filter((c) => c.type === "text")
          .map((c) => c.text);
        return texts.join("\n") || JSON.stringify(result);
      },
    });
  });
}

export function resolveMcpServerScript() {
  return process.env.MCP_SERVER_SCRIPT || DEFAULT_MCP_SCRIPT;
}

/**
 * Spawn the MCP server as a child process (stdio) and return LangChain tools.
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
    { name: "lab13-tools-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  const tools = await getMcpToolsAsLangChain(client);

  return {
    client,
    transport,
    tools,
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

export { DEFAULT_MCP_SCRIPT };

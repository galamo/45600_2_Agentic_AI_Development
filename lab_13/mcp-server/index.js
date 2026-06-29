#!/usr/bin/env node
/**
 * Lab 13 MCP server — stdio transport.
 * Logs must go to stderr; stdout is reserved for MCP JSON-RPC messages.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createToolsMcpServer } from "./create-tools-server.js";

async function main() {
  const server = createToolsMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("[lab13-mcp] Fatal:", err);
  process.exit(1);
});

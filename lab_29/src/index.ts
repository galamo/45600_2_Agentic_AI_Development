/**
 * Lab 29 — Current Date MCP server (Streamable HTTP).
 * Endpoint: POST /mcp
 */
import cors from "cors";
import express from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getEnv } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { createDateMcpServer } from "./mcp/create-date-server.js";

const env = getEnv();
const app = express();

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE,OPTIONS",
    exposedHeaders: ["mcp-session-id", "last-event-id", "mcp-protocol-version"],
  })
);
app.use(express.json());

const transports = new Map<string, StreamableHTTPServerTransport>();

app.post("/mcp", async (req, res) => {
  try {
    const sessionIdHeader = req.headers["mcp-session-id"];
    const sessionId =
      typeof sessionIdHeader === "string" ? sessionIdHeader : undefined;

    if (sessionId && transports.has(sessionId)) {
      const transport = transports.get(sessionId)!;
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (sessionId) {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Invalid or unknown session ID" },
        id: req.body?.id ?? null,
      });
      return;
    }

    const server = createDateMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports.set(sid, transport);
        logger.info("MCP session initialized", { sessionId: sid });
      },
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) {
        transports.delete(sid);
        logger.info("MCP session closed", { sessionId: sid });
      }
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("MCP POST error", { error: message });
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: message || "Internal server error" },
        id: req.body?.id ?? null,
      });
    }
  }
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "lab29-current-date-mcp",
    tool: "get_current_date",
  });
});

app.listen(env.MCP_PORT, () => {
  logger.info("Lab 29 Current Date MCP server listening", {
    url: `http://localhost:${env.MCP_PORT}/mcp`,
    port: env.MCP_PORT,
  });
});

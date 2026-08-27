import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { registerTools } from "./tools.js";
console.log("THIS VERSION WAS DEPLOYED BY FULL CI CD PIPELINE LOCALLY TO REMOTE INSTANCE USING CLAUDE 27-Aug")
console.log("THIS VERSION WAS DEPLOYED BY FULL CI CD PIPELINE LOCALLY TO REMOTE INSTANCE USING CLAUDE 27-Aug")
console.log("THIS VERSION WAS DEPLOYED BY FULL CI CD PIPELINE LOCALLY TO REMOTE INSTANCE USING CLAUDE 27-Aug")

const PORT = process.env.PORT ?? 3000;
const HOST = process.env.HOST ?? "127.0.0.1";
const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(",").map((h) => h.trim())
  : ["localhost", "127.0.0.1", "::1"];

function createServer() {
  const server = new McpServer({
    name: "lab-35-bank-mcp-server",
    version: "1.0.0",
  });
  registerTools(server);
  return server;
}

const app = createMcpExpressApp();

// Session id -> transport, so repeat requests from the same MCP client reuse
// the same StreamableHTTPServerTransport (and its underlying McpServer).
const transports = {};

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];

  try {
    let transport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      const server = createServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: No valid session ID provided" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP POST request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

async function handleSessionRequest(req, res) {
  const sessionId = req.headers["mcp-session-id"];
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
}

app.get("/mcp", handleSessionRequest);
app.delete("/mcp", handleSessionRequest);

app.listen(PORT, () => {
  console.log(`MCP server listening on http://${HOST}:${PORT}/mcp`);
});

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const getCurrentDateOutputSchema = z.object({
  iso: z.string().describe("Current date/time in ISO 8601 (UTC)"),
  utcDate: z.string().describe("UTC calendar date YYYY-MM-DD"),
  utcTime: z.string().describe("UTC time HH:MM:SS"),
  unixMs: z.number().describe("Unix timestamp in milliseconds"),
  dayOfWeek: z.string().describe("UTC weekday name"),
  timezone: z.literal("UTC"),
});

function currentDatePayload() {
  const now = new Date();
  const iso = now.toISOString();
  const [utcDate, timePart] = iso.split("T");
  const utcTime = timePart.replace(/\.\d{3}Z$/, "");
  
  return {
    iso,
    utcDate,
    utcTime,
    unixMs: now.getTime(),
    dayOfWeek: now.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    }),
    timezone: "UTC" as const,
  };
}

/**
 * Builds an MCP server with a single tool: get_current_date.
 * Agents call this when they need wall-clock time instead of guessing.
 */
export function createDateMcpServer(): McpServer {
  const server = new McpServer(
    { name: "lab29-current-date-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "get_current_date",
    {
      title: "Get Current Date",
      description:
        "Return the current date and time in UTC. Use this whenever you need to know today's date, the current time, or a reliable timestamp — do not invent or assume the date.",
      inputSchema: z.object({}),
      outputSchema: getCurrentDateOutputSchema,
    },
    async () => {
      const structuredContent = currentDatePayload();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(structuredContent, null, 2),
          },
        ],
        structuredContent,
      };
    }
  );

  return server;
}

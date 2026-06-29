import "dotenv/config";
import { createAgent } from "langchain";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {
  connectToolsMcpStdio,
  formatMcpToolResult,
  listMcpToolDefinitions,
} from "../lib/mcp-client.js";
import {
  SYSTEM_PROMPT,
  createModel,
  getLastAiText,
  toLangChainMessages,
} from "../lib/agent-utils.js";
import { HumanMessage } from "@langchain/core/messages";

function buildExplicitMcpTools(mcpClient) {
  const getCountries = tool(
    async ({ name, region }) => {
      const result = await mcpClient.callTool({
        name: "getCountries",
        arguments: { name, region },
      });
      return formatMcpToolResult(result);
    },
    {
      name: "getCountries",
      description: `Fetch country information from public web APIs (GeoDB + CountriesNow).
Use optional filters: name (partial match) or region (e.g. Europe, Asia).
Omit both to return a sample list of countries with capitals and population.`,
      schema: z.object({
        name: z
          .string()
          .optional()
          .nullable()
          .describe("Filter by country name (partial match). Example: 'japan'."),
        region: z
          .string()
          .optional()
          .nullable()
          .describe("Filter by region. Examples: Africa, Asia, Europe, Oceania."),
      }),
    }
  );

  const calculator = tool(
    async ({ a, b }) => {
      const result = await mcpClient.callTool({
        name: "calculator",
        arguments: { a, b },
      });
      return formatMcpToolResult(result);
    },
    {
      name: "calculator",
      description: "Add two numbers and return their sum.",
      schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
    }
  );

  return [getCountries, calculator];
}

export async function runToolsAgent({ messages, userMessage }) {
  if (!userMessage?.trim()) throw new Error("userMessage is required");

  const connection = await connectToolsMcpStdio();

  try {
    const tools = buildExplicitMcpTools(connection.client);
    const agent = createAgent({
      model: createModel(),
      tools,
      systemPrompt: SYSTEM_PROMPT,
    });

    const lcMessages = [
      ...toLangChainMessages(messages),
      new HumanMessage(userMessage),
    ];

    const result = await agent.invoke({ messages: lcMessages });
    const reply = getLastAiText(result) || "No response from agent.";
    return { reply, mcpScript: connection.scriptPath, mode: "createAgent" };
  } finally {
    await connection.close();
  }
}

export async function listMcpTools() {
  const connection = await connectToolsMcpStdio();
  try {
    return listMcpToolDefinitions(connection.client);
  } finally {
    await connection.close();
  }
}

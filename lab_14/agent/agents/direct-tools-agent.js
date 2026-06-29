import "dotenv/config";
import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import {
  connectToolsMcpStdio,
  formatMcpToolResult,
  listMcpToolDefinitions,
} from "../lib/mcp-client.js";
import {
  SYSTEM_PROMPT,
  createModel,
  toLangChainMessages,
} from "../lib/agent-utils.js";

const MAX_ITERATIONS = 6;

function mcpToolsToBindable(mcpTools) {
  return mcpTools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description ?? `Call MCP tool: ${t.name}`,
      parameters: t.inputSchema ?? { type: "object", properties: {} },
    },
  }));
}

function extractToolCalls(message) {
  const raw = message.tool_calls ?? message.additional_kwargs?.tool_calls ?? [];
  if (!Array.isArray(raw)) return [];

  return raw.map((tc) => {
    const name = tc.name ?? tc.function?.name ?? "unknown";
    let args = tc.args;
    if (args === undefined && tc.function?.arguments) {
      try {
        args = JSON.parse(tc.function.arguments);
      } catch {
        args = tc.function.arguments;
      }
    }
    return {
      id: tc.id ?? tc.tool_call_id ?? name,
      name,
      args: args ?? {},
    };
  });
}

/**
 * Alternative to LangChain tool wrappers: bind MCP schemas to the model and
 * call client.callTool() directly when the LLM requests a tool.
 */
export async function runDirectToolsAgent({ messages, userMessage }) {
  if (!userMessage?.trim()) throw new Error("userMessage is required");

  const connection = await connectToolsMcpStdio();

  try {
    const mcpTools = await listMcpToolDefinitions(connection.client);
    const llm = createModel().bindTools(mcpToolsToBindable(mcpTools));

    const lcMessages = [
      new HumanMessage({ content: SYSTEM_PROMPT }),
      ...toLangChainMessages(messages),
      new HumanMessage(userMessage),
    ];

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const response = await llm.invoke(lcMessages);
      lcMessages.push(response);

      const toolCalls = extractToolCalls(response);
      if (toolCalls.length === 0) {
        const content =
          typeof response.content === "string"
            ? response.content.trim()
            : String(response.content ?? "").trim();
        return {
          reply: content || "No response from agent.",
          mcpScript: connection.scriptPath,
          mode: "direct-callTool",
        };
      }

      for (const tc of toolCalls) {
        const result = await connection.client.callTool({
          name: tc.name,
          arguments: tc.args,
        });
        lcMessages.push(
          new ToolMessage({
            content: formatMcpToolResult(result),
            tool_call_id: tc.id,
            name: tc.name,
          })
        );
      }
    }

    const lastAi = [...lcMessages].reverse().find((m) => m instanceof AIMessage);
    const reply =
      (typeof lastAi?.content === "string" ? lastAi.content : String(lastAi?.content ?? "")).trim() ||
      "Agent reached max tool iterations.";
    return { reply, mcpScript: connection.scriptPath, mode: "direct-callTool" };
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

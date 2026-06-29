import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { connectToolsMcpStdio } from "../lib/mcp-client.js";

const SYSTEM_PROMPT = `You are a helpful assistant with access to MCP tools over stdio.

Available tools:
- getCountries: fetch country data from public web APIs. You can filter by name or region, or list a sample of countries.
- calculator: add two numbers (a + b) and return the sum.

Guidelines:
- Use getCountries when the user asks about countries, capitals, regions, populations, or currencies.
- Use calculator when the user asks to add, sum, or calculate with two numbers.
- Present country results clearly: name, capital, region, population.
- For math, show the calculation and the result.
- If a tool returns an error, explain it and suggest how to fix the query.`;

function createModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Set OPENROUTER_API_KEY in agent/.env");
  }
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  return new ChatOpenAI({
    model,
    temperature: 0.2,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    },
  });
}

function toLangChainMessages(messages) {
  return (messages || []).map((m) => {
    if (m.role === "assistant") return new AIMessage(m.content);
    if (m.role === "system") return new SystemMessage(m.content);
    return new HumanMessage(m.content);
  });
}

export async function runToolsAgent({ messages, userMessage }) {
  if (!userMessage?.trim()) throw new Error("userMessage is required");

  const connection = await connectToolsMcpStdio();

  try {
    const llm = createModel();
    const { tools } = connection;

    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    
    console.log(tools[0].name);
    console.log(tools[1].name);
    const result2 = await tools[1].func({a:1,b:2});
    console.log(result2);
    const agent = createToolCallingAgent({ llm, tools, prompt });
    const executor = new AgentExecutor({
      agent,
      tools,
      verbose: Boolean(process.env.VERBOSE),
      maxIterations: 6,
    });

    const chatHistory = toLangChainMessages(messages);
    const result = await executor.invoke({
      input: userMessage,
      chat_history: chatHistory,
    });

    const reply = (result.output ?? "").trim() || "No response from agent.";
    return { reply, mcpScript: connection.scriptPath };
  } finally {
    await connection.close();
  }
}

export async function listMcpTools() {
  const connection = await connectToolsMcpStdio();
  try {
    const { tools } = await connection.client.listTools();
    return tools;
  } finally {
    await connection.close();
  }
}

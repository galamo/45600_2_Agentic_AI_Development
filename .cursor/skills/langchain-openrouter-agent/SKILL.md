---
name: langchain-openrouter-agent
description: Builds LangChain and LangGraph agents with createAgent from langchain and OpenRouter models via ChatOpenRouter. Use when creating, refactoring, or reviewing agents, tools, skills, sub-agents, or LangGraph nodes that call an LLM.
---

# LangChain / LangGraph Agents — createAgent + OpenRouter

## Purpose

All agent work in this repo uses LangChain's **`createAgent`** API with **OpenRouter** models. Do not hand-roll ReAct loops or call `model.invoke()` directly for agent behavior.

## Rules

1. **Always use `createAgent`** from `langchain` — not legacy `AgentExecutor`, not manual tool-call loops, not raw `model.invoke()` for agent nodes.
2. **Always use OpenRouter** — model via `ChatOpenRouter` from `@langchain/openrouter`.
3. **Do not** use `ChatOpenAI` pointed at `https://openrouter.ai/api/v1` for new agent code; use `ChatOpenRouter` instead.
4. Read `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` from env; fail fast if the key is missing.
5. Define tools with `tool()` from `@langchain/core/tools` and Zod schemas.
6. Invoke agents with `{ messages }` and read the final AI message from `result.messages`.

## Dependency Check

Before writing agent code, verify the target package has:

```bash
npm install langchain @langchain/openrouter @langchain/core zod
```

Do not hardcode version numbers.

## Standard Pattern

```typescript
// USED_SKILL_(langchain-openrouter-agent)
import "dotenv/config";
import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

function createOpenRouterModel() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("Set OPENROUTER_API_KEY in .env");

  const modelId = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini";

  return new ChatOpenRouter({
    model: modelId,
    apiKey,
    temperature: 0.2,
  });
}

const myTool = tool(
  async ({ query }) => `Result for ${query}`,
  {
    name: "my_tool",
    description: "What this tool does",
    schema: z.object({
      query: z.string().describe("User query"),
    }),
  }
);

export function createMyAgent() {
  return createAgent({
    model: createOpenRouterModel(),
    tools: [myTool],
    systemPrompt: "You are a helpful assistant.",
  });
}

// Usage
const agent = createMyAgent();
const result = await agent.invoke({
  messages: [{ role: "user", content: "Hello" }],
});
```

### Model ID format

- Prefer full OpenRouter IDs: `openai/gpt-4o-mini`, `openai/gpt-4.1-mini`, `anthropic/claude-3.5-sonnet`.
- If the env value omits a provider prefix, normalize to `openai/<model>`.

## LangGraph Integration

Use `createAgent` **inside graph nodes** — each agent node is a `createAgent` instance, not a class that calls `model.invoke()` directly.

```typescript
import { createAgent } from "langchain";
import { ChatOpenRouter } from "@langchain/openrouter";
import { HumanMessage } from "@langchain/core/messages";

function createResearcherAgent(apiKey: string) {
  const model = new ChatOpenRouter({
    model: process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini",
    apiKey,
    temperature: 0.3,
  });

  return createAgent({
    model,
    tools: [],
    systemPrompt: "You are a research assistant. Produce concise research notes.",
  });
}

// Graph node
const researcher = createResearcherAgent(apiKey);

async function researcherNode(state: { userQuery: string }) {
  const result = await researcher.invoke({
    messages: [new HumanMessage(`Research: ${state.userQuery}`)],
  });
  const lastAi = [...result.messages].reverse().find((m) => m.type === "ai");
  const researchNotes = typeof lastAi?.content === "string" ? lastAi.content : "";
  return { researchNotes };
}
```

- **Skills / sub-agents**: export a factory that returns `createAgent(...)` (see `lab_15/agents/pdf-analyzer.agent.js`).
- **Tool wrappers**: a tool's handler may `invoke()` an inner `createAgent` skill and return its text output.

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | Yes | — |
| `OPENROUTER_MODEL` | No | `openai/gpt-4o-mini` |

Document these in `.env.example` when adding a new lab or service.

## Anti-Patterns

```typescript
// ❌ BAD — raw model.invoke for agent behavior
const response = await model.invoke([new SystemMessage("..."), new HumanMessage("...")]);

// ❌ BAD — ChatOpenAI shim instead of ChatOpenRouter
new ChatOpenAI({
  model: "openai/gpt-4o-mini",
  configuration: { baseURL: "https://openrouter.ai/api/v1", apiKey },
});

// ❌ BAD — legacy AgentExecutor or manual ReAct loop
// ❌ BAD — OpenAI direct (no OpenRouter) for agents in this repo
```

```typescript
// ✅ GOOD
const agent = createAgent({
  model: new ChatOpenRouter({ model: modelId, apiKey }),
  tools: [myTool],
  systemPrompt: SYSTEM_PROMPT,
});
const result = await agent.invoke({ messages });
```

## Refactoring Existing Code

When touching agent files that use `model.invoke()`, `ChatOpenAI` + OpenRouter base URL, or class-based agent wrappers:

1. Replace the model with `ChatOpenRouter`.
2. Wrap behavior in `createAgent({ model, tools, systemPrompt })`.
3. Move one-shot prompts into `systemPrompt`; pass user input via `invoke({ messages })`.
4. Keep graph orchestration (StateGraph, edges, state) unchanged — only swap node internals.

## Validation Checklist

- [ ] Agent created with `createAgent` from `langchain`
- [ ] Model is `ChatOpenRouter` backed by `OPENROUTER_API_KEY`
- [ ] Tools use `tool()` + Zod schemas
- [ ] No new `model.invoke()` agent loops
- [ ] No new `ChatOpenAI` + OpenRouter base URL for agents
- [ ] `USED_SKILL_(langchain-openrouter-agent)` comment at top of new/changed agent files

## Reference Implementations

- `lab_15/agent.js` — main agent + skill hierarchy
- `lab_15/agents/pdf-analyzer.agent.js` — sub-agent factory
- `lab_14/agent/agents/tools-agent.js` — tools + MCP
- `lab_2/agent.js` — minimal CLI agent

## Code Output

Add at the top of every new or materially changed agent file:

```typescript
// USED_SKILL_(langchain-openrouter-agent)
```

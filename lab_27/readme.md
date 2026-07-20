# Lab 27 — LangGraph + `createAgent` Skills

Two-agent **LangGraph** workflow where each node is a LangChain **`createAgent`** that loads **Agent Skills** through the official skills middleware (`createSkillsMiddleware` from `deepagents`).

## Flow

```mermaid
flowchart LR
  START --> researcher
  researcher --> writer
  writer --> END
```

| Node | Role | Skill source |
|------|------|--------------|
| `researcher` | Builds structured research notes | `/skills/research-outline/` |
| `writer` | Turns notes into a clear final answer | `/skills/clear-writing/` |

Agents communicate only through shared graph state (`userQuery` → `researchNotes` → `finalAnswer`).

## Skills in the `createAgent` API

LangChain agents get skills via middleware (progressive disclosure of `SKILL.md` files):

```typescript
import { createAgent } from "langchain";
import {
  FilesystemBackend,
  createFilesystemMiddleware,
  createSkillsMiddleware,
} from "deepagents";

const backend = new FilesystemBackend({
  rootDir: process.cwd(),
  virtualMode: true,
});

const agent = createAgent({
  model,
  tools: [],
  systemPrompt: "...",
  middleware: [
    createSkillsMiddleware({
      backend,
      sources: ["/skills/research-outline/"],
    }),
    createFilesystemMiddleware({
      backend,
      tools: ["read_file", "ls", "glob"],
    }),
  ],
});
```

Each skill is a directory with a `SKILL.md` (YAML frontmatter `name` + `description`, then instructions). At startup the agent sees skill metadata; when relevant it reads the full `SKILL.md` with filesystem tools.

## Project layout

```txt
lab_27/
  skills/
    research-outline/SKILL.md
    clear-writing/SKILL.md
  src/
    agents/          createAgent factories (researcher, writer)
    graph/           LangGraph StateGraph
    lib/             env, logger, OpenRouter, skills middleware helper
    index.ts         CLI entry
```

## Setup

```bash
cd lab_27
npm install
cp .env.example .env
# Set OPENROUTER_API_KEY
```

## Run

```bash
npm run agent -- "Why is the sky blue?"
```

Default question if none is passed:

```bash
npm start
```

Scripts compile TypeScript with `tsc`, then run `dist/` (avoids a Node ESM require-cycle when loading `deepagents` under `ts-node`).

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | Yes | — |
| `OPENROUTER_MODEL` | No | `openai/gpt-4o-mini` |
| `LOG_LEVEL` | No | `info` |

Logs: `logs/app.log` and `logs/error.log` (Winston JSON lines).

## How this differs from Lab 11 / Lab 15

| Lab | Pattern |
|-----|---------|
| Lab 11 | LangGraph with two agents, raw `model.invoke` |
| Lab 15 | Single agent + skill as a nested `createAgent` tool wrapper |
| **Lab 27** | LangGraph + two `createAgent` nodes + **`skills` middleware** (`SKILL.md` progressive disclosure) |

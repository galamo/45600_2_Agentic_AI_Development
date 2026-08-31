---
title: Lab 10 MCP Quiz Agent
original_path: lab_10_mcp/readme.md
snapshot_date: 2026-08-31
lab: lab_10_mcp
---

# Lab 10: MCP Quiz Agent

LangChain quiz agent with **two modes**:

1. **MCP connected** — agent connects to Quiz MCP server (Streamable HTTP), uses `get_question` / `check_answer` tools, launched via `start_quiz` MCP prompt.
2. **Standalone** — same quiz-master behavior without MCP; LLM generates and evaluates questions.

System prompt: agent **only asks questions and evaluates answers** — never answers the quiz for the user.

Uses **OpenRouter** for the chat model.

## Architecture

React client → POST /api/chat → LangChain agent → (MCP mode) Quiz MCP server OR (standalone) OpenRouter LLM

## MCP Server Tools

| Tool | Description |
|------|-------------|
| `list_topics` | Available quiz topics |
| `get_question` | Fetch next question for a topic |
| `check_answer` | Validate user answer |

## MCP Prompt

| Prompt | Args | Description |
|--------|------|-------------|
| `start_quiz` | `topicId` | Instructions to begin a quiz session |

## Ports

- MCP server: 3100
- Agent server: 3010
- Client dev: 5176

## Quiz Topics (questions.json)

- **mcp** — Model Context Protocol
- **langchain** — LangChain
- **agents** — AI Agents

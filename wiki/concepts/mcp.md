---
title: Model Context Protocol (MCP)
type: concept
sources:
  - sources/lab-notes/lab-10-mcp-quiz.md
  - sources/lab-notes/lab-35-mcp-bank.md
  - sources/course/readme.md
updated: 2026-08-31
tags: [mcp, tools, agents]
---

# Model Context Protocol (MCP)

Open standard for connecting AI hosts (Cursor, Claude, custom servers) to **tools**, **resources**, and **prompts** over a defined protocol.

## Why it matters in this course

MCP appears from [[labs/lab-10-mcp-quiz]] through [[labs/lab-35-mcp-bank]] and in lecture material ([MCP vs Skills](https://gamma.app/docs/MCP-vs-Skills-ajmej0v6tyu3yde)). Contrasts with [[concepts/cursor-skills]], which are markdown workflows rather than runtime tool servers.

## Core building blocks

| Piece | Role |
|-------|------|
| **Tools** | Callable functions (e.g. `get_question`, `get_users`) with JSON schemas |
| **Prompts** | Reusable prompt templates (e.g. `start_quiz`) |
| **Resources** | Readable data exposed to the host |
| **Transport** | STDIO (local process) or Streamable HTTP (remote server) |

## Transports in course labs

- **Streamable HTTP** — [[labs/lab-10-mcp-quiz]], [[labs/lab-35-mcp-bank]]: JSON-RPC over HTTP, session via `mcp-session-id` header
- **STDIO** — course exercise (Jun 29): notes server with `save_note` / `list_notes`

## MCP vs Cursor Skills

| | MCP | Cursor Skills |
|---|-----|---------------|
| Runtime | Server process with tools | Markdown read by agent when relevant |
| Best for | Structured APIs, DB, external systems | Team workflows, checklists, conventions |
| Config | `.cursor/mcp.json` or Cursor settings | `.cursor/skills/*/SKILL.md` |

## Related

- [[labs/lab-10-mcp-quiz]] — quiz tools + prompts
- [[labs/lab-35-mcp-bank]] — bank data tools
- [[entities/langchain]] — agents that consume MCP tools
- [[concepts/cursor-skills]]

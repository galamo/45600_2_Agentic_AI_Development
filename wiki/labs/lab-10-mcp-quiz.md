---
title: Lab 10 — MCP Quiz Agent
type: lab
sources:
  - sources/lab-notes/lab-10-mcp-quiz.md
updated: 2026-08-31
tags: [lab, mcp, quiz]
lab_folder: lab_10_mcp
---

# Lab 10 — MCP Quiz Agent

**Folder:** `lab_10_mcp`

## Purpose

LangChain quiz agent in two modes: **MCP-connected** (tools from Quiz MCP server) and **standalone** (LLM-only). Introduces [[concepts/mcp]] tools and prompts in a full-stack example.

## Components

| Part | Port | Role |
|------|------|------|
| MCP server | 3100 | `list_topics`, `get_question`, `check_answer`, `start_quiz` prompt |
| Agent server | 3010 | LangChain agent, POST `/api/chat` |
| React client | 5176 | UI |

## Homework extensions (course)

- Add ≥2 new MCP tools (e.g. `get_question_by_id`, `get_topic_progress`)
- Zod schemas, error handling for invalid topic IDs

## Related

- [[concepts/mcp]] · [[entities/langchain]] · [[entities/openrouter]] · [[sources/lab-10-mcp-quiz]]

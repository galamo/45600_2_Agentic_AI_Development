---
title: Course Overview
type: synthesis
sources:
  - sources/course/readme.md
  - sources/articles/omniroute.md
updated: 2026-08-31
tags: [course, overview]
---

# Agentic AI Development — Course Overview

## What this course covers

A hands-on progression from basic agent scripts to production-style patterns: **LangChain agents**, **[[concepts/rag]]**, **[[concepts/mcp]]**, **[[concepts/langgraph]]**, **[[concepts/cursor-skills]]**, Docker, and **[[concepts/managed-agents]]**.

## Prerequisites

- [[entities/openrouter]] or OpenAI API keys (labs vary); [[entities/omniroute]] is an optional self-hosted gateway alternative
- **Cursor**, **Node.js** (LTS), **Docker**, **Git**

## Course arc (timeline)

| Period | Focus | Wiki links |
|--------|-------|------------|
| Jun 2026 | HTML/JS stats; Lab 3 story agent + OpenRouter | — |
| Jun 2026 | UI temperature; Lab 5 multi-tool agent | — |
| Jun 2026 | [[labs/lab-07-rag]]; OAuth RAG homework | [[concepts/rag]] |
| Jun 2026 | NorthWind DB agent; [[labs/lab-10-mcp-quiz]] | [[concepts/mcp]] |
| Jun–Jul 2026 | Quiz DB + Docker; [[labs/lab-11-langgraph]] | [[concepts/langgraph]] |
| Jul 2026 | STDIO notes MCP; skills; tool-as-agent | [[concepts/cursor-skills]] |
| Jul 2026 | [[concepts/cursor-rules]]; code review skill; subagents | [[concepts/cursor-rules]] |
| Jul 2026 | Lab 12 dual LangGraph (index + search) | [[concepts/langgraph]] |
| Jul 2026 | n8n web chatbot client | — |
| Aug 2026 | Deploy skill (Docker Hub) | — |
| Aug 2026 | [[labs/lab-37-managed-agent]] | [[concepts/managed-agents]] |

## Lecture resources

- [AI Agents (Gamma)](https://gamma.app/docs/AI-Agents-hlgj38btkim0stw)
- [MCP vs Skills (Gamma)](https://gamma.app/docs/MCP-vs-Skills-ajmej0v6tyu3yde)
- [MCP intro site](https://model-context-protocol-dz2jt4d.gamma.site/)
- [LangChain agents docs](https://docs.langchain.com/oss/javascript/langchain/agents)

## Stack conventions (coding)

See root `CLAUDE.md` and [[concepts/cursor-rules]]: TypeScript, Zod, Mocha tests, Winston logs, Axios HTTP.

## Related labs (ingested)

- [[labs/lab-07-rag]] · [[labs/lab-10-mcp-quiz]] · [[labs/lab-11-langgraph]] · [[labs/lab-35-mcp-bank]] · [[labs/lab-37-managed-agent]]

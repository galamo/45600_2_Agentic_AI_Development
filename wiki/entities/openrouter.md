---
title: OpenRouter
type: entity
sources:
  - sources/lab-notes/lab-10-mcp-quiz.md
  - sources/course/readme.md
  - sources/articles/omniroute.md
updated: 2026-08-31
tags: [openrouter, llm, api]
---

# OpenRouter

Unified API gateway for multiple LLM providers. Used heavily in early course labs for story generation and quiz agents.

## Configuration pattern

```bash
OPENROUTER_API_KEY=sk-...
OPENROUTER_MODEL=openrouter:gpt-5.4   # or openai/gpt-4o-mini, etc.
```

Get keys at [openrouter.ai/keys](https://openrouter.ai/keys).

## Course usage

- **Lab 3** — story agent with mood/length options (homework)
- **[[labs/lab-10-mcp-quiz]]** — default chat model for quiz agent
- **[[labs/lab-07-rag]]** — optional vision model via OpenRouter

## Related

- [[entities/omniroute]] — open-source self-hosted alternative gateway (fallback, cost routing, MCP)
- [[entities/langchain]] — LangChain OpenRouter integrations in `.cursor/skills/langchain-openrouter-agent`
- [[concepts/managed-agents]] — alternative: Anthropic hosted agents instead of OpenRouter

---
title: LangChain
type: entity
sources:
  - sources/lab-notes/lab-07-rag.md
  - sources/lab-notes/lab-10-mcp-quiz.md
  - sources/lab-notes/lab-11-langgraph.md
updated: 2026-08-31
tags: [langchain, agents]
---

# LangChain (JavaScript)

Framework for LLM applications: agents, tools, messages, retrievers, and integrations.

## Used in course labs

| Lab | Usage |
|-----|-------|
| [[labs/lab-07-rag]] | Documents, MemoryVectorStore, ChatOpenAI vision |
| [[labs/lab-10-mcp-quiz]] | Agent with MCP tool binding |
| [[labs/lab-11-langgraph]] | Base chat models + [[concepts/langgraph]] |

## Common packages

- `@langchain/core` — messages, documents
- `@langchain/openai` — OpenAI chat + embeddings
- `@langchain/langgraph` — StateGraph orchestration
- `langchain` — vector stores, chains

## Docs

- [LangChain JS agents](https://docs.langchain.com/oss/javascript/langchain/agents)
- [LangChain overview](https://docs.langchain.com/oss/javascript/langchain/overview)

## Related

- [[entities/openrouter]] — often used instead of direct OpenAI
- [[concepts/rag]] · [[concepts/langgraph]] · [[concepts/mcp]]

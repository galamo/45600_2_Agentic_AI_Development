---
title: LangGraph
type: concept
sources:
  - sources/lab-notes/lab-11-langgraph.md
  - sources/course/readme.md
updated: 2026-08-31
tags: [langgraph, agents, orchestration]
---

# LangGraph

Framework for building **stateful agent workflows** as graphs: nodes (steps/agents), edges (control flow), shared state passed between nodes.

## Core ideas

- **StateGraph** — graph with typed state (`Annotation.Root`)
- **Nodes** — functions or agents that read/write state fields
- **Edges** — `START → node → … → END`
- **No direct agent-to-agent calls** — communication only via shared state

## Lab 11 pattern

[[labs/lab-11-langgraph]]:

```
userQuery → Researcher → researchNotes → Writer → finalAnswer
```

## Lab 12 extension (course exercise, not yet ingested)

Two graphs from course readme:

1. **Indexing graph** — analyzeImage → embedIndex → storeDocument
2. **Search graph** — embedQuery → retrieveCandidates → rerankCandidates

## Dependencies

- `@langchain/langgraph` — StateGraph, START, END, Annotation

## Related

- [[labs/lab-11-langgraph]]
- [[entities/langchain]]
- [[concepts/mcp]] — alternative composition via tool servers

---
title: Lab 11 LangGraph Agent-to-Agent
original_path: lab_11_langgraph/README.md
snapshot_date: 2026-08-31
lab: lab_11_langgraph
---

# Lab 11: LangGraph – Agent-to-Agent Communication

Two agents communicate via LangGraph: **Researcher** and **Writer**. They share state in a single graph.

## Flow

```
userQuery → [ResearcherAgent] → researchNotes → [WriterAgent] → finalAnswer
```

- **ResearcherAgent**: Takes `userQuery`, writes `researchNotes`.
- **WriterAgent**: Reads `userQuery` + `researchNotes`, writes `finalAnswer`.

Communication happens only through **shared graph state** (no direct agent-to-agent calls).

## Structure

- `agents/researcher-agent.js` — Researcher node
- `agents/writer-agent.js` — Writer node
- `graph/orchestrator.js` — StateGraph, Annotation.Root, edges START → researcher → writer → END
- `index.js` — Entry point

## Dependencies

- `@langchain/langgraph` — StateGraph, Annotation, START, END
- `@langchain/openai` — ChatOpenAI
- Requires `OPENAI_API_KEY` in `.env`

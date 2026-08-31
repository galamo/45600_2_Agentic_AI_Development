---
title: Lab 11 — LangGraph Agent-to-Agent
type: lab
sources:
  - sources/lab-notes/lab-11-langgraph.md
updated: 2026-08-31
tags: [lab, langgraph]
lab_folder: lab_11_langgraph
---

# Lab 11 — LangGraph Agent-to-Agent

**Folder:** `lab_11_langgraph`

## Purpose

Two agents (**Researcher**, **Writer**) orchestrated by [[concepts/langgraph]] with shared state — no direct inter-agent calls.

## Flow

```
userQuery → Researcher → researchNotes → Writer → finalAnswer
```

## Key files

- `graph/orchestrator.js` — StateGraph wiring
- `agents/researcher-agent.js` · `agents/writer-agent.js`

## Run

```bash
npm start
node index.js "Why is the sky blue?"
```

## Related

- [[concepts/langgraph]] · [[entities/langchain]] · [[sources/lab-11-langgraph]]

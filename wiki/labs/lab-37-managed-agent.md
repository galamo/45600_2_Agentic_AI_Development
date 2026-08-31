---
title: Lab 37 — Managed Agent API
type: lab
sources:
  - sources/lab-notes/lab-37-managed-agent.md
updated: 2026-08-31
tags: [lab, managed-agents, express]
lab_folder: lab_37_managed_agent
---

# Lab 37 — Managed Agent API

**Folder:** `lab_37_managed_agent`

## Purpose

Express + TypeScript proxy to **[[concepts/managed-agents|Claude Managed Agents]]**. Each question spins up a session, streams the reply, archives the session.

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | Health check |
| GET | `/ask?message=` | Query param |
| POST | `/ask` | JSON `{ "message": "..." }` |

## Env vars

`ANTHROPIC_API_KEY`, `AGENT_ID`, `ENVIRONMENT_ID`

## Implementation

`src/services/agentService.ts` — session create, stream, archive.

## Tests

Mocha integration tests stub the agent (no live API spend).

## Related

- [[concepts/managed-agents]] · [[sources/lab-37-managed-agent]]

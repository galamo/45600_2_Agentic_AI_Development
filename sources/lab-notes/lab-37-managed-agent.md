---
title: Lab 37 Managed Agent API
original_path: lab_37_managed_agent/README.md
snapshot_date: 2026-08-31
lab: lab_37_managed_agent
---

# lab_37_managed_agent

Express + TypeScript API that proxies requests to a **Claude Managed Agent**.

## Endpoints

- `GET /health` — health check
- `GET /ask?message=...` — ask via query param
- `POST /ask` — JSON body `{ "message": "..." }`

Response: `{ "answer": string }`. Errors: `400` (missing message), `502` (agent failure).

## Setup

```bash
npm install
cp .env.example .env   # ANTHROPIC_API_KEY, AGENT_ID, ENVIRONMENT_ID
```

## How it calls the agent

Each `/ask` request:

1. Creates a new Managed Agent session (`AGENT_ID` + `ENVIRONMENT_ID`)
2. Seeds with user message via `initial_events`
3. Streams session events until agent idle
4. Concatenates `agent.message` text blocks into response
5. Archives session afterward

Implementation: `src/services/agentService.ts`

## Commands

- `npm run dev` — ts-node-dev
- `npm test` — Mocha integration tests (stub agent, no network spend)

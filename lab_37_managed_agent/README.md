# lab_37_managed_agent

Express + TypeScript API that proxies requests to a Claude Managed Agent.

## Endpoints

- `GET /health` — health check.
- `GET /ask?message=...` — ask the agent, message via query param.
- `POST /ask` with JSON body `{ "message": "..." }` — ask the agent.

Both `/ask` variants respond with `{ "answer": string }` on success, `400` on
a missing/empty `message`, and `502` if the agent call fails.

## Setup

```bash
npm install
cp .env.example .env   # fill in ANTHROPIC_API_KEY, AGENT_ID, ENVIRONMENT_ID
```

## Commands

- `npm run dev` — run in development mode (ts-node-dev, auto-restart)
- `npm run build` — compile to `dist/`
- `npm start` — run the compiled server
- `npm test` — run the Mocha integration tests (these stub the agent call —
  no network calls or Anthropic spend)

## How it calls the agent

Each `/ask` request creates a new Managed Agent session (`AGENT_ID` +
`ENVIRONMENT_ID`), seeds it with the user's message via `initial_events`,
streams session events until the agent goes idle, and concatenates the
`agent.message` text blocks into the response. The session is archived
afterward. See `src/services/agentService.ts`.

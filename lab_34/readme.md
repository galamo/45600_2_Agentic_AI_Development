# Lab 34 – Claude Agent SDK Web Q&A

Simple web-connected agent using `@anthropic-ai/claude-agent-sdk`, exposed over an Express HTTP API.

## Setup

```bash
cp .env.example .env   # set ANTHROPIC_API_KEY
npm install
npm run dev
```

## API

| Method | Path | Body |
|--------|------|------|
| `GET` | `/health` | — |
| `POST` | `/ask` | `{ "question": "..." }` |

Example:

```bash
curl -s http://localhost:3400/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is the latest Node.js LTS version?"}'
```

## Notes

- Agent uses built-in `WebSearch` and `WebFetch` tools
- Tool permissions are auto-approved (`bypassPermissions`)

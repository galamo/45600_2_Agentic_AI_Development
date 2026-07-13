# Lab 21 — Image Keywords Agent

Node.js (TypeScript) agent that analyzes an image with OpenRouter vision and outputs searchable keywords.

## Setup

```bash
cd lab_21
npm install
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env
```

## Run

```bash
npm run agent -- path/to/image.png
```

Print full JSON:

```bash
npm run agent -- path/to/image.png --json
```

Example with a repo image:

```bash
npm run agent -- ../image.png
```

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | Yes | — |
| `OPENROUTER_VISION_MODEL` | No | `openai/gpt-4o-mini` |

## Architecture

- `src/agent/image-keywords-agent.ts` — `createAgent` + `ChatOpenRouter` vision agent
- `src/utils/vision.ts` — loads local images as base64 data URLs
- `src/index.ts` — CLI entry point

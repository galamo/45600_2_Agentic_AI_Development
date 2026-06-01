# Lab 3 — Kids story agent

LangChain agent that writes short, happy stories for kids (max 5 sentences) using OpenRouter.

## Setup

```bash
cd lab_3
npm install
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY
```

## Run

```bash
npm run agent -- "a friendly dragon"
```

Override prompts for a single run:

```bash
npm run agent -- --system "You are a silly pirate storyteller for toddlers." "treasure hunt"

npm run agent -- --user "Tell a cheerful bedtime story about: {subject}" "sleepy owl"
```

Or set `SYSTEM_PROMPT` and `USER_PROMPT` in `.env` for all runs.

## Environment

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Required — from [OpenRouter keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | LangChain model string, default `openrouter:gpt-5.4` |
| `SYSTEM_PROMPT` | Optional default system instructions |
| `USER_PROMPT` | Optional user prompt template; use `{subject}` as placeholder |

Story subject is limited to **50 characters**.

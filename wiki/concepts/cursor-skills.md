---
title: Cursor Skills
type: concept
sources:
  - sources/course/readme.md
  - sources/course/cursor-rules-summary.md
updated: 2026-08-31
tags: [cursor, skills, workflows]
---

# Cursor Skills

Markdown workflows in `.cursor/skills/<name>/SKILL.md` that teach the agent **how to perform specific tasks** when the description matches the user's request.

## Structure

```text
.cursor/skills/my-skill/
├── SKILL.md       # required — frontmatter + instructions
├── reference.md   # optional — detailed docs
└── scripts/       # optional — utilities
```

## This repo's skills (examples)

- `axios-http-enforcer` — standardize HTTP to Axios
- `langchain-openrouter-agent` — LangChain + OpenRouter agents
- `lab-16-feature-structure` — React feature folders
- `llm-wiki` — maintain/query `wiki/` per `AGENTS.md`
- `deploy-project` — Docker build/test/push

## Skills vs MCP

See [[concepts/mcp]]: skills are **instructions**; MCP servers are **runtime tools**.

Course timeline (Jul 2): skills, MCP resources/prompts, and **tool-as-agent** pattern (e.g. convert a tool into its own agent).

## Hooks → Skills

Course exercise (Jul 6): wire hooks to invoke skills (e.g. code review skill triggered by hook).

## Related

- [[concepts/cursor-rules]]
- [[concepts/mcp]]
- `AGENTS.md` — wiki operator schema (separate from skills)

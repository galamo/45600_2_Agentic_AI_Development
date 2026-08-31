---
title: Cursor Rules
type: concept
sources:
  - sources/course/cursor-rules-summary.md
updated: 2026-08-31
tags: [cursor, rules, persistence]
---

# Cursor Rules

Persistent instructions in `.cursor/rules/*.mdc` that Cursor **automatically injects** into agent sessions.

## This repo's rules

| Rule | Scope | Purpose |
|------|-------|---------|
| `winston-logger.mdc` | alwaysApply | JSON file logging via Winston |
| `http-axios.mdc` | alwaysApply | Axios-only HTTP client |
| `typescript-ts-node.mdc` | alwaysApply | TS + ts-node dev workflow |
| `async-await.mdc` | file patterns | async/await conventions |

Frontmatter fields: `description`, `alwaysApply`, optional `globs`.

## Rules vs other persistence

| Mechanism | When loaded | Best for |
|-----------|-------------|----------|
| **Rules** | Every session (or matching files) | Short coding standards |
| **Skills** | When task matches description | Workflows, domain guides |
| **CLAUDE.md** | Project instructions | Stack, commands |
| **Wiki** (`wiki/`) | On demand via agent | Compiled course knowledge |
| **Memories** | Cross-chat facts | Preferences |

## Related

- [[concepts/cursor-skills]]
- [[concepts/mcp]] — MCP vs Skills lecture
- Root `CLAUDE.md` — TypeScript, Zod, Mocha

---
title: Cursor Rules Snapshot
original_path: .cursor/rules/
snapshot_date: 2026-08-31
---

# Cursor Rules (course repo)

Project rules in `.cursor/rules/*.mdc` — auto-injected into Cursor Agent sessions.

| Rule file | alwaysApply | Summary |
|-----------|-------------|---------|
| `winston-logger.mdc` | true | Winston JSON logs to `logs/app.log` + `logs/error.log`; no `console.log` in Node |
| `http-axios.mdc` | true | Axios only for HTTP; no fetch/node-fetch |
| `typescript-ts-node.mdc` | true | TypeScript source; dev with ts-node/nodemon |
| `async-await.mdc` | — | Prefer async/await patterns |

Coding standards also in root `CLAUDE.md`: TypeScript (no `any`), Zod validation, Mocha integration tests for Express endpoints.

Related: [[concepts/cursor-skills]] for on-demand workflows; [[concepts/mcp]] for MCP vs Skills lectures.

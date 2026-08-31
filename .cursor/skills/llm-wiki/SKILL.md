---
name: llm-wiki
description: Maintains and queries the course LLM wiki in wiki/. Use when the user says ingest, lint wiki, query wiki, file to wiki, or asks about compiled course knowledge stored in wiki/.
---

# LLM Wiki Operator

Before any wiki task, read **`AGENTS.md`** at the repository root.

## Quick reference

| User intent | Workflow |
|-------------|----------|
| "ingest …" | INGEST in AGENTS.md |
| question about course/labs/concepts | QUERY in AGENTS.md |
| "lint wiki" | LINT in AGENTS.md |

## Rules

1. **Never modify** `sources/` — read only.
2. **Always update** `wiki/index.md` and `wiki/log.md` after ingest or lint.
3. Navigate via `wiki/index.md` before reading many individual pages.
4. Use wikilinks `[[concepts/mcp]]` in all wiki pages.
5. Coding standards live in `CLAUDE.md`; wiki knowledge lives in `wiki/`.

## Progressive disclosure

- Course overview: `wiki/synthesis/course-overview.md`
- Full index: `wiki/index.md`
- Raw snapshots: `sources/` (immutable)

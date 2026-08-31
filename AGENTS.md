# LLM Wiki — Agentic AI Development Course

You maintain a persistent wiki in `wiki/`. Follow these workflows exactly.

## Layers

| Layer | Path | Who writes | Purpose |
|-------|------|------------|---------|
| Raw sources | `sources/` | Human | Immutable inputs. **Read only — never modify.** |
| Wiki | `wiki/` | Agent | Compiled, interlinked knowledge pages. |
| Schema | `AGENTS.md` (this file) | Human + Agent | Workflows and conventions. |
| Coding rules | `CLAUDE.md` | Human | TypeScript/Express/test standards (separate from wiki). |

## Page conventions

- Use Obsidian-style wikilinks: `[[concepts/mcp]]`, `[[labs/lab-10-mcp-quiz]]`
- Every wiki page starts with YAML frontmatter:

```yaml
---
title: Page Title
type: concept | entity | lab | synthesis | source-summary
sources:
  - sources/lab-notes/lab-10-mcp-quiz.md
updated: 2026-08-31
tags: [mcp, cursor]
---
```

- One topic per page. Prefer ~80 lines unless synthesis.
- Lab pages live under `wiki/labs/lab-XX-<slug>.md`
- Concept pages under `wiki/concepts/`
- Entity pages (tools, platforms) under `wiki/entities/`
- Source summaries under `wiki/sources/`

## Special files

- **`wiki/index.md`** — catalog of all pages with one-line summaries. Update on every ingest.
- **`wiki/log.md`** — append-only chronological log. Never delete entries.

Log entry format:

```markdown
## [YYYY-MM-DD] ingest | Article Title
## [YYYY-MM-DD] query | Question summary
## [YYYY-MM-DD] lint | Lint pass summary
```

## Workflows

### INGEST

When the user says **ingest** `<path>`:

1. Read the source from `sources/` (or copy from repo path into `sources/` first if new).
2. Summarize key points in chat (3–5 bullets) before writing files.
3. Create or update `wiki/sources/<slug>.md` (source summary with link to raw source).
4. Update all touched entity, concept, and lab pages (often 5–15 files).
5. Update `wiki/index.md`.
6. Append an ingest entry to `wiki/log.md`.

Rules:
- Never edit files under `sources/` during ingest (they are immutable snapshots).
- If ingesting from an existing lab README, copy content into `sources/lab-notes/` with frontmatter noting the original path and snapshot date, then ingest from that copy.

### QUERY

When the user asks about course content or says **query wiki**:

1. Read `wiki/index.md` first.
2. Open relevant wiki pages (prefer wiki over raw sources).
3. Answer with `[[wikilink]]` citations to wiki pages.
4. If the answer is durable and valuable, offer to file it under `wiki/synthesis/`.

### LINT

When the user says **lint wiki**:

1. Find orphan pages (no inbound wikilinks from other wiki pages).
2. Flag contradictions between pages.
3. List concepts mentioned but missing dedicated pages.
4. Note stale claims that newer sources may supersede.
5. Suggest next sources to ingest.
6. Append a lint summary to `wiki/log.md`.

## Domain context

This wiki covers **45600 Agentic AI Development**:

- **Stack:** Node.js, TypeScript, React, PostgreSQL, MySQL, Docker
- **Topics:** LangChain, LangGraph, MCP, RAG, Cursor rules/skills/hooks/subagents, OpenRouter, managed agents, JWT auth, n8n, Docker deploy
- **Structure:** Course timeline in `sources/course/readme.md`; labs under `lab_*` folders
- **Map each lab** to `wiki/labs/lab-XX-<name>.md` when ingested

## Ingesting from this monorepo

Common source locations (copy into `sources/` before ingest):

| Original path | Suggested `sources/` copy |
|---------------|---------------------------|
| `readme.md` | `sources/course/readme.md` |
| `lab_*/readme.md` or `README.md` | `sources/lab-notes/lab-XX-<slug>.md` |
| `.cursor/rules/*.mdc` | `sources/course/cursor-rules-summary.md` |
| External articles | `sources/articles/<slug>.md` |
| Lecture notes | `sources/lectures/<slug>.md` |

**Never ingest:** `.env`, API keys, tokens, `node_modules/`, `dist/`, credentials.

## Optional: Obsidian

Open this repo (or `wiki/` + `sources/`) as an Obsidian vault to browse the graph. Cursor Agent maintains files; Obsidian is for reading and navigation.

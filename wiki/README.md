# LLM Wiki

Agent-maintained knowledge base for this course (Karpathy **LLM Wiki** pattern).

| Layer | Path | You | Agent |
|-------|------|-----|-------|
| Sources | `sources/` | Add files | Read only |
| Wiki | `wiki/` | Browse (Obsidian OK) | Create/update |
| Schema | `AGENTS.md` | Edit conventions | Follow workflows |

## Quick start

1. **Browse** — open `wiki/index.md` or use Obsidian graph on this repo
2. **Query** — in Cursor: `Query wiki: how does lab 37 relate to MCP?`
3. **Ingest** — copy a lab README to `sources/lab-notes/`, then: `ingest sources/lab-notes/lab-XX.md`
4. **Lint** — `lint wiki` (orphans, gaps, contradictions)

Skill: `.cursor/skills/llm-wiki/` auto-triggers on ingest/query/lint phrases.

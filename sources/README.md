# Sources (immutable)

Drop curated inputs here. The LLM wiki agent **reads but never edits** these files.

## Layout

| Folder | Purpose |
|--------|---------|
| `course/` | Course readme, syllabus, cursor rules snapshots |
| `lab-notes/` | Snapshots copied from `lab_*/readme.md` before ingest |
| `lectures/` | Lecture notes, clipped articles, transcripts |
| `articles/` | External reading |
| `assets/` | Images and attachments referenced by sources |

## Adding a source

1. Add the file under the appropriate subfolder.
2. Include YAML frontmatter when possible:

```yaml
---
title: My Source
original_path: lab_35_MCP/README.md
snapshot_date: 2026-08-31
---
```

3. Tell Cursor: `ingest sources/<path>`

To refresh a snapshot from an updated lab README, add a **new** dated copy rather than overwriting (preserves history).

# Exercise: Insurance Rules — RAG Rule Builder

Build an end-to-end system that helps underwriters **create insurance rules safely**: index existing rules, suggest similar ones before save, and tag each suggestion by match severity.

Use the materials in this folder:


| Asset                                 | Purpose                                    |
| ------------------------------------- | ------------------------------------------ |
| `insurance_rules_dummy_100.json_text` | Sample rules to index (one rule per line)  |
| `rules.txt`                           | Rule language / DSL patterns               |
| `lists/*.json`                        | Named lists referenced by `in_list` rules  |
| `rule-builder-mockup.html`            | UI reference mockup (optional inspiration) |


---

## 1. Instructions

### Goal

When a user drafts a **new** insurance rule, the system must:

1. Search the indexed rule base (RAG over **pgvector**)
2. Show related rules **before** the new rule is created
3. Tag each related rule with one of:

  | Tag                      | Meaning                                                     |
  | ------------------------ | ----------------------------------------------------------- |
  | `Exact_Match`            | Same (or effectively identical) rule already exists         |
  | `High_Severity_Match`    | Very similar — likely duplicate or near-duplicate           |
  | `Low_Severity_Match`     | Related but different enough to keep                        |
  | `Duplicated_Add_to_list` | Candidate should be merged into an existing list-based rule |

4. Only then allow creating the rule (and **re-index** it after create)

### Requirements

1. **Index each rule separately** — do not embed the whole file as one document. Load from `insurance_rules_dummy_100.jsonl` (and keep your indexer ready for new rules).
2. **UI** — a rule builder that helps compose rules in the DSL style from `rules.txt` (React preferred; plain HTML/JS is acceptable). Use the mockup as a visual guide if you want.
3. **Pre-create check** — never create blindly; always run similarity / duplicate detection first and surface tagged suggestions.
4. **Server** — Node.js **or** Python, using **LangChain / LangGraph**.
5. **Database** — **PostgreSQL + pgvector** for embeddings and retrieval.
6. **Docker** — wrap the full stack so it runs with Compose (app + DB at minimum).
7. **Output** — the primary UX result is a list of **suggested similar rules**, each with the relevant tag from the table above.

### Suggested flow

```text
User drafts rule
    → embed / retrieve from pgvector
    → classify match severity (Exact / High / Low / Duplicated_Add_to_list)
    → show suggestions in UI
    → user confirms create
    → persist rule + index it
```

---

## 2. How to deliver

Submit a **GitHub repository** and email the link to **[galamouyal88@gmail.com](mailto:galamouyal88@gmail.com)**.

Your repo must include:

1. **Working code** (client + server + indexing)
2. `**docker-compose.yml`** so the project can be started with one command
3. **Images pushed to a container registry** (e.g. Docker Hub) and referenced from Compose — do not rely only on local builds if images are part of delivery
4. `**.env.example`** documenting every required env var (API keys, DB URL, ports, model names, etc.) — **never commit real secrets**
5. **Project README** with:
  - what the app does
  - how to configure `.env`
  - how to run with Docker Compose
  - short demo notes (example rule to type, what tags you expect)

---

## 3. What's important

These are the grading / review focus points — get these right even if the UI is simple:

- **One rule = one indexed chunk** — retrieval quality depends on this
- **Tags are first-class** — suggestions without `Exact_Match` / `High_Severity_Match` / `Low_Severity_Match` / `Duplicated_Add_to_list` are incomplete
- **Create path indexes the new rule** — the RAG store must stay in sync with the rule base
- **pgvector is mandatory** — similarity search must go through the vector DB, not an in-memory-only demo
- **Reproducible run** — Compose + `.env.example` + clear README; reviewers should not guess setup steps
- **Respect the DSL** — rules should follow patterns in `rules.txt` (attributes, ranges, lists, actions)
- **Lists matter** — `in_list` rules and files under `lists/` are part of the domain; treat them seriously when classifying `Duplicated_Add_to_list`

---

## Bonus (optional — harder)

### Agentic conflict analyst (beyond similarity)

Similarity finds *near-duplicates*. The harder problem is **logical conflict**:

> Same (or overlapping) conditions, **different actions** — e.g.  
> `if risk_zone in_range [8, 10] then increase_premium`  
> vs  
> `if risk_zone in_range [8, 9] then decline`

**Bonus challenge:** before create, run a **LangGraph** multi-step agent that:

1. Retrieves candidate neighbors from pgvector (as in the main exercise)
2. **Expands** list-based rules using `lists/*.json` when comparing
3. Detects **conflicts** (overlapping predicates, incompatible actions) — not only duplicates
4. Emits an extra tag or section, e.g. `Conflict_Detected`, with a short **explanation** of *why* the rules clash
5. Optionally proposes a **resolution** (narrow ranges, merge into a list rule, or change action) for the underwriter to accept/reject

This is optional, but it shows you can go from RAG lookup to **reasoning over underwriting policy**, which is what makes the product actually safe to use in production.
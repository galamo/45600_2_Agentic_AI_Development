---
title: Lab 7 RAG — Construction Pricing
original_path: lab_7_RAG/README.md
snapshot_date: 2026-08-31
lab: lab_7_RAG
---

# Lab 4 – RAG + Construction Pricing Agent

Node.js + LangChain pipeline that:

1. **Loads a constructor pricing file (TXT) into memory** via an in-memory RAG pipeline (vector store + embeddings).
2. **Accepts a construction image** (e.g. floor plan with markings for walls to remove, bathroom to demo) and returns a **pricing breakdown** using the RAG pricing data.

The structure is ready for future agents: one that **extracts** work items from the image, and another that **checks/validates** pricing.

## Pricing file

- **Path:** `data/pricing.txt`
- Loaded into an in-memory vector store at runtime.

## Run

```bash
node index.js <path-to-your-construction-image>
node scripts/run-rag-only.js   # test RAG without image
```

## Environment

- **OPENAI_API_KEY** or **OPENROUTER_API_KEY** for vision; embeddings via OpenAI by default.

## Key libraries

- `langchain` — MemoryVectorStore (in-memory RAG)
- `@langchain/openai` — ChatOpenAI (vision), OpenAIEmbeddings

## Future agents

- **Extraction agent** — image → structured work items
- **Pricing-check agent** — items + RAG → validation

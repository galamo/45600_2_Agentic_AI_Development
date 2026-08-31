---
title: Retrieval-Augmented Generation (RAG)
type: concept
sources:
  - sources/lab-notes/lab-07-rag.md
  - sources/course/readme.md
updated: 2026-08-31
tags: [rag, embeddings, langchain]
---

# Retrieval-Augmented Generation (RAG)

Pattern: **index documents → embed → retrieve relevant chunks at query time → augment LLM prompt** with retrieved context.

## Course pattern (Lab 7)

[[labs/lab-07-rag]] uses an **in-memory** pipeline:

1. Load `data/pricing.txt`
2. Split → embed → `MemoryVectorStore`
3. Retriever supplies context to vision agent for construction image pricing

Decouple ingestion from Q&A: indexing should not run on every request (course homework theme for OAuth PDF lab).

## RAG vs LLM Wiki

| | RAG (Lab 7) | LLM Wiki (this repo) |
|---|-------------|----------------------|
| Storage | Vectors / chunks | Structured markdown pages |
| Query | Retrieve similar chunks | Read compiled pages + index |
| Updates | Re-embed on change | Agent rewrites wiki pages on ingest |

This repository's `wiki/` folder implements the **Karpathy LLM Wiki** pattern — compounding markdown, not vector retrieval.

## Key libraries

- `langchain` — `MemoryVectorStore`
- `@langchain/openai` — embeddings and chat

## Related

- [[labs/lab-07-rag]]
- [[entities/langchain]]
- [[entities/openrouter]] — alternative chat provider in some labs

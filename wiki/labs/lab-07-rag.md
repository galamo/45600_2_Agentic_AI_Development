---
title: Lab 7 — RAG Construction Pricing
type: lab
sources:
  - sources/lab-notes/lab-07-rag.md
updated: 2026-08-31
tags: [lab, rag, vision]
lab_folder: lab_7_RAG
---

# Lab 7 — RAG + Construction Pricing

**Folder:** `lab_7_RAG`

## Purpose

Demonstrate [[concepts/rag]] with a **vision agent** that prices construction work from floor-plan images using rates from `data/pricing.txt`.

## Pipeline

1. Load pricing TXT → split → embed → in-memory vector store
2. Accept image path on CLI
3. Vision model + retrieved pricing context → breakdown

## Commands

```bash
node index.js ./samples/floorplan.jpg
node scripts/run-rag-only.js
```

## Extension points

- Extraction agent (image → work items)
- Pricing-check agent (validate items against RAG)

## Related

- [[concepts/rag]] · [[entities/langchain]] · [[sources/lab-07-rag]]

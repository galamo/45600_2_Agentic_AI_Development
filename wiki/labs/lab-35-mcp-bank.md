---
title: Lab 35 — MCP Bank Server
type: lab
sources:
  - sources/lab-notes/lab-35-mcp-bank.md
updated: 2026-08-31
tags: [lab, mcp, express]
lab_folder: lab_35_MCP
---

# Lab 35 — MCP Bank Server

**Folder:** `lab_35_MCP`

## Purpose

Minimal [[concepts/mcp]] server (Node + Express, **Streamable HTTP**) exposing dummy bank JSON via tools.

## Tools

- `get_users` — list or fetch user by id (`U001`, …)
- `get_bank_accounts` — by account id, user id, or list all

## Endpoint

`http://127.0.0.1:3000/mcp` — initialize session, then `tools/call` with `mcp-session-id`.

## Related

- [[concepts/mcp]] · [[labs/lab-10-mcp-quiz]] · [[sources/lab-35-mcp-bank]]

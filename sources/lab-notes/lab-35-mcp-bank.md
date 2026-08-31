---
title: Lab 35 MCP Bank Server
original_path: lab_35_MCP/README.md
snapshot_date: 2026-08-31
lab: lab_35_MCP
---

# Lab 35 - MCP Server

MCP server (Node.js + Express, Streamable HTTP transport) exposing dummy bank data through two tools.

Server: `http://127.0.0.1:3000/mcp`

## Tools

- **get_users** — `{ id?: string }`. List all or fetch one user (e.g. `U001`). Reads `data/users.json`.
- **get_bank_accounts** — `{ accountId?, userId? }`. List all, single account, or accounts by user. Reads `data/bank_accounts.json`.

## Manual test flow

1. POST initialize → capture `mcp-session-id` header
2. POST tools/call with session id

Transport: Streamable HTTP (JSON-RPC 2.0).

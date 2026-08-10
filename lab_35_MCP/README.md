# Lab 35 - MCP Server

MCP server (Node.js + Express, Streamable HTTP transport) exposing dummy bank data
through two tools, per `MCP_Server_Requirements.pdf`.

## Run

```bash
npm install
npm start        # or: npm run dev (auto-restart on changes)
```

Server listens on `http://127.0.0.1:3000/mcp` (override with `PORT` / `HOST` env vars).

## Tools

- **get_users** — `{ id?: string }`. Omit `id` to list all users, or pass a user id
  (e.g. `U001`) to fetch one. Reads `data/users.json`.
- **get_bank_accounts** — `{ accountId?: string, userId?: string }`. Omit both to
  list every account, pass `accountId` (e.g. `ACC-1001`) for a single account, or
  `userId` to list a user's accounts. Reads `data/bank_accounts.json`.

## Manual smoke test

```bash
# 1. Initialize a session (grab the mcp-session-id response header)
curl -i -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'

# 2. Call a tool using that session id
curl -X POST http://127.0.0.1:3000/mcp \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <id-from-step-1>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_users","arguments":{"id":"U001"}}}'
```

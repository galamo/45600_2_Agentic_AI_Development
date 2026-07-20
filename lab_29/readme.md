# Lab 29: Current Date MCP Server

Node.js MCP server exposed over **Streamable HTTP**, built with [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk).

It exposes a single tool so agents can resolve wall-clock time instead of guessing the date.

## Tool

| Tool | Description |
|------|-------------|
| `get_current_date` | Returns the current UTC date/time (`iso`, `utcDate`, `utcTime`, `unixMs`, `dayOfWeek`) |

## Setup

```bash
cd lab_29
cp .env.example .env
npm install
npm start
```

Server listens on `http://localhost:3300/mcp` by default.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Build TypeScript and run the server |
| `npm run dev` | Watch + rebuild on change |
| `npm run typecheck` | Type-check only |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_PORT` | `3300` | HTTP port |
| `LOG_LEVEL` | `info` | Winston log level |

Logs are written as JSON lines to `logs/app.log` and `logs/error.log`.

## Docker

```bash
# Build image
docker build -t lab29-current-date-mcp .

# Run container (maps host 3300 → container 3300)
docker run --rm -p 3300:3300 --name lab29-mcp lab29-current-date-mcp

# Optional: override port / log level
docker run --rm -p 3300:3300 -e MCP_PORT=3300 -e LOG_LEVEL=info --name lab29-mcp lab29-current-date-mcp
```

MCP endpoint inside the container: `http://localhost:3300/mcp`

## Smoke test

Health:

```bash
curl -s http://localhost:3300/health
```


List tools (initialize a session first in a real MCP client). With curl you can POST JSON-RPC after connecting with an MCP client such as Cursor or the SDK `Client`.

Example tool result shape:

```json
{
  "iso": "2026-07-20T17:16:00.000Z",
  "utcDate": "2026-07-20",
  "utcTime": "17:16:00",
  "unixMs": 1753031760000,
  "dayOfWeek": "Monday",
  "timezone": "UTC"
}
```

## Cursor / MCP client config

Point a Streamable HTTP MCP client at:

```text
http://localhost:3300/mcp
```

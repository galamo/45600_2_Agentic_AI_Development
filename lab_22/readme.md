# Lab 22 — Meeting Scheduler (Fullstack)

React client for scheduling meetings, backed by an Express API that persists data to a local JSON file on the server.

## Structure

```
lab_22/
  client/     # React + Vite (port 5173)
  server/     # Express API (port 3001)
    data/meetings.json
```

## Setup

### Server

```bash
cd server
npm install
cp .env.example .env   # optional — defaults work locally
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/meetings` | List all meetings |
| POST | `/api/meetings` | Create a meeting |
| DELETE | `/api/meetings/:id` | Delete a meeting |
| GET | `/api/meetings/raw` | Raw `meetings.json` contents |

## Meeting fields

- `title` — meeting name
- `date` — ISO datetime
- `durationMinutes` — length in minutes
- `attendees` — comma-separated emails or names
- `description` — optional notes

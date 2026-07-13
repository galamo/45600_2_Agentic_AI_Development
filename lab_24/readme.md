# Lab 24 — Meeting Scheduler (Fullstack)

React client for scheduling meetings, backed by an Express API that persists data to a local JSON file on the server.

## Structure

```
lab_24/
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

Open http://localhost:5173 — the Vite dev server proxies `/api` to the backend at `http://localhost:3001`.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/meetings` | List all meetings (`Meeting[]`) |
| GET | `/api/meetings/:id` | Get a single meeting |
| POST | `/api/meetings` | Create a meeting |
| DELETE | `/api/meetings/:id` | Delete a meeting |

### Create meeting body

```json
{
  "title": "Weekly sync",
  "date": "2026-07-14",
  "time": "10:00",
  "duration": 60,
  "participants": ["alice@example.com", "bob@example.com"],
  "description": "Optional notes"
}
```

## Meeting fields

- `title` — meeting name
- `date` — date string (`YYYY-MM-DD`)
- `time` — time string (`HH:mm`)
- `duration` — length in minutes (default 60)
- `participants` — comma-separated names or emails in the UI
- `description` — optional notes

## Client features

- Form to schedule a new meeting
- List of scheduled meetings with delete
- Live JSON viewer showing the current `GET /api/meetings` response

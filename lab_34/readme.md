# Lab 34 – Claude Agent SDK Web Q&A

Simple web-connected agent using `@anthropic-ai/claude-agent-sdk`, exposed over an Express HTTP API.

## Setup

```bash
cp .env.example .env   # set ANTHROPIC_API_KEY
npm install
npm run dev
```

## API

| Method | Path | Body |
|--------|------|------|
| `GET` | `/health` | — |
| `POST` | `/ask` | `{ "question": "..." }` |

Example:

```bash
curl -s http://localhost:3400/ask \
  -H 'Content-Type: application/json' \
  -d '{"question":"What is the latest Node.js LTS version?"}'
```

## Notes

- Agent uses built-in `WebSearch` and `WebFetch` tools
- Tool permissions are auto-approved (`bypassPermissions`)

## Docker

Image: `doctordocker88/lab-34-web-agent:latest`  
Replace `doctordocker88` with your Docker Hub username if different.

### Build

```bash
cd lab_34
docker build -t doctordocker88/lab-34-web-agent:latest .
```

### Run (standalone)

```bash
docker run --rm -p 3400:3400 --env-file .env doctordocker88/lab-34-web-agent:latest
```

### Login & push to Docker Hub

```bash
docker login
docker push doctordocker88/lab-34-web-agent:latest
```

### Deploy with Docker Compose (EC2)

On the EC2 instance, put these files in the same folder:

- `docker-compose.yml`
- `.env` (with `ANTHROPIC_API_KEY`, optional `PORT` / `LOG_LEVEL`)

Then:

```bash
docker compose pull
docker compose up -d
```

Update to the latest image:

```bash
docker compose pull
docker compose up -d
```

Stop:

```bash
docker compose down
```

Check health:

```bash
curl -s http://localhost:3400/health
```

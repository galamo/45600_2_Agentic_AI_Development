# Lab 26 — RAG Image Search with LangGraph

Visual RAG system like Lab 12, but upload and search pipelines are orchestrated with **LangGraph** `StateGraph` flows. Vision indexing and reranking still use LangChain `createAgent` with OpenRouter models.

## Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Node.js + Express + TypeScript
- **Orchestration:** LangGraph (`StateGraph`)
- **Agents:** LangChain `createAgent` + `ChatOpenRouter` (indexing + reranking)
- **LLM / embeddings:** OpenRouter
- **Vector store:** PostgreSQL + pgvector

## Project layout

```txt
lab_26/
  client/          React UI
  server/
    src/
      agents/      createAgent factories (indexing, reranker)
      graph/       LangGraph indexing + search pipelines
  docker-compose.yml
```

## LangGraph flows

### Indexing graph (upload)

```mermaid
flowchart LR
  START --> analyzeImage
  analyzeImage --> embedIndex
  embedIndex --> storeDocument
  storeDocument --> END
```

- **analyzeImage** — vision agent produces searchable JSON index
- **embedIndex** — embed `indexedText`
- **storeDocument** — insert row + vector in PGVector

### Search graph

```mermaid
flowchart LR
  START --> embedQuery
  embedQuery --> retrieveCandidates
  retrieveCandidates --> rerankCandidates
  rerankCandidates --> END
```

- **embedQuery** — embed the user query
- **retrieveCandidates** — PGVector similarity search
- **rerankCandidates** — reranker agent scores and explains matches

Inspect graph metadata: `GET /api/graph`

## Prerequisites

- Node.js 20+
- Docker (PostgreSQL + pgvector)
- OpenRouter API key

## Environment variables

Copy `server/.env.example` to `server/.env`:

```env
PORT=3002
DATABASE_URL=postgres://postgres:postgres@localhost:5433/image_rag_lab26
OPENROUTER_API_KEY=your_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_VISION_MODEL=openai/gpt-4o-mini
OPENROUTER_RERANKER_MODEL=openai/gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
UPLOAD_DIR=uploads
MAX_UPLOAD_MB=10
```

Lab 26 uses port **3002** (API) and **5174** (UI) so it can run alongside Lab 12.

## Database setup

```bash
cd lab_26
docker compose up -d
```

Run migration:

```bash
cd server
npm install
npm run migrate
```

## Run backend

```bash
cd lab_26/server
cp .env.example .env
npm install
npm run dev
```

Server: `http://localhost:3002`

## Run frontend

```bash
cd lab_26/client
npm install
npm run dev
```

UI: `http://localhost:5174`

## API

### Upload

```http
POST /api/images/upload
Content-Type: multipart/form-data
field: image
```

### Search

```http
GET /api/images/search?q=red+car
```

### Graph info

```http
GET /api/graph
```

## Example test flow

1. Start services:

   ```bash
   cd lab_26 && docker compose up -d
   cd server && npm run migrate && npm run dev
   cd ../client && npm run dev
   ```

2. Upload an image in the UI.
3. Search with keywords (e.g. `red car`).
4. Verify reranked scores and reasons on result cards.

## Architecture

```mermaid
flowchart LR
  UI[React UI] -->|upload| API[Express API]
  API --> IndexGraph[Indexing LangGraph]
  IndexGraph --> VisionAgent[Vision agent]
  IndexGraph --> Embed[Embedding service]
  IndexGraph --> PG[(PGVector)]
  UI -->|search q| API
  API --> SearchGraph[Search LangGraph]
  SearchGraph --> Embed
  SearchGraph --> PG
  SearchGraph --> RerankAgent[Reranker agent]
  RerankAgent --> UI
```

## Notes

- Agents use `createAgent` + `ChatOpenRouter` per course standards.
- Graph nodes call agents and infrastructure services; state is passed through LangGraph annotations.
- API keys stay on the server; the React app proxies `/api` and `/uploads` via Vite.

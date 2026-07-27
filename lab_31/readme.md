# Lab 31: Cars Rental Chatbot

Static HTML/JS client for **Cars Rental**. The chatbot is the main UI and talks to an n8n webhook agent.

## Prerequisites

1. n8n running locally (default `http://localhost:5678`)
2. Workflow with webhook path `c9bd1962-3d4f-43e4-8b34-514036c97e9b` **active**
3. Webhook accepts query param `message`

## Run the page

Serve the folder (needed so the browser can load scripts cleanly):

```bash
cd lab_31
npx --yes serve -p 4173
```

Open [http://localhost:4173](http://localhost:4173).

Or open `index.html` directly in the browser if your environment allows it.

## API

```
GET http://localhost:5678/webhook/c9bd1962-3d4f-43e4-8b34-514036c97e9b?message=<user question>
```

Requests use **Axios** (CDN). While waiting, the UI shows a progress bar. Agent text is read from common n8n fields (`output`, `text`, `message`, …).

## Files

| File         | Role                          |
|--------------|-------------------------------|
| `index.html` | Page shell + chat layout      |
| `styles.css` | Cars Rental branding          |
| `app.js`     | Chat UI, progress, Axios call |

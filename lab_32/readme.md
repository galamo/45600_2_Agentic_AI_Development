# Lab 32: Login Page

Express (Node.js) web server that serves the Signet login page only. No auth backend.

## Setup

```bash
cd lab_32
npm install
```

## Run

```bash
npm run dev
```

Or:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Optional: set `PORT` to change the listen port.

## Routes

| Method | Path          | Response              |
|--------|---------------|-----------------------|
| GET    | `/`           | Login page HTML       |
| GET    | `/styles.css` | Stylesheet            |

All other paths return `404`.

## Files

| File               | Role                         |
|--------------------|------------------------------|
| `index.html`       | Login page markup            |
| `styles.css`       | Layout and visual style      |
| `src/server.ts`    | Express server               |
| `src/lib/logger.ts`| Winston logger               |

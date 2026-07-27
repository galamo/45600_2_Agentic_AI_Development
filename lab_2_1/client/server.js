import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const API_URL = process.env.API_URL || "http://localhost:3001";
const publicDir = path.join(__dirname, "dist");

app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

app.use(
  "/generated-images",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

app.use(express.static(publicDir));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Kids Story client on http://0.0.0.0:${PORT} (API proxy → ${API_URL})`);
});

import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Lab 23 Express API running on http://localhost:${PORT}`);
});

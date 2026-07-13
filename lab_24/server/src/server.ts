import "dotenv/config";
import { createApp } from "./app.js";
import { getEnv } from "./config/env.js";

function main() {
  const env = getEnv();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`Lab 24 meeting scheduler API running on http://localhost:${env.PORT}`);
  });
}

main();

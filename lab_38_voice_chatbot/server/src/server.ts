import "dotenv/config";
import { createApp } from "./app";
import { getConfig } from "./config";
import { logger } from "./lib/logger";

const config = getConfig();
const app = createApp();

app.listen(config.PORT, () => {
  logger.info("Voice chatbot server started", { port: config.PORT });
});

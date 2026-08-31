import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

app.listen(config.port, () => {
  console.log(`lab_37_managed_agent API listening on port ${config.port}`);
});

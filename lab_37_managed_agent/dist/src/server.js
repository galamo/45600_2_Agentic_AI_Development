"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./config");
const app = (0, app_1.createApp)();
app.listen(config_1.config.port, () => {
    console.log(`lab_37_managed_agent API listening on port ${config_1.config.port}`);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askInputSchema = void 0;
const zod_1 = require("zod");
exports.askInputSchema = zod_1.z.object({
    message: zod_1.z.string().trim().min(1, "message is required"),
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
describe("Express API", () => {
    describe("GET /health", () => {
        it("returns 200 with status ok", async () => {
            const app = (0, app_1.createApp)(async () => "unused");
            const res = await (0, supertest_1.default)(app).get("/health");
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).to.deep.equal({ status: "ok" });
        });
    });
    describe("GET /ask", () => {
        it("returns the agent's answer for a valid message query param", async () => {
            const app = (0, app_1.createApp)(async (message) => `echo: ${message}`);
            const res = await (0, supertest_1.default)(app).get("/ask").query({ message: "Hello" });
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).to.deep.equal({ answer: "echo: Hello" });
        });
        it("returns 400 when the message query param is missing", async () => {
            const app = (0, app_1.createApp)(async () => "unused");
            const res = await (0, supertest_1.default)(app).get("/ask");
            (0, chai_1.expect)(res.status).to.equal(400);
            (0, chai_1.expect)(res.body).to.have.property("error");
        });
        it("returns 400 when the message query param is empty", async () => {
            const app = (0, app_1.createApp)(async () => "unused");
            const res = await (0, supertest_1.default)(app).get("/ask").query({ message: "   " });
            (0, chai_1.expect)(res.status).to.equal(400);
            (0, chai_1.expect)(res.body).to.have.property("error");
        });
        it("returns 502 when the agent call fails", async () => {
            const app = (0, app_1.createApp)(async () => {
                throw new Error("agent boom");
            });
            const res = await (0, supertest_1.default)(app).get("/ask").query({ message: "Hello" });
            (0, chai_1.expect)(res.status).to.equal(502);
            (0, chai_1.expect)(res.body).to.deep.equal({ error: "agent boom" });
        });
    });
    describe("POST /ask", () => {
        it("returns the agent's answer for a valid message body", async () => {
            const app = (0, app_1.createApp)(async (message) => `echo: ${message}`);
            const res = await (0, supertest_1.default)(app).post("/ask").send({ message: "Hello" });
            (0, chai_1.expect)(res.status).to.equal(200);
            (0, chai_1.expect)(res.body).to.deep.equal({ answer: "echo: Hello" });
        });
        it("returns 400 when the message field is missing", async () => {
            const app = (0, app_1.createApp)(async () => "unused");
            const res = await (0, supertest_1.default)(app).post("/ask").send({});
            (0, chai_1.expect)(res.status).to.equal(400);
            (0, chai_1.expect)(res.body).to.have.property("error");
        });
        it("returns 502 when the agent call fails", async () => {
            const app = (0, app_1.createApp)(async () => {
                throw new Error("agent boom");
            });
            const res = await (0, supertest_1.default)(app).post("/ask").send({ message: "Hello" });
            (0, chai_1.expect)(res.status).to.equal(502);
            (0, chai_1.expect)(res.body).to.deep.equal({ error: "agent boom" });
        });
    });
});

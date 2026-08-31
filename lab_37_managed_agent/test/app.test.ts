import { expect } from "chai";
import request from "supertest";
import { createApp } from "../src/app";

describe("Express API", () => {
  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const app = createApp(async () => "unused");

      const res = await request(app).get("/health");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: "ok" });
    });
  });

  describe("GET /ask", () => {
    it("returns the agent's answer for a valid message query param", async () => {
      const app = createApp(async (message: string) => `echo: ${message}`);

      const res = await request(app).get("/ask").query({ message: "Hello" });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ answer: "echo: Hello" });
    });

    it("returns 400 when the message query param is missing", async () => {
      const app = createApp(async () => "unused");

      const res = await request(app).get("/ask");

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 when the message query param is empty", async () => {
      const app = createApp(async () => "unused");

      const res = await request(app).get("/ask").query({ message: "   " });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 502 when the agent call fails", async () => {
      const app = createApp(async () => {
        throw new Error("agent boom");
      });

      const res = await request(app).get("/ask").query({ message: "Hello" });

      expect(res.status).to.equal(502);
      expect(res.body).to.deep.equal({ error: "agent boom" });
    });
  });

  describe("POST /ask", () => {
    it("returns the agent's answer for a valid message body", async () => {
      const app = createApp(async (message: string) => `echo: ${message}`);

      const res = await request(app).post("/ask").send({ message: "Hello" });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ answer: "echo: Hello" });
    });

    it("returns 400 when the message field is missing", async () => {
      const app = createApp(async () => "unused");

      const res = await request(app).post("/ask").send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 502 when the agent call fails", async () => {
      const app = createApp(async () => {
        throw new Error("agent boom");
      });

      const res = await request(app).post("/ask").send({ message: "Hello" });

      expect(res.status).to.equal(502);
      expect(res.body).to.deep.equal({ error: "agent boom" });
    });
  });
});

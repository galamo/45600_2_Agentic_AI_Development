import { expect } from "chai";
import request from "supertest";
import { createApp } from "../src/app";
import type { ChatVoiceResult } from "../src/graph/chat-voice-graph";

describe("Voice chatbot API", () => {
  const stubHandler = async (message: string): Promise<ChatVoiceResult> => ({
    answer: `echo: ${message}`,
    audioBase64: "dGVzdA==",
    mimeType: "audio/mpeg",
  });

  describe("GET /health", () => {
    it("returns 200 with status ok", async () => {
      const app = createApp(stubHandler);
      const res = await request(app).get("/health");

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: "ok" });
    });
  });

  describe("POST /api/chat", () => {
    it("returns answer and audio for a valid message", async () => {
      const app = createApp(stubHandler);
      const res = await request(app).post("/api/chat").send({ message: "Hello" });

      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        answer: "echo: Hello",
        audioBase64: "dGVzdA==",
        mimeType: "audio/mpeg",
      });
    });

    it("returns 400 when message is missing", async () => {
      const app = createApp(stubHandler);
      const res = await request(app).post("/api/chat").send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 400 when message is empty", async () => {
      const app = createApp(stubHandler);
      const res = await request(app).post("/api/chat").send({ message: "   " });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("error");
    });

    it("returns 502 when the chat handler fails", async () => {
      const app = createApp(async () => {
        throw new Error("agent boom");
      });

      const res = await request(app).post("/api/chat").send({ message: "Hello" });

      expect(res.status).to.equal(502);
      expect(res.body).to.deep.equal({ error: "agent boom" });
    });
  });
});

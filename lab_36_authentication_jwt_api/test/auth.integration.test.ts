import assert from "assert";
import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();

describe("Auth API", () => {
  const email = `test_${Date.now()}@example.com`;
  const password = "Demo1234!";

  it("rejects signup with an invalid email", async () => {
    const res = await request(app).post("/auth/signup").send({ email: "not-an-email", password });
    assert.strictEqual(res.status, 400);
  });

  it("signs up a new user", async () => {
    const res = await request(app).post("/auth/signup").send({ email, password });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.email, email);
  });

  it("rejects duplicate signup", async () => {
    const res = await request(app).post("/auth/signup").send({ email, password });
    assert.strictEqual(res.status, 409);
  });

  it("rejects login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({ email, password: "wrong-password" });
    assert.strictEqual(res.status, 401);
  });

  it("logs in and returns an access token", async () => {
    const res = await request(app).post("/auth/login").send({ email, password });
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.accessToken);
  });

  it("rejects the protected route without a token", async () => {
    const res = await request(app).get("/api/dashboard");
    assert.strictEqual(res.status, 401);
  });

  it("allows the protected route with a valid access token", async () => {
    const loginRes = await request(app).post("/auth/login").send({ email, password });
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${loginRes.body.accessToken}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });
});

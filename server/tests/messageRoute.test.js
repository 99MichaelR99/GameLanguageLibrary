const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Message } = require("../models/message");
const app = require("../index");

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  server = app.listen();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  if (server) server.close();
});

describe("Message Routes", () => {
  beforeEach(async () => {
    await Message.deleteMany({});
  });

  describe("POST /api/messages", () => {
    it("should create a new message", async () => {
      const newMessage = {
        name: "Alice Johnson",
        email: "alice@example.com",
        message: "This is a test message with enough length.",
      };

      const res = await request(app).post("/api/messages").send(newMessage);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Alice Johnson");
      expect(res.body.email).toBe("alice@example.com");
      expect(res.body.message).toBe(
        "This is a test message with enough length."
      );
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app).post("/api/messages").send({
        email: "alice@example.com",
        message: "This is a valid message.",
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is invalid", async () => {
      const res = await request(app).post("/api/messages").send({
        name: "Alice Johnson",
        email: "invalid-email",
        message: "This is a valid message.",
      });

      expect(res.status).toBe(400);
    });

    it("should return 400 if message is too short", async () => {
      const res = await request(app).post("/api/messages").send({
        name: "Alice Johnson",
        email: "alice@example.com",
        message: "Short",
      });

      expect(res.status).toBe(400);
    });
  });
});

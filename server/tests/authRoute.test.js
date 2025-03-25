const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/test");
const app = require("../index");

process.env.JWT_PRIVATE_KEY =
  "f3e2a4b0c8e3d8f5a9b4d2e7f1c3a0b5d6e9f2a7c1b8e4d3f0a5c7b2e9d1f6a3";

let mongoServer, server;
let userID, token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  server = app.listen();

  // Create a mock user
  const user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: await bcrypt.hash("123456", 10), // hash password
  });
  userID = user._id;

  // Generate auth token
  token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_PRIVATE_KEY,
    {
      expiresIn: "1h",
    }
  );
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  if (server) server.close();
});

describe("Authentication Routes", () => {
  describe("POST /api/auth", () => {
    it("should return a token if credentials are valid", async () => {
      const res = await request(app)
        .post("/api/auth")
        .send({ email: "test@example.com", password: "123456" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token"); // token should be in the response
      expect(res.body.token).toMatch(/[A-Za-z0-9\-._~\+\/]+=*/); // token format check
    });

    it("should return 400 if email is invalid", async () => {
      const res = await request(app)
        .post("/api/auth")
        .send({ email: "invalid@example.com", password: "123456" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid email or password."); // Check for invalid email or password
    });

    it("should return 400 if password is invalid", async () => {
      const res = await request(app)
        .post("/api/auth")
        .send({ email: "test@example.com", password: "wrongpassword" });

      expect(res.status).toBe(400);
      expect(res.text).toBe("Invalid email or password."); // Check for invalid password
    });

    it("should return 400 if no email or password is provided", async () => {
      const res = await request(app).post("/api/auth").send({});

      expect(res.status).toBe(400);
      expect(res.text).toContain('"email" is required'); // email field validation
      expect(res.text).toContain('"password" is required'); // password field validation
    });
  });
});

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../config/test");
const dotenv = require("dotenv").config();
const bcrypt = require("bcryptjs");
const app = require("../index");

process.env.JWT_PRIVATE_KEY =
  "f3e2a4b0c8e3d8f5a9b4d2e7f1c3a0b5d6e9f2a7c1b8e4d3f0a5c7b2e9d1f6a3";
config.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

let mongoServer, server;
let token, userID;

jest.mock("config", () => ({
  get: (key) => {
    if (key === "requiresAuth") return true;
    if (key === "jwtPrivateKey")
      return "f3e2a4b0c8e3d8f5a9b4d2e7f1c3a0b5d6e9f2a7c1b8e4d3f0a5c7b2e9d1f6a3";
    return process.env[key];
  },
}));

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
    password: await bcrypt.hash("123456", 10),
    favoriteGames: [],
  });
  userID = user._id;

  // Generate auth token
  token = jwt.sign(
    { _id: user._id, email: user.email },
    config.JWT_PRIVATE_KEY,
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

describe("User Routes", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("GET /api/users/me", () => {
    it("should return the current user", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
      });

      const res = await request(app)
        .get("/api/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Test User");
      expect(res.body).toHaveProperty("email", "test@example.com");
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 401 if no token is provided", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/users/me", () => {
    it("should update the user profile", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
      });

      const res = await request(app)
        .put("/api/users/me")
        .set("x-auth-token", token)
        .send({ name: "Updated User", email: "updated@example.com" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "Updated User");
      expect(res.body).toHaveProperty("email", "updated@example.com");
    });

    it("should update the password if old and new passwords are provided", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
      });

      const res = await request(app)
        .put("/api/users/me")
        .set("x-auth-token", token)
        .send({ oldPassword: "123456", newPassword: "newpassword123" });

      expect(res.status).toBe(200);

      const updatedUser = await User.findById(userID);
      const validPassword = await bcrypt.compare(
        "newpassword123",
        updatedUser.password
      );
      expect(validPassword).toBe(true);
    });

    it("should return 400 if old password is incorrect", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
      });

      const res = await request(app)
        .put("/api/users/me")
        .set("x-auth-token", token)
        .send({ oldPassword: "wrongpassword", newPassword: "newpassword123" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/users/me/favorites", () => {
    it("should return the user's favorite games", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
        favoriteGames: [
          { gameID: new mongoose.Types.ObjectId(), versionID: "v1" },
        ],
      });

      const res = await request(app)
        .get("/api/users/me/favorites")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(mongoose.Types.ObjectId.isValid(res.body[0].gameID)).toBe(true);
      expect(res.body[0]).toHaveProperty("versionID", "v1");
    });
  });

  const gameID = new mongoose.Types.ObjectId();

  describe("PUT /api/users/me/favorites", () => {
    it("should add a game to favorites", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
        favoriteGames: [],
      });

      const res = await request(app)
        .put("/api/users/me/favorites")
        .set("x-auth-token", token)
        .send({ gameID: gameID, versionID: "v1" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Game added to favorites");
    });

    it("should remove a game from favorites if it already exists", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
        favoriteGames: [{ gameID: gameID, versionID: "v1" }],
      });

      const res = await request(app)
        .put("/api/users/me/favorites")
        .set("x-auth-token", token)
        .send({ gameID: gameID, versionID: "v1" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Game removed from favorites");
    });
  });

  describe("DELETE /api/users/me/favorites", () => {
    it("should remove all favorite games", async () => {
      await User.create({
        _id: userID,
        name: "Test User",
        email: "test@example.com",
        password: await bcrypt.hash("123456", 10),
        favoriteGames: [
          { gameID: new mongoose.Types.ObjectId(), versionID: "v1" },
        ],
      });

      const res = await request(app)
        .delete("/api/users/me/favorites")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("All favorites removed");
    });
  });
});

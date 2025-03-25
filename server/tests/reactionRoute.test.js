const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Reaction } = require("../models/reaction");
const { Post } = require("../models/post");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const config = require("../config/test");
const dotenv = require("dotenv").config();
const app = require("../index");

process.env.JWT_PRIVATE_KEY =
  "f3e2a4b0c8e3d8f5a9b4d2e7f1c3a0b5d6e9f2a7c1b8e4d3f0a5c7b2e9d1f6a3";
config.JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

let mongoServer, server;
let token, userID, postID;

jest.mock("config", () => ({
  get: (key) => {
    if (key === "requiresAuth") return true; // Mocking requiresAuth to always return true
    if (key === "jwtPrivateKey")
      return "f3e2a4b0c8e3d8f5a9b4d2e7f1c3a0b5d6e9f2a7c1b8e4d3f0a5c7b2e9d1f6a3"; // Mock jwtPrivateKey
    return process.env[key]; // Fallback to actual environment variables if needed
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
    password: "123456",
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

  // Create a mock post
  const post = await Post.create({
    gameName: "Test Game",
    platform: "PS5",
    code: "TEST_12345",
    voiceLanguages: ["English"],
    subtitlesLanguages: ["English"],
    createdBy: userID,
  });

  postID = post._id;
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoose.disconnect();
  await mongoServer.stop();
  if (server) server.close();
});

describe("Reaction Routes", () => {
  beforeEach(async () => {
    await Reaction.deleteMany({});
  });

  describe("GET /api/reactions/post/:postID", () => {
    it("should return reaction counts for a specific post", async () => {
      await Reaction.create([{ postID, userID, type: "like" }]);

      const res = await request(app)
        .get(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(1);
      expect(res.body.dislikes).toBe(0);
      expect(res.body.userReaction).toBe("like");
    });

    it("should return default counts if no reactions exist", async () => {
      const res = await request(app)
        .get(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(0);
      expect(res.body.dislikes).toBe(0);
      expect(res.body.userReaction).toBeNull();
    });
  });

  describe("POST /api/reactions/post/:postID", () => {
    it("should add a new reaction", async () => {
      const res = await request(app)
        .post(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`)
        .send({ reactionType: "like" });

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(1);
      expect(res.body.dislikes).toBe(0);
      expect(res.body.userReaction).toBe("like");
    });

    it("should update an existing reaction", async () => {
      await Reaction.create({ postID, userID, type: "like" });

      const res = await request(app)
        .post(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`)
        .send({ reactionType: "dislike" });

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(0);
      expect(res.body.dislikes).toBe(1);
      expect(res.body.userReaction).toBe("dislike");
    });

    it("should remove the reaction if the same type is submitted again", async () => {
      await Reaction.create({ postID, userID, type: "like" });

      const res = await request(app)
        .post(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`)
        .send({ reactionType: "like" });

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(0); // Now it will correctly be 0 after removal
      expect(res.body.dislikes).toBe(0); // Now it will correctly be 0 after removal
      expect(res.body.userReaction).toBeNull(); // Correctly null after removal
      expect(res.body.message).toBe("Reaction removed"); // The correct message
    });

    it("should return 400 if the reaction type is invalid", async () => {
      const res = await request(app)
        .post(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`)
        .send({ reactionType: "invalid" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/reactions/stats/:postID", () => {
    it("should return statistics for a post's reactions", async () => {
      await Reaction.create([
        { postID, type: "like", userID: new mongoose.Types.ObjectId() },
        { postID, type: "dislike", userID: new mongoose.Types.ObjectId() },
        { postID, type: "like", userID: new mongoose.Types.ObjectId() },
      ]);

      const res = await request(app)
        .get(`/api/reactions/stats/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(2);
      expect(res.body.dislikes).toBe(1);
    });

    it("should return zero counts if no reactions exist", async () => {
      const res = await request(app)
        .get(`/api/reactions/stats/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(200);
      expect(res.body.likes).toBe(0);
      expect(res.body.dislikes).toBe(0);
    });
  });

  describe("DELETE /api/reactions/post/:postID", () => {
    it("should delete all reactions for a specific post", async () => {
      await Reaction.create([
        { postID, type: "like", userID: new mongoose.Types.ObjectId() },
        { postID, type: "dislike", userID: new mongoose.Types.ObjectId() },
      ]);

      const res = await request(app)
        .delete(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Reactions deleted");

      const reactions = await Reaction.find({ postID });
      expect(reactions.length).toBe(0);
    });

    it("should return 404 if no reactions exist for a post", async () => {
      const res = await request(app)
        .delete(`/api/reactions/post/${postID}`)
        .set("x-auth-token", `${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No reactions found for this post");
    });
  });
});

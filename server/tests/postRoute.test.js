const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../index");
const { Post } = require("../models/post");

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

describe("Post Routes", () => {
  beforeEach(async () => {
    await Post.deleteMany({});
  });

  describe("GET /api/posts", () => {
    it("should get all posts", async () => {
      const post = new Post({
        createdBy: new mongoose.Types.ObjectId(),
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      });

      await post.save();

      const res = await request(app).get("/api/posts");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get posts by user", async () => {
      const userId = new mongoose.Types.ObjectId();
      const post = new Post({
        createdBy: userId,
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      });

      await post.save();

      const res = await request(app).get(`/api/posts?createdBy=${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/posts", () => {
    it("should create a new post", async () => {
      const newPost = {
        createdBy: new mongoose.Types.ObjectId(),
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      };

      const res = await request(app).post("/api/posts").send(newPost);
      expect(res.status).toBe(200);
      expect(res.body.gameName).toBe("Test Game");
      expect(res.body.platform).toBe("PS4");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/posts").send({
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("should update a post", async () => {
      const post = new Post({
        createdBy: new mongoose.Types.ObjectId(),
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      });

      await post.save();

      const updatedPost = {
        createdBy: post.createdBy,
        gameName: "Updated Game",
        platform: "PS5",
        code: "GAME_67890",
        voiceLanguages: ["Spanish"],
        subtitlesLanguages: ["Spanish"],
      };

      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .send(updatedPost);
      expect(res.status).toBe(200);
      expect(res.body.gameName).toBe("Updated Game");
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete a post", async () => {
      const post = new Post({
        createdBy: new mongoose.Types.ObjectId(),
        gameName: "Test Game",
        platform: "PS4",
        code: "GAME_12345",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      });

      await post.save();

      const res = await request(app).delete(`/api/posts/${post._id}`);
      expect(res.status).toBe(200);
      expect(res.body.gameName).toBe("Test Game");
    });
  });
});

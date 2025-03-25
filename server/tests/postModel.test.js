const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Post } = require("../models/post");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Post Model", () => {
  it("should create a post successfully", async () => {
    const post = new Post({
      createdBy: new mongoose.Types.ObjectId(),
      gameName: "Test Game",
      platform: "PS4",
      code: "GAME_12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    });

    await post.save();

    const savedPost = await Post.findById(post._id);
    expect(savedPost.gameName).toBe("Test Game");
    expect(savedPost.platform).toBe("PS4");
    expect(savedPost.code).toBe("GAME 12345");
    expect(savedPost.voiceLanguages).toEqual(["English"]);
    expect(savedPost.subtitlesLanguages).toEqual(["English"]);
  });

  it("should fail to create a post without a required field", async () => {
    const post = new Post({
      gameName: "Test Game",
      platform: "PS4",
      code: "GAME_12345",
      voiceLanguages: ["English"],
    });

    let error;
    try {
      await post.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a post with invalid platform", async () => {
    const post = new Post({
      createdBy: new mongoose.Types.ObjectId(),
      gameName: "Test Game",
      platform: "InvalidPlatform",
      code: "GAME_12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    });

    let error;
    try {
      await post.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a post with invalid code", async () => {
    const post = new Post({
      createdBy: new mongoose.Types.ObjectId(),
      gameName: "Test Game",
      platform: "PS4",
      code: "INVALIDCODE",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    });

    let error;
    try {
      await post.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
});

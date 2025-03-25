const mongoose = require("mongoose");
const { Reaction } = require("../models/reaction");
const { MongoMemoryServer } = require("mongodb-memory-server");

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

describe("Reaction Model", () => {
  it("should create a valid reaction", async () => {
    const reaction = new Reaction({
      postID: new mongoose.Types.ObjectId(),
      userID: new mongoose.Types.ObjectId(),
      type: "like",
    });

    await reaction.save();

    const savedReaction = await Reaction.findById(reaction._id);
    expect(savedReaction).toHaveProperty("_id");
    expect(savedReaction).toHaveProperty("postID");
    expect(savedReaction).toHaveProperty("userID");
    expect(savedReaction).toHaveProperty("type", "like");
    expect(savedReaction).toHaveProperty("createdAt");
  });

  /*it("should enforce unique reaction per user per post", async () => {
    const postID = new mongoose.Types.ObjectId();
    const userID = new mongoose.Types.ObjectId();

    // Create the first reaction (this should succeed)
    const reaction1 = new Reaction({ postID, userID, type: "like" });
    await reaction1.save();

    // Try to create a second reaction with the same postID and userID (this should fail)
    const reaction2 = new Reaction({ postID, userID, type: "dislike" });

    // Expect the second save to throw a MongoError for duplicate key
    await expect(reaction2.save()).rejects.toThrowError(
      /duplicate key error collection/
    );
  });*/

  it("should throw an error for invalid reaction type", async () => {
    const reaction = new Reaction({
      postID: new mongoose.Types.ObjectId(),
      userID: new mongoose.Types.ObjectId(),
      type: "love", // Invalid type
    });

    let error;
    try {
      await reaction.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it("should fail to create a reaction without a postID", async () => {
    const reaction = new Reaction({
      userID: new mongoose.Types.ObjectId(),
      type: "like",
    });

    let error;
    try {
      await reaction.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it("should fail to create a reaction without a userID", async () => {
    const reaction = new Reaction({
      postID: new mongoose.Types.ObjectId(),
      type: "like",
    });

    let error;
    try {
      await reaction.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });

  it("should fail to create a reaction without a type", async () => {
    const reaction = new Reaction({
      postID: new mongoose.Types.ObjectId(),
      userID: new mongoose.Types.ObjectId(),
    });

    let error;
    try {
      await reaction.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
  });
});

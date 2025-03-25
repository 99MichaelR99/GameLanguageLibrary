const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Game } = require("../models/game");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Clear database before each test to avoid duplicate key errors
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Game Model", () => {
  it("should create a game successfully", async () => {
    const game = new Game({
      name: "Minecraft",
      versions: [
        {
          createdBy: new mongoose.Types.ObjectId(),
          platform: "PS5",
          code: "MINE_12345",
          voiceLanguages: ["English"],
          subtitlesLanguages: ["English"],
        },
      ],
    });

    await game.save();

    const savedGame = await Game.findById(game._id);
    expect(savedGame.name).toBe("Minecraft");
  });

  it("should fail to create a game without a name", async () => {
    const game = new Game({
      versions: [
        {
          createdBy: new mongoose.Types.ObjectId(),
          platform: "PS5",
          code: "MINE_12345",
          voiceLanguages: ["English"],
          subtitlesLanguages: ["English"],
        },
      ],
    });

    let error;
    try {
      await game.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should return the correct number of versions", async () => {
    const game = new Game({
      name: "Minecraft",
      versions: [
        {
          createdBy: new mongoose.Types.ObjectId(),
          platform: "PS5",
          code: "MINE_12345",
          voiceLanguages: ["English"],
          subtitlesLanguages: ["English"],
        },
        {
          createdBy: new mongoose.Types.ObjectId(),
          platform: "PS5",
          code: "MINE_12346",
          voiceLanguages: ["English"],
          subtitlesLanguages: ["English"],
        },
      ],
    });

    await game.save();

    const savedGame = await Game.findById(game._id);
    expect(savedGame.versions.length).toBe(2);
  });
});

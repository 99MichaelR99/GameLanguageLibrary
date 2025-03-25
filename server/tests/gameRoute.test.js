const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Game } = require("../models/game");
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

describe("Game Routes", () => {
  beforeEach(async () => {
    await Game.deleteMany({});
  });

  describe("GET /api/games", () => {
    it("should return all games sorted by name", async () => {
      await Game.create([
        {
          name: "Zelda",
          versions: [
            {
              createdBy: new mongoose.Types.ObjectId(),
              platform: "PS5",
              code: "TEST_00021",
              voiceLanguages: ["English"],
              subtitlesLanguages: ["English"],
            },
          ],
        },
        {
          name: "Mario",
          versions: [
            {
              createdBy: new mongoose.Types.ObjectId(),
              platform: "PS5",
              code: "TEST_00024",
              voiceLanguages: ["English"],
              subtitlesLanguages: ["English"],
            },
          ],
        },
      ]);

      const res = await request(app).get("/api/games");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe("Mario"); // Sorted alphabetically
    });
  });

  describe("GET /api/games/name", () => {
    it("should return a game by name (case-insensitive)", async () => {
      await Game.create({
        name: "Super Mario",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "TEST_00026",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      });

      const res = await request(app).get("/api/games/name?name=super mario");

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Super Mario");
    });

    it("should return 404 if game not found", async () => {
      const res = await request(app).get("/api/games/name?name=unknown");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/games", () => {
    it("should create a new game", async () => {
      const newGame = {
        name: "FIFA",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "FIFA_12345",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      };

      const res = await request(app)
        .post("/api/games")
        .set("Authorization", "Bearer valid_admin_token")
        .send(newGame);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("FIFA");
    });

    it("should return 400 if game already exists", async () => {
      await Game.create({
        name: "FIFA",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "FIFA_54321",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      });

      const res = await request(app)
        .post("/api/games")
        .set("Authorization", "Bearer valid_admin_token")
        .send({
          name: "FIFA",
          versions: [
            {
              createdBy: new mongoose.Types.ObjectId(),
              platform: "PS5",
              code: "FIFA_67890",
              voiceLanguages: ["English"],
              subtitlesLanguages: ["English"],
            },
          ],
        });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/games/:id", () => {
    it("should update an existing game", async () => {
      const game = await Game.create({
        name: "NBA 2K",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS4",
            code: "TEST_20233",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      });

      const updatedGame = {
        name: "NBA 2K Updated",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "TEST_20243",
            voiceLanguages: ["Spanish"],
            subtitlesLanguages: ["Spanish"],
          },
        ],
      };

      const res = await request(app)
        .put(`/api/games/${game._id}`)
        .set("Authorization", "Bearer valid_admin_token")
        .send(updatedGame);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("NBA 2K Updated");
      expect(res.body.versions[0].platform).toBe("PS5");
    });

    it("should return 404 if game not found", async () => {
      const res = await request(app)
        .put("/api/games/65f2b21b4f57a27a1e8d9eaa")
        .set("Authorization", "Bearer valid_admin_token")
        .send({
          name: "Nonexistent Game",
          versions: [
            {
              createdBy: new mongoose.Types.ObjectId(),
              platform: "PS5",
              code: "TEST_00001",
              voiceLanguages: ["English"],
              subtitlesLanguages: ["English"],
            },
          ],
        });

      expect(res.status).toBe(404);
    });

    it("should return 400 if request data is invalid", async () => {
      const game = await Game.create({
        name: "FIFA 21",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "FIFA_00021",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      });

      const invalidUpdate = {
        name: "", // Invalid name
        versions: [],
      };

      const res = await request(app)
        .put(`/api/games/${game._id}`)
        .set("Authorization", "Bearer valid_admin_token")
        .send(invalidUpdate);

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/games/:id", () => {
    it("should delete a game", async () => {
      const game = await Game.create({
        name: "Tetris",
        versions: [
          {
            createdBy: new mongoose.Types.ObjectId(),
            platform: "PS5",
            code: "TEST_98765",
            voiceLanguages: ["English"],
            subtitlesLanguages: ["English"],
          },
        ],
      });

      const res = await request(app)
        .delete(`/api/games/${game._id}`)
        .set("Authorization", "Bearer valid_admin_token");

      expect(res.status).toBe(200);
    });

    it("should return 404 if game not found", async () => {
      const res = await request(app)
        .delete("/api/games/65f2b21b4f57a27a1e8d9eaa")
        .set("Authorization", "Bearer valid_admin_token");

      expect(res.status).toBe(404);
    });
  });
});

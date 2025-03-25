const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { User } = require("../models/user");

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

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      isAdmin: false,
      favoriteGames: [],
    });

    await user.save();

    const savedUser = await User.findById(user._id);
    expect(savedUser.name).toBe("John Doe");
    expect(savedUser.email).toBe("john@example.com");
    expect(savedUser.password).toBe("securepassword");
    expect(savedUser.isAdmin).toBe(false);
    expect(savedUser.favoriteGames.length).toBe(0);
  });

  it("should fail to create a user without a name", async () => {
    const user = new User({
      email: "john@example.com",
      password: "securepassword",
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a user without an email", async () => {
    const user = new User({
      name: "John Doe",
      password: "securepassword",
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a user without a password", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  /*it("should enforce unique email constraint", async () => {
    await User.init(); // Ensure unique index is applied

    const user1 = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });

    const user2 = new User({
      name: "Jane Doe",
      email: "john@example.com", // Duplicate email
      password: "securepassword",
    });

    await user1.save();

    let error;
    try {
      await user2.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key error
  });*/

  it("should generate a valid auth token", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
    });

    const token = user.generateAuthToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("should add a favorite game to the user", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      favoriteGames: [],
    });

    await user.save();

    // Add a favorite game
    const gameID = new mongoose.Types.ObjectId();
    user.favoriteGames.push({
      gameID,
      versionID: "v1.0.0",
    });

    await user.save();
    const savedUser = await User.findById(user._id);

    expect(savedUser.favoriteGames.length).toBe(1);
    expect(savedUser.favoriteGames[0].gameID.toString()).toBe(
      gameID.toString()
    );
    expect(savedUser.favoriteGames[0].versionID).toBe("v1.0.0");
  });

  it("should fail to add a favorite game without gameID", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      favoriteGames: [],
    });

    await user.save();

    user.favoriteGames.push({
      versionID: "v1.0.0", // Missing gameID
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to add a favorite game without versionID", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "securepassword",
      favoriteGames: [],
    });

    await user.save();

    user.favoriteGames.push({
      gameID: new mongoose.Types.ObjectId(), // Missing versionID
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
});

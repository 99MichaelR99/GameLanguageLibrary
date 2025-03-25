const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Message } = require("../models/message");

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

describe("Message Model", () => {
  it("should create a message successfully", async () => {
    const message = new Message({
      name: "John Doe",
      email: "johndoe@example.com",
      message: "This is a test message with sufficient length.",
    });

    await message.save();

    const savedMessage = await Message.findById(message._id);
    expect(savedMessage.name).toBe("John Doe");
    expect(savedMessage.email).toBe("johndoe@example.com");
    expect(savedMessage.message).toBe(
      "This is a test message with sufficient length."
    );
  });

  it("should fail to create a message without a name", async () => {
    const message = new Message({
      email: "johndoe@example.com",
      message: "This is a test message with sufficient length.",
    });

    let error;
    try {
      await message.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a message with an invalid email", async () => {
    const message = new Message({
      name: "John Doe",
      email: "invalid-email",
      message: "This is a test message with sufficient length.",
    });

    let error;
    try {
      await message.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });

  it("should fail to create a message with too short content", async () => {
    const message = new Message({
      name: "John Doe",
      email: "johndoe@example.com",
      message: "Short",
    });

    let error;
    try {
      await message.save();
    } catch (err) {
      error = err;
    }
    expect(error).toBeDefined();
  });
});

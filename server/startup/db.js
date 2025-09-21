const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  if (process.env.NODE_ENV === "test") return;

  mongoose.set("strictQuery", false);

  const raw =
    process.env.MONGODB_URI ||
    (config.has("db")
      ? config.get("db")
      : "mongodb://127.0.0.1/GameLanguageVerify");
  const uri = String(raw).trim();

  mongoose
    .connect(uri)
    .then(() =>
      winston.info(
        `Connected to MongoDB (${
          uri.startsWith("mongodb+srv://") ? "Atlas" : "local"
        })...`
      )
    )
    .catch((err) => {
      winston.error("Failed to connect to MongoDB:", err.message);
      if (process.env.NODE_ENV === "production") process.exit(1);
    });
};

/*const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(db)
    .then(() => winston.info(`Connected to ${db}...`))
    .catch((err) =>
      winston.error("Failed to connect to MongoDB:", err.message)
    );
};*/
/*const winston = require("winston");
const mongoose = require("mongoose");

module.exports = async function () {
  mongoose.set("strictQuery", false);
  const url = "mongodb://127.0.0.1/GameLanguageVerify";
  if (process.env.NODE_ENV === "test") return;
  await mongoose
    .connect(url)
    .then(() => winston.info("Connected to MongoDB..."))
    .catch((err) => winston.error("Failed to connect to MongoDB:", err));
};*/

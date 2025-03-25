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
const winston = require("winston");
const mongoose = require("mongoose");

module.exports = async function () {
  mongoose.set("strictQuery", false);
  const url = "mongodb://127.0.0.1/GameLanguageVerify";
  if (process.env.NODE_ENV === "test") return;
  await mongoose
    .connect(url)
    .then(() => winston.info("Connected to MongoDB..."))
    .catch((err) => winston.error("Failed to connect to MongoDB:", err));
};

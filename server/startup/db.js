const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  mongoose.set("strictQuery", false);
  const url = "mongodb://127.0.0.1/GameLanguageVerify";
  mongoose
    .connect(url)
    .then(() => winston.info("Connected to MongoDB..."))
    .catch((err) => winston.error("Failed to connect to MongoDB:", err));
};

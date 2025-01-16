const winston = require("winston");
const debug = require("debug")("app:startup");
const morgan = require("morgan");
const config = require("config");
require("winston-mongodb");
require("express-async-errors");

module.exports = function (app) {
  // Configure Winston with transports
  const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({ colorize: true, prettyPrint: true }),
      new winston.transports.File({ filename: "unhandledExceptions.log" }),
    ],
  });

  // Handle uncaught exceptions
  winston.exceptions.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "unhandledExceptions.log" })
  );

  // Handle unhandled promise rejections
  winston.rejections.handle(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "unhandledRejections.log" })
  );

  winston.add(new winston.transports.File({ filename: "log" }));
  winston.add(
    new winston.transports.MongoDB({
      //db: config.get("db"),
      db: "mongodb://127.0.0.1/GameLanguageVerify",
      level: "info",
    })
  );

  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
    debug("Morgan enabled...");
  }
};

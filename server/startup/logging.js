const winston = require("winston");
const morgan = require("morgan");
const config = require("config");
require("winston-mongodb");
require("express-async-errors");

module.exports = function (app) {
  // Configure the DEFAULT winston logger so winston.info(...) works
  winston.configure({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [new winston.transports.File({ filename: "log" })],
    exceptionHandlers: [
      new winston.transports.File({ filename: "unhandledExceptions.log" }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: "unhandledRejections.log" }),
    ],
  });

  // Console output in development
  if (app.get("env") === "development") {
    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
    app.use(morgan("tiny"));
  }

  // Optional: also log to Mongo if a valid-looking URI is available
  const rawUri =
    process.env.MONGODB_URI || (config.has("db") ? config.get("db") : null);
  const mongoUri = rawUri && String(rawUri).trim();

  // Only attempt to add the MongoDB transport if the URI starts with mongodb:// or mongodb+srv://
  if (mongoUri && /^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
    try {
      winston.add(
        new winston.transports.MongoDB({
          db: mongoUri,
          level: "info",
          // no deprecated options here
        })
      );
    } catch (e) {
      // Never crash the app if Mongo logging can't initialize
      winston.warn("Mongo logging disabled:", e.message);
    }
  } else if (mongoUri) {
    // URI was present but not valid-looking
    winston.warn(
      "Mongo logging disabled: MONGODB_URI does not look like a Mongo connection string."
    );
  }
};

/*const winston = require("winston");
const morgan = require("morgan");
const config = require("config");
require("winston-mongodb");
require("express-async-errors");

module.exports = function (app) {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [new winston.transports.File({ filename: "log" })],
    exceptionHandlers: [
      new winston.transports.File({ filename: "unhandledExceptions.log" }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: "unhandledRejections.log" }),
    ],
  });

  // Console in dev
  if (app.get("env") === "development") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
    app.use(morgan("tiny"));
  }

  // Optional: log to Mongo only if we have a URI
  const mongoUri =
    process.env.MONGODB_URI || (config.has("db") ? config.get("db") : null);
  if (mongoUri) {
    logger.add(
      new winston.transports.MongoDB({
        db: mongoUri,
        level: "info",
        options: { useUnifiedTopology: true },
      })
    );
  }
};*/

/*const winston = require("winston");
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
};*/

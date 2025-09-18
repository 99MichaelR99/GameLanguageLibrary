const cors = require("cors");

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://99MichaelR99.github.io",
  "https://99MichaelR99.github.io/GameLanguageLibrary",
];

module.exports = function (app) {
  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (mobile apps, curl, Render health checks)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // also accept the gh-pages site without the trailing repo segment just in case
        if (origin.startsWith("https://99MichaelR99.github.io"))
          return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
      credentials: true,
      maxAge: 86400, // cache preflight for a day
    })
  );

  // ensure preflight requests succeed fast
  app.options("*", cors());
};

/*const cors = require("cors");

module.exports = function (app) {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://99MichaelR99.github.io",
        "https://99MichaelR99.github.io/GameLanguageLibrary",
      ],
      credentials: true,
    })
  );
};*/

/*module.exports = function (app) {
  app.use(cors());
};*/

const cors = require("cors");

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://99MichaelR99.github.io",
  "https://99MichaelR99.github.io/GameLanguageLibrary",
];

const corsOptions = {
  origin(origin, callback) {
    // allow requests with no origin (Render health checks, curl, mobile apps)
    if (!origin) return callback(null, true);

    // exact match or any GH Pages under your user site
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.startsWith("https://99MichaelR99.github.io")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
  maxAge: 86400, // cache preflight for 1 day
};

module.exports = function (app) {
  // Apply CORS to all routes
  app.use(cors(corsOptions));

  // Make sure preflight requests return the same headers
  app.options("*", cors(corsOptions));
};

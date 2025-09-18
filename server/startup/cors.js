const cors = require("cors");

const RAW_ALLOWED = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  // we'll allow any casing of your GH Pages origin below
  "https://99michaelr99.github.io", // base
  "https://99michaelr99.github.io/GameLanguageLibrary", // subpath
];

// make a normalized (lowercased) set for fast checks
const ALLOWED_LOWER = new Set(RAW_ALLOWED.map((o) => o.toLowerCase()));

const corsOptions = {
  origin(origin, callback) {
    // allow requests with no Origin (Render health checks, curl, server-to-server)
    if (!origin) return callback(null, true);

    const o = origin.toLowerCase();

    // exact allowlist match (case-insensitive)
    if (ALLOWED_LOWER.has(o)) return callback(null, true);

    // also allow any path under your GH Pages domain (case-insensitive)
    if (o.startsWith("https://99michaelr99.github.io"))
      return callback(null, true);

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  credentials: true,
  maxAge: 86400, // cache preflight for a day
};

module.exports = function (app) {
  // Apply CORS to all routes
  app.use(cors(corsOptions));

  // Ensure preflight uses the SAME options (and returns the headers)
  app.options("*", cors(corsOptions));
};

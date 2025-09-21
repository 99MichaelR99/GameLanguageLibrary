// server/scripts/seedGames.js
// Usage:
//   node scripts/seedGames.js
//   node scripts/seedGames.js --replace
//   node scripts/seedGames.js --admin you@mail.tld
//
// Behavior:
// - Never uses _id/__v from the JSON
// - Normalizes fields to match your schema
// - Forces createdBy to a real user (admin preferred)
// - Inserts one game at a time; appends new versions by code if game exists
// - With --replace, drops 'games' collection first

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_PATH = path.join(__dirname, "data", "games.seed.json");
const MONGODB_URI =
  (process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim()) ||
  "mongodb://127.0.0.1/GameLanguageVerify";

// CLI flags
const doReplace = process.argv.includes("--replace");
const adminEmailIdx = process.argv.indexOf("--admin");
const adminEmail =
  adminEmailIdx !== -1 ? process.argv[adminEmailIdx + 1] : null;

// Models (use your actual app models)
let Game, User;
try {
  const gameMod = require("../models/game");
  Game = gameMod.Game || gameMod;
} catch (e) {
  console.error("Cannot load models/game.js. Make sure it exists.");
  process.exit(1);
}

try {
  const userMod = require("../models/user");
  User = userMod.User || userMod;
} catch (e) {
  // Minimal fallback if your user model path is different
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    isAdmin: Boolean,
    password: String,
  });
  User = mongoose.model("User", UserSchema);
}

const { ObjectId } = mongoose.Types;

// Convert {"$oid":"..."} to ObjectId (if you ever keep them for anything else)
function mongoExportReviver(key, value) {
  if (value && typeof value === "object" && "$oid" in value) {
    return new ObjectId(value.$oid);
  }
  return value;
}

// Deep strip _id/__v and return a plain JS object
function stripIds(doc) {
  if (Array.isArray(doc)) return doc.map(stripIds);
  if (doc && typeof doc === "object") {
    const out = {};
    for (const [k, v] of Object.entries(doc)) {
      if (k === "_id" || k === "__v") continue;
      out[k] = stripIds(v);
    }
    return out;
  }
  return doc;
}

// Normalize a version to match your schema expectations
function normalizeVersion(v, createdById) {
  if (!v) return null;
  const platform = String(v.platform || "")
    .toUpperCase()
    .trim();
  // code: uppercase and replace underscores with a single space
  const code = String(v.code || "")
    .toUpperCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const voiceLanguages = Array.isArray(v.voiceLanguages)
    ? [...v.voiceLanguages].map(String).sort()
    : [];
  const subtitlesLanguages = Array.isArray(v.subtitlesLanguages)
    ? [...v.subtitlesLanguages].map(String).sort()
    : [];

  const isOfficial = Boolean(v.isOfficial);

  return {
    createdBy: createdById, // force to resolved user
    platform,
    code,
    voiceLanguages,
    subtitlesLanguages,
    isOfficial,
  };
}

async function resolveSeederUserId() {
  // 1) explicit --admin email
  if (adminEmail) {
    const u = await User.findOne({ email: adminEmail }).select("_id");
    if (u) {
      console.log(`Using --admin ${adminEmail} (${u._id}) as createdBy.`);
      return u._id;
    }
    console.warn(`--admin "${adminEmail}" not found; falling back to search.`);
  }

  // 2) any admin
  const admin = await User.findOne({ isAdmin: true }).select("_id email");
  if (admin) {
    console.log(
      `Using existing admin ${admin.email || admin._id} (${
        admin._id
      }) as createdBy.`
    );
    return admin._id;
  }

  // 3) any user
  const anyUser = await User.findOne({}).select("_id email");
  if (anyUser) {
    console.log(
      `No admin found; using first user ${anyUser.email || anyUser._id} (${
        anyUser._id
      }) as createdBy.`
    );
    return anyUser._id;
  }

  // 4) create a temporary admin to satisfy schema
  const temp = await User.create({
    name: "Seeder Admin",
    email: `seeder-admin-${Date.now()}@example.com`,
    isAdmin: true,
    password: "unused", // hashed in real app, but this seed user is only for createdBy
  });
  console.log(
    `Created temporary admin ${temp.email} (${temp._id}) as createdBy.`
  );
  return temp._id;
}

(async () => {
  console.log(`Connecting to ${MONGODB_URI} ...`);
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGODB_URI);

  const dbName = mongoose.connection.db.databaseName;
  console.log(`Connected to database "${dbName}".`);

  if (doReplace) {
    try {
      await mongoose.connection.db.collection("games").drop();
      console.log("Dropped 'games' collection.");
    } catch (e) {
      if (e.codeName === "NamespaceNotFound") {
        console.log("No 'games' collection yet; skipping drop.");
      } else {
        throw e;
      }
    }
  }

  // Load and sanitize JSON
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  let seedGames = JSON.parse(raw, mongoExportReviver);
  seedGames = stripIds(seedGames);

  // Keep only items with a valid name
  seedGames = seedGames.filter(
    (g) => g && typeof g.name === "string" && g.name.trim().length > 0
  );

  if (seedGames.length === 0) {
    console.warn("No seed items with a 'name' found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  // Resolve a valid createdBy id to stamp on every version
  const createdById = await resolveSeederUserId();

  let insertedGames = 0;
  let appendedVersions = 0;
  let skippedVersions = 0;

  // Insert games one by one (like manual app behavior)
  for (const seed of seedGames) {
    const name = seed.name.trim();
    const versions = Array.isArray(seed.versions) ? seed.versions : [];

    // normalize & de-duplicate by code (within this seed record)
    const seenCodes = new Set();
    const normalizedVersions = [];
    for (const v of versions) {
      const norm = normalizeVersion(v, createdById);
      if (!norm || !norm.code) {
        console.warn(
          `⚠️  Skipping version with missing/invalid code in "${name}".`
        );
        skippedVersions++;
        continue;
      }
      if (seenCodes.has(norm.code)) {
        console.warn(
          `⚠️  Duplicate code "${norm.code}" in "${name}" (seed file). Skipping one.`
        );
        skippedVersions++;
        continue;
      }
      seenCodes.add(norm.code);
      normalizedVersions.push(norm);
    }

    // Find existing game by name
    let game = await Game.findOne({ name }).exec();

    if (!game) {
      // Create fresh game
      if (normalizedVersions.length === 0) {
        console.warn(`⚠️  "${name}" has no valid versions; skipping game.`);
        continue;
      }
      try {
        const created = await Game.create({
          name,
          versions: normalizedVersions,
        });
        console.log(
          `✓ Inserted game "${name}" with ${normalizedVersions.length} version(s).`
        );
        insertedGames++;
      } catch (err) {
        // Duplicate version.code (global) may trigger E11000 if an index exists
        if (err && err.code === 11000) {
          console.warn(
            `⚠️  Duplicate key while inserting "${name}" (likely a version code already exists elsewhere). Skipping game.`
          );
        } else {
          console.warn(`⚠️  Failed to insert "${name}":`, err.message);
        }
      }
    } else {
      // Append only versions with codes not already present in this game
      const existingCodes = new Set(game.versions.map((v) => v.code));
      const toAppend = normalizedVersions.filter(
        (v) => !existingCodes.has(v.code)
      );

      if (toAppend.length === 0) {
        console.log(`• "${name}" exists; no new versions to add.`);
        continue;
      }

      // Try to push one by one so we can skip individual duplicates safely
      let added = 0;
      for (const v of toAppend) {
        try {
          game.versions.push(v);
          await game.save(); // save after each push to catch unique errors precisely
          added++;
        } catch (err) {
          // Likely duplicate version.code (unique index) somewhere else
          game = await Game.findById(game._id); // reload in case of partial save error
          if (err && err.code === 11000) {
            console.warn(
              `⚠️  Skipped version "${v.code}" for "${name}" due to duplicate key.`
            );
            skippedVersions++;
          } else {
            console.warn(
              `⚠️  Failed adding version "${v.code}" to "${name}": ${err.message}`
            );
            skippedVersions++;
          }
        }
      }

      if (added > 0) {
        console.log(`↺ Updated "${name}": appended ${added} version(s).`);
        appendedVersions += added;
      } else {
        console.log(`• "${name}" unchanged.`);
      }
    }
  }

  console.log(
    `\n✅ Done. Inserted games: ${insertedGames}, appended versions: ${appendedVersions}, skipped versions: ${skippedVersions}.`
  );

  await mongoose.disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

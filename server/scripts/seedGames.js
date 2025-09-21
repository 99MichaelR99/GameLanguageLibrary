// server/scripts/seedGames.js
// Usage:
//   node scripts/seedGames.js
//   node scripts/seedGames.js --replace
//   node scripts/seedGames.js --admin you@mail.tld

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

const doReplace = process.argv.includes("--replace");
const adminEmailIdx = process.argv.indexOf("--admin");
const adminEmail =
  adminEmailIdx !== -1 ? process.argv[adminEmailIdx + 1] : null;

// Optional: try to resolve a real admin _id if you pass --admin
let User;
try {
  const loadedUser = require("../models/user");
  User = loadedUser && loadedUser.User ? loadedUser.User : loadedUser;
} catch {
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    isAdmin: Boolean,
  });
  User = mongoose.model("User", UserSchema);
}

const { ObjectId } = mongoose.Types;

// Convert {"$oid":"..."} to ObjectId
function mongoExportReviver(key, value) {
  if (value && typeof value === "object" && "$oid" in value) {
    return new ObjectId(value.$oid);
  }
  return value;
}

// Strip __v recursively
function cleanDoc(doc) {
  if (Array.isArray(doc)) return doc.map(cleanDoc);
  if (doc && typeof doc === "object") {
    const out = {};
    for (const [k, v] of Object.entries(doc)) {
      if (k === "__v") continue;
      out[k] = cleanDoc(v);
    }
    return out;
  }
  return doc;
}

async function resolveAdminIdFromEmail(email) {
  if (!email) return null;
  const user = await User.findOne({ email }).select("_id");
  if (!user) {
    console.warn(
      `⚠️  --admin "${email}" not found; createdBy will not be overridden.`
    );
    return null;
  }
  console.log(`Using admin ${email} as createdBy: ${user._id}`);
  return user._id;
}

function forceCreatedBy(games, adminId) {
  if (!adminId) return games;
  return games.map((g) => ({
    ...g,
    versions: (g.versions || []).map((v) => ({ ...v, createdBy: adminId })),
  }));
}

(async () => {
  console.log(`Connecting to ${MONGODB_URI} ...`);
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGODB_URI);

  const dbName = mongoose.connection.db.databaseName;
  const col = mongoose.connection.db.collection("games");
  console.log(
    `Connected. Database: "${dbName}", Collection: "${col.collectionName}"`
  );

  const beforeCount = await col.countDocuments().catch(() => 0);
  console.log(`Documents before: ${beforeCount}`);

  const raw = fs.readFileSync(DATA_PATH, "utf8");
  let games = JSON.parse(raw, mongoExportReviver);
  games = cleanDoc(games);

  // Sanity: only keep items with a 'name'
  games = games.filter(
    (g) => g && typeof g.name === "string" && g.name.trim().length > 0
  );

  const adminId = await resolveAdminIdFromEmail(adminEmail);
  games = forceCreatedBy(games, adminId);

  if (doReplace) {
    console.log("Dropping 'games' collection (if present) …");
    try {
      await col.drop();
      console.log("Dropped 'games'.");
    } catch (e) {
      if (e.codeName === "NamespaceNotFound") {
        console.log("No 'games' collection yet; skip drop.");
      } else throw e;
    }

    if (games.length === 0) {
      console.warn("No seed items with a 'name' found. Nothing to insert.");
    } else {
      const insertRes = await col.insertMany(games, { ordered: false });
      console.log(
        `✅ Inserted ${insertRes.insertedCount} games (authoritative replace).`
      );
    }
  } else {
    // Non-destructive upsert by name
    const ops = games.map((g) => ({
      replaceOne: {
        filter: { name: g.name },
        replacement: g,
        upsert: true,
      },
    }));

    if (ops.length === 0) {
      console.warn("No upsert operations produced (missing 'name' fields?).");
    } else {
      const res = await col.bulkWrite(ops, { ordered: false });
      // res contains: matchedCount, modifiedCount, upsertedCount, upsertedIds, etc.
      console.log(
        `✅ bulkWrite done. matched=${res.matchedCount || 0}, modified=${
          res.modifiedCount || 0
        }, upserted=${res.upsertedCount || 0}`
      );
      if (res.upsertedIds && Object.keys(res.upsertedIds).length) {
        console.log("Upserted IDs:", res.upsertedIds);
      }
    }
  }

  const afterCount = await col.countDocuments();
  console.log(`Documents after: ${afterCount}`);

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch(async (err) => {
  console.error("❌ Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

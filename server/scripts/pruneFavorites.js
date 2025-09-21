// server/scripts/pruneFavorites.js
// Usage:
//   node scripts/pruneFavorites.js
// Notes:
// - Connects using server/.env (same as the app)
// - Removes any favorite whose game/version no longer exists
// - Verbose logging so you can see what's happening

require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");

const MONGODB_URI =
  (process.env.MONGODB_URI && String(process.env.MONGODB_URI).trim()) ||
  "mongodb://127.0.0.1/GameLanguageVerify";

(async () => {
  // Load models the same way the app does
  let Game, User;
  try {
    const gameMod = require("../models/game");
    Game = gameMod.Game || gameMod;
  } catch (e) {
    console.error("❌ Could not load models/game.js:", e.message);
    process.exit(1);
  }

  try {
    const userMod = require("../models/user");
    User = userMod.User || userMod;
  } catch (e) {
    console.error("❌ Could not load models/user.js:", e.message);
    process.exit(1);
  }

  console.log(`Connecting to ${MONGODB_URI} ...`);
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Build fast lookups for valid games and version IDs
  const games = await Game.find({}).select("_id versions._id").lean();
  const validGameIds = new Set(games.map((g) => String(g._id)));
  const validVersionsByGame = new Map(
    games.map((g) => [
      String(g._id),
      new Set((g.versions || []).map((v) => String(v._id))),
    ])
  );

  const users = await User.find({}).select("_id email favorites").lean();
  let usersTouched = 0;
  let totalRemoved = 0;

  for (const u of users) {
    const favs = Array.isArray(u.favorites) ? u.favorites : [];
    if (favs.length === 0) continue;

    const cleaned = favs.filter((f) => {
      const gId = String(f.gameID);
      const vId = String(f.versionID);
      if (!validGameIds.has(gId)) return false;
      const versions = validVersionsByGame.get(gId);
      return versions && versions.has(vId);
    });

    if (cleaned.length !== favs.length) {
      const removed = favs.length - cleaned.length;
      await User.updateOne({ _id: u._id }, { $set: { favorites: cleaned } });
      usersTouched++;
      totalRemoved += removed;
      console.log(
        `• Fixed user ${u.email || u._id}: removed ${removed} stale favorite(s)`
      );
    }
  }

  if (usersTouched === 0) {
    console.log("No users needed pruning. ✅");
  } else {
    console.log(
      `✅ Pruned favorites for ${usersTouched} user(s), total removed: ${totalRemoved}.`
    );
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
})().catch(async (err) => {
  console.error("❌ pruneFavorites failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

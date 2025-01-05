const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Game, validateGame, validateVersion } = require("../models/game");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const games = await Game.find().sort("name");
  // Sort versions by code alphabetically for each game
  games.forEach((game) => {
    game.versions.sort((a, b) => a.code.localeCompare(b.code));
  });
  res.send(games);
});

router.get("/name", async (req, res) => {
  const { name } = req.query; // Get the game name from the query parameter
  if (!name) {
    return res.status(400).send("Game name is required.");
  }

  // Perform case-insensitive search for the game by name
  const game = await Game.findOne({ name: { $regex: new RegExp(name, "i") } });
  if (!game) {
    return res.status(404).send("No game found with that name.");
  }
  game.versions.sort((a, b) => a.code.localeCompare(b.code));
  res.send(game); // Send the game details if found
});

router.get("/:id", async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  game.versions.sort((a, b) => a.code.localeCompare(b.code));
  res.send(game);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validateGame(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the game already exists by name
  let game = await Game.findOne({ name: req.body.name });
  if (game)
    return res.status(400).send("The game already exists with that name.");

  // Since the game does not exist, create a new one
  game = new Game({
    name: req.body.name,
    versions: [],
  });

  // Use a Set to store unique codes
  const uniqueCodes = new Set();

  // Filter out duplicate versions based on code
  const uniqueVersions = req.body.versions.filter(
    (version) => !uniqueCodes.has(version.code) && uniqueCodes.add(version.code)
  );
  if (uniqueCodes.size !== req.body.versions.length)
    res.send("Duplicated Version Was Removed");

  // Sort voiceLanguages and subtitlesLanguages before saving to the db
  uniqueVersions.forEach((version) => {
    if (version.voiceLanguages) version.voiceLanguages.sort();
    if (version.subtitlesLanguages) version.subtitlesLanguages.sort();
  });

  // Add the new version to the game
  game.versions.push(...uniqueVersions);
  game.versions.sort((a, b) => a.code.localeCompare(b.code));

  const savedGame = await game.save();
  res.send(savedGame);
});

router.post("/:id", [auth], async (req, res) => {
  const { error } = validateVersion(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if the game already exists by name
  const game = await Game.findById(req.params.id);
  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  // Check if the version already exists in the game
  const existingVersion = game.versions.find(
    (version) => version.code === req.body.code
  );
  if (existingVersion)
    return res.status(400).send("The version already exists in the game.");

  // Sort voiceLanguages and subtitlesLanguages before saving to the db
  if (req.body.voiceLanguages) req.body.voiceLanguages.sort();
  if (req.body.subtitlesLanguages) req.body.subtitlesLanguages.sort();

  // Add the new version to the game
  game.versions.push(req.body);
  game.versions.sort((a, b) => a.code.localeCompare(b.code));

  // Save the updated game
  const savedGame = await game.save();
  res.send(savedGame);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateGame(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Sort voiceLanguages and subtitlesLanguages before saving to the db
  req.body.versions.forEach((version) => {
    if (version.voiceLanguages) version.voiceLanguages.sort();
    if (version.subtitlesLanguages) version.subtitlesLanguages.sort();
  });

  const game = await Game.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      versions: req.body.versions.sort((a, b) => a.code.localeCompare(b.code)),
    },
    { new: true }
  );

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

/// Route to update a specific version of a game
router.put("/:id/:versionID", [auth, admin], async (req, res) => {
  // Ensure voiceLanguages and subtitlesLanguages are sorted if updated
  if (req.body.voiceLanguages) req.body.voiceLanguages.sort();
  if (req.body.subtitlesLanguages) req.body.subtitlesLanguages.sort();

  // Update the version with new data
  const updatedVersion = await Game.findOneAndUpdate(
    { _id: req.params.id, "versions._id": req.params.versionID },
    { $set: { "versions.$": req.body } },
    { new: true }
  );

  // Check if the version was found and updated
  if (!updatedVersion)
    return res.status(404).send("The version with the given ID was not found.");

  updatedVersion.versions.sort((a, b) => a.code.localeCompare(b.code));
  res.send(updatedVersion);
});

// Route to delete a specific version of a game
router.delete("/:id", [auth, admin], async (req, res) => {
  const game = await Game.findByIdAndDelete(req.params.id);

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

// Route to delete a specific version of a game
router.delete("/:id/:versionID", [auth, admin], async (req, res) => {
  // Find the game by ID
  const game = await Game.findById(req.params.id);
  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  // Find the index of the version to delete
  const versionIndex = game.versions.findIndex(
    (version) => version.id === req.params.versionID
  );
  if (versionIndex === -1)
    return res.status(404).send("The version with the given ID was not found.");

  // Remove the version from the array
  game.versions.splice(versionIndex, 1);
  game.versions.sort((a, b) => a.code.localeCompare(b.code));

  // If no versions remain, delete the entire game
  if (game.versions.length === 0) {
    await Game.findByIdAndDelete(req.params.id);
    return res.send(
      "The last version was deleted, and the game has been removed."
    );
  }

  // Save the updated game
  await game.save();

  res.send(game);
});

module.exports = router;

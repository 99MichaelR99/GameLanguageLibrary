const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Game, validateGame, validateVersion } = require("../models/game");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const games = await Game.find().sort("name");
  res.send(games);
});

router.get("/:id", async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

// GET /games/:id/versions - Get all versions of a game
/*router.get('/:id/versions', async (req, res) => {
    // Find the game by ID
    const game = await Game.findById(req.params.id).populate('versions');
    if (!game) return res.status(404).send('The game with the given ID was not found.');

    // Send the versions of the game as the response
    res.send(game.versions);
});*/

/*router.post('/', [auth, admin], async (req, res) => {
    const { error } = validateGame(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    // Check if the game already exists by name
    let game = await Game.findOne({ name: req.body.name });
    // If the game does not exist, create a new one
    if (!game) game = new Game({
            name: req.body.name,
            versions: []
        });

    // Check for duplicated versions by code id
    const existingCodes = game.versions.map(version => version.code);
    const newVersions = req.body.versions.filter(version => !existingCodes.includes(version.code));

    // Add the new version to the game
    game.versions.push(...newVersions);

    const savedGame = await game.save();
    res.send(savedGame);

});*/

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

  // Add the new version to the game
  game.versions.push(...uniqueVersions);

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

  // Add the new version to the game
  game.versions.push(req.body);

  // Save the updated game
  const savedGame = await game.save();
  res.send(savedGame);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validateGame(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const game = await Game.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      versions: req.body.versions,
    },
    { new: true }
  );

  /*const game = await Game.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        versions: req.body.versions.map(version => ({
            createdBy: version.createdBy,
            platform: version.platform,
            code: version.code,
            voiceLanguages: version.voiceLanguages,
            subtitlesLanguages: version.subtitlesLanguages
        }))
    }, { new: true });*/

  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  res.send(game);
});

// Route to update a specific version of a game
router.put("/:id/:versionId", [auth, admin], async (req, res) => {
  // Update the version with new data
  const updatedVersion = await Game.findOneAndUpdate(
    { _id: req.params.id, "versions._id": req.params.versionId },
    { $set: { "versions.$": req.body } },
    { new: true }
  );
  // Check if the version was found and updated
  if (!updatedVersion)
    return res.status(404).send("The version with the given ID was not found.");

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
router.delete("/:id/:versionId", [auth, admin], async (req, res) => {
  // Find the game by ID
  const game = await Game.findById(req.params.id);
  if (!game)
    return res.status(404).send("The game with the given ID was not found.");

  // Find the index of the version to delete
  const versionIndex = game.versions.findIndex(
    (version) => version.id === req.params.versionId
  );
  if (versionIndex === -1)
    return res.status(404).send("The version with the given ID was not found.");

  // Remove the version from the array
  game.versions.splice(versionIndex, 1);

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

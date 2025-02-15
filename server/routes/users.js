const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const { User, validate } = require("../models/user");
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Route to get current user's details
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// Route to update current user's profile
router.put("/me", auth, async (req, res) => {
  // Validate only the fields that are present in the request
  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    email: Joi.string().email().max(255),
    oldPassword: Joi.string().min(5).max(255).allow(""),
    newPassword: Joi.string().min(5).max(255).allow(""),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("User not found.");

  // Destructure request body to get the relevant fields
  const { name, email, oldPassword, newPassword } = req.body;

  // If both old and new password are provided, validate the password change
  if (oldPassword && newPassword) {
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).send("Invalid old password.");

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  user.name = name || user.name;
  user.email = email || user.email;

  // Save the updated user
  await user.save();

  // Return the updated user details (excluding password)
  res.send(_.pick(user, ["_id", "name", "email"]));
});

// Register new user (existing code)
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

// Get all favorite games for the logged-in user
router.get("/me/favorites", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("favoriteGames");
  res.send(user.favoriteGames || []); // Return the favorite games array
});

// Add or remove a favorite game version for the logged-in user
router.put("/me/favorites", auth, async (req, res) => {
  const { gameID, versionID } = req.body;

  // Validate the request body
  if (!gameID || !versionID) {
    return res.status(400).send("Game ID and version ID are required.");
  }

  const user = await User.findById(req.user._id);

  // Check if the game version is already in the favorites list
  const existingFavorite = user.favoriteGames.find(
    (fav) => fav.gameID.toString() === gameID && fav.versionID === versionID
  );

  if (existingFavorite) {
    // If already favorited, remove it (toggle off)
    user.favoriteGames = user.favoriteGames.filter(
      (fav) => fav.gameID.toString() !== gameID || fav.versionID !== versionID
    );
    await user.save();
    return res.send({ message: "Game removed from favorites" });
  } else {
    // Add the game to the favorites
    user.favoriteGames.push({ gameID, versionID, createdAt: new Date() });
    await user.save();
    return res.send({ message: "Game added to favorites" });
  }
});

// Delete all favorite games for the logged-in user
router.delete("/me/favorites", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favoriteGames = [];
  await user.save();
  res.send({ message: "All favorites removed" });
});

// Delete a specific favorite game
router.delete("/me/favorites/:gameID/:versionID", auth, async (req, res) => {
  const { gameID, versionID } = req.params;
  const user = await User.findById(req.user._id);

  // Remove the favorite game from the user's favorites
  user.favoriteGames = user.favoriteGames.filter(
    (fav) => fav.gameID.toString() !== gameID || fav.versionID !== versionID
  );
  await user.save();

  res.send({ message: "Favorite removed" });
});

module.exports = router;

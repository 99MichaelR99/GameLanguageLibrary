const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const { User, validate } = require("../models/user");
const express = require("express");
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

module.exports = router;

/*const {User, validate} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const Users = await User.find().sort('name')
    res.send(Users);
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email});
    if(user) return res.status(400).send('User already registered');

    user = new User({
        name: req.body.name,
        isAdmin: req.body.isAdmin,
        email: req.body.email,
        password: req.body.password
    });
    await user.save();

    res.send(user);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        isAdmin: req.body.isAdmin,
        email: req.body.email,
        password: req.body.password
    }, { new: true });

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

module.exports = router;*/

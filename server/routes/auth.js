const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details.map((e) => e.message).join(", "));
  }
  //if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send({ token });
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email().messages({
      "string.base": `"email" should be a string`,
      "string.empty": `"email" cannot be empty`,
      "string.min": `"email" should have a minimum length of {#limit}`,
      "string.max": `"email" should have a maximum length of {#limit}`,
      "string.email": `"email" must be a valid email address`,
      "any.required": `"email" is required`,
    }),
    password: Joi.string().min(5).max(255).required().messages({
      "string.base": `"password" should be a string`,
      "string.empty": `"password" cannot be empty`,
      "string.min": `"password" should have a minimum length of {#limit}`,
      "string.max": `"password" should have a maximum length of {#limit}`,
      "any.required": `"password" is required`,
    }),
  });

  return schema.validate(req, { abortEarly: false });
}

module.exports = router;

/*const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;*/

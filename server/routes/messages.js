const express = require("express");
const { Message, validateMessage } = require("../models/message");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Build the document, including optional fields only if provided
  const doc = {
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  };
  if (req.body.gameName) doc.gameName = req.body.gameName;
  if (req.body.code) doc.code = req.body.code;

  let message = new Message(doc);

  message = await message.save();
  res.send(message);
});

module.exports = router;

const express = require("express");
const { Message, validateMessage } = require("../models/message");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validateMessage(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let message = new Message({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
  });

  message = await message.save();
  res.send(message);
});

module.exports = router;

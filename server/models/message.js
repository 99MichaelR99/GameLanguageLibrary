const mongoose = require("mongoose");
const Joi = require("joi");

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
  },
  message: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 2000,
  },
  // Optional fields when the user chooses to provide game info
  gameName: { type: String, minlength: 1, maxlength: 100, trim: true },
  code: { type: String, minlength: 1, maxlength: 100, trim: true },
});

const Message = mongoose.model("Message", messageSchema);

function validateMessage(message) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    message: Joi.string().min(10).max(2000).required(),
    // Accept optional game info keys when present (empty string allowed from UI)
    gameName: Joi.string().allow("").max(100).optional(),
    code: Joi.string().allow("").max(100).optional(),
  });

  return schema.validate(message);
}

module.exports = { Message, validateMessage };

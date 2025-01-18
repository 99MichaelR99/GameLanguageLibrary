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
});

const Message = mongoose.model("Message", messageSchema);

function validateMessage(message) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().min(5).max(255).required(),
    message: Joi.string().min(10).max(2000).required(),
  });

  return schema.validate(message);
}

module.exports = { Message, validateMessage };

const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const languagesEnum = [
  "Arabic",
  "Chinese",
  "Czech",
  "Dutch",
  "English",
  "French",
  "German",
  "Italian",
  "Japanese",
  "Korean",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
  "Other",
];

const platformsEnum = ["PSP", "PSVITA", "PS1", "PS2", "PS3", "PS4", "PS5"];

const versionSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: platformsEnum,
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    set: (value) => value.replace(/\s+/g, "_"), // Normalize spaces to underscores
    match: /^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/, // Regex for code format
  },
  voiceLanguages: {
    type: [String],
    required: true,
    enum: languagesEnum,
  },
  subtitlesLanguages: {
    type: [String],
    required: true,
    enum: languagesEnum,
  },
});

const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    version: versionSchema,
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  })
);

function validatePost(post) {
  const schema = Joi.object({
    createdBy: Joi.objectId().required(),
    gameName: Joi.string().min(2).max(50).required(),
    version: Joi.object({
      platform: Joi.string()
        .valid(...platformsEnum)
        .required(),
      code: Joi.string()
        .pattern(/^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/)
        .required(),
      voiceLanguages: Joi.array()
        .items(Joi.string().valid(...languagesEnum))
        .required(),
      subtitlesLanguages: Joi.array()
        .items(Joi.string().valid(...languagesEnum))
        .required(),
    }).required(),
  });

  return schema.validate(post);
}

exports.Post = Post;
exports.validate = validatePost;

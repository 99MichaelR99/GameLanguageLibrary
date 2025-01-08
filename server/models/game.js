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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: platformsEnum,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    set: (value) => value.replace(/\s+/g, "_"), // Normalize spaces to underscores
    match: /^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/,
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
  isOfficial: {
    type: Boolean,
    default: false,
  },
});

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  versions: [versionSchema],
});

const Game = mongoose.model("Game", gameSchema);

function validateGame(game) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    versions: Joi.array()
      .items(
        Joi.object({
          createdBy: Joi.objectId().required(),
          platform: Joi.string()
            .valid(...platformsEnum)
            .required(),
          code: Joi.string()
            .required()
            .uppercase()
            .pattern(/^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/),
          voiceLanguages: Joi.array()
            .items(Joi.string().valid(...languagesEnum))
            .required(),
          subtitlesLanguages: Joi.array()
            .items(Joi.string().valid(...languagesEnum))
            .required(),
          isOfficial: Joi.boolean(),
        })
      )
      .required(),
  });

  return schema.validate(game);
}

function validateVersion(version) {
  const schema = Joi.object({
    createdBy: Joi.objectId().required(),
    platform: Joi.string()
      .valid(...platformsEnum)
      .required(),
    code: Joi.string()
      .required()
      .uppercase()
      .pattern(/^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/),
    voiceLanguages: Joi.array()
      .items(Joi.string().valid(...languagesEnum))
      .required(),
    subtitlesLanguages: Joi.array()
      .items(Joi.string().valid(...languagesEnum))
      .required(),
    isOfficial: Joi.boolean(),
  });

  return schema.validate(version);
}

module.exports = {
  Game,
  validateGame,
  validateVersion,
};

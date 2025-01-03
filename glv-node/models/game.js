const mongoose = require("mongoose");
const Joi = require("joi");

const languagesEnum = [
  "Arabic",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Croatian",
  "Czech",
  "Dutch",
  "English",
  "French (France)",
  "German",
  "Greek",
  "Hungarian",
  "Italian",
  "Japanese",
  "Korean",
  "Polish",
  "Portuguese (Brazil)",
  "Portuguese (Portugal)",
  "Russian",
  "Spanish",
  "Thai",
  "Turkish",
  "Other",
];

const versionSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  platform: {
    type: String,
    required: true,
    enum: ["PSP", "PSVITA", "PS1", "PS2", "PS3", "PS4", "PS5"],
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
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
  isOfficial: Boolean,
});

const Game = mongoose.model(
  "Game",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    versions: [versionSchema],
  })
);

/*const games = [
    { id: 418535, code: "CUSA_18535", name: 'AC Valhalla'    , platform: 'PS4', language: 'RUS'},  
    { id: 503846, code: "PPSA_03846", name: 'Dead Space'     , platform: 'PS5', language: 'ENG'},  
    { id: 301585, code: "BCES_01585", name: 'The last of us' , platform: 'PS3', language: 'RUS'},  
];*/

function validateGame(game) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    versions: Joi.array()
      .items(
        Joi.object({
          createdBy: Joi.objectId().required(),
          platform: Joi.string().required(),
          code: Joi.string().required(),
          voiceLanguages: Joi.array().items(Joi.string()).required(),
          subtitlesLanguages: Joi.array().items(Joi.string()).required(),
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
    platform: Joi.string().required(),
    code: Joi.string().required(),
    voiceLanguages: Joi.array().items(Joi.string()).required(),
    subtitlesLanguages: Joi.array().items(Joi.string()).required(),
    isOfficial: Joi.boolean(),
  });

  return schema.validate(version);
}

/*function hashCodeToID(code, platform) {
    if(platform === "PSVita" || platform === "PSP")
        platform = "PS99";
    return parseInt(platform.sice(2) + code.slice(5));
}*/

exports.Game = Game;
exports.validateGame = validateGame;
exports.validateVersion = validateVersion;

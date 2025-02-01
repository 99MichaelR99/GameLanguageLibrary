const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const reactionTypesEnum = ["like", "dislike"];

const Reaction = mongoose.model(
  "Reaction",
  new mongoose.Schema(
    {
      postID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      type: {
        type: String,
        required: true,
        enum: reactionTypesEnum,
      },
      createdAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  )
);

// Ensure a user can only have one reaction per post
Reaction.schema.index({ postID: 1, userID: 1 }, { unique: true });

function validateReaction(reaction) {
  const schema = Joi.object({
    reactionType: Joi.string()
      .valid(...reactionTypesEnum)
      .required(),
  });

  return schema.validate(reaction);
}

/*function validateReaction(reaction) {
  const schema = Joi.object({
    postID: Joi.objectId().required(),
    userID: Joi.objectId().required(),
    reactionType: Joi.string()
      .valid(...reactionTypesEnum)
      .required(),
  });

  return schema.validate(reaction);
}*/

exports.Reaction = Reaction;
exports.validate = validateReaction;

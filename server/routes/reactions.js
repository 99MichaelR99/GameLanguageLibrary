const auth = require("../middleware/auth");
const { Reaction, validate } = require("../models/reaction");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

// Get reactions for a specific post
router.get("/post/:postID", auth, async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);
  const userID = req.user ? req.user._id : null;

  // Get total counts for likes and dislikes
  const reactions = await Reaction.aggregate([
    { $match: { postID: postID } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  // Format the counts
  const counts = {
    likes: 0,
    dislikes: 0,
    userReaction: null,
  };

  reactions.forEach((reaction) => {
    counts[reaction._id + "s"] = reaction.count;
  });

  // If user is authenticated, get their reaction
  if (userID) {
    const userReaction = await Reaction.findOne({ postID, userID });
    if (userReaction) {
      counts.userReaction = userReaction.type;
    }
  }

  res.send(counts);
});

// Add or update a reaction
router.post("/post/:postID", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const postID = new mongoose.Types.ObjectId(req.params.postID);
  const userID = req.user._id;
  const { reactionType } = req.body;

  // Find existing reaction
  let reaction = await Reaction.findOne({ postID, userID });

  if (reaction) {
    // If same reaction type, remove it (toggle off)
    if (reaction.type === reactionType) {
      await reaction.deleteOne();
      return res.send({ message: "Reaction removed" });
    }

    // Update existing reaction
    reaction.type = reactionType;
    reaction = await reaction.save();
  } else {
    // Create new reaction
    reaction = new Reaction({
      postID,
      userID,
      type: reactionType,
    });
    await reaction.save();
  }

  // Get updated counts
  const counts = await getReactionCounts(postID, userID);
  res.send(counts);
});

// Get reaction statistics for a post
router.get("/stats/:postID", auth, async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);

  const stats = await Reaction.aggregate([
    { $match: { postID: postID } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        users: { $push: "$userID" },
      },
    },
  ]);

  res.send(stats);
});

router.delete("/post/:postID", async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);
  // Delete all reactions associated with that post
  await Reaction.deleteMany({ postID });
  res.send({ message: "Reactions deleted" });
});

// Helper function to get reaction counts
async function getReactionCounts(postID, userID) {
  const reactions = await Reaction.aggregate([
    { $match: { postID: postID } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    likes: 0,
    dislikes: 0,
    userReaction: null,
  };

  reactions.forEach((reaction) => {
    counts[reaction._id + "s"] = reaction.count;
  });

  if (userID) {
    const userReaction = await Reaction.findOne({ postID, userID });
    if (userReaction) {
      counts.userReaction = userReaction.type;
    }
  }

  return counts;
}

module.exports = router;

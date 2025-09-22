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

// GET /api/reactions/post/:postID/exists  -> { exists: true|false }
router.get("/post/:postID/exists", auth, async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);
  const exists = await Reaction.exists({ postID });
  res.json({ exists: !!exists });
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

      // Return the updated counts and a message after removal
      const counts = await getReactionCounts(postID, userID);

      // Ensure counts have the expected structure
      counts.likes = counts.likes || 0;
      counts.dislikes = counts.dislikes || 0;
      counts.userReaction = counts.userReaction || null;

      return res.send({
        message: "Reaction removed",
        ...counts, // Spread the counts object directly in the response
      });
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

router.get("/stats/:postID", auth, async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);

  // Aggregate to get likes and dislikes counts
  const stats = await Reaction.aggregate([
    { $match: { postID: postID } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        //users: { $push: "$userID" },
      },
    },
    {
      $project: {
        _id: 0, // Exclude the _id field
        type: "$_id", // Rename _id to 'type'
        count: 1,
      },
    },
  ]);

  // Use reduce to populate reactionCounts in a cleaner way
  const reactionCounts = stats.reduce(
    (acc, { type, count }) => {
      if (type === "like") {
        acc.likes = count;
      } else if (type === "dislike") {
        acc.dislikes = count;
      }
      return acc;
    },
    { likes: 0, dislikes: 0 }
  );

  res.send(reactionCounts);
  //res.send(stats);
});

router.delete("/post/:postID", async (req, res) => {
  const postID = new mongoose.Types.ObjectId(req.params.postID);
  const reactions = await Reaction.find({ postID });

  if (reactions.length === 0) {
    return res
      .status(404)
      .send({ message: "No reactions found for this post" });
  }

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

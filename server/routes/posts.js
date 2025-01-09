const auth = require("../middleware/auth");
const { Post, validate } = require("../models/post");
const { Game } = require("../models/game");
const express = require("express");
const router = express.Router();

// Get all posts
router.get("/", async (req, res) => {
  const posts = await Post.find().sort("-date");
  res.send(posts);
});

// Get post by ID
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post)
    return res.status(404).send("The post with the given ID was not found.");

  res.send(post);
});

// Create a new post
router.post("/", auth, async (req, res) => {
  // Validate the request body
  console.log("req:", req.body);
  const { error } = validate(req.body);
  console.log("error:", error);
  if (error) return res.status(400).send(error.details[0].message);

  // Create a new post document
  const post = new Post(req.body);

  console.log("post:", post);

  // Save the post
  const savedPost = await post.save();
  console.log("savedPost:", savedPost);
  res.send(savedPost);
});

// Update an existing post
router.put("/:id", auth, async (req, res) => {
  // Validate the request body
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Find the post by ID
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      gameName: req.body.gameName,
      platform: req.body.platform,
      code: req.body.code,
      voiceLanguages: req.body.voiceLanguages,
      subtitlesLanguages: req.body.subtitlesLanguages,
    },
    { new: true } // Return the updated post
  );

  if (!post)
    return res.status(404).send("The post with the given ID was not found.");

  res.send(post);
});

// Delete a post
router.delete("/:id", auth, async (req, res) => {
  // Find the post by ID and delete it
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post)
    return res.status(404).send("The post with the given ID was not found.");

  res.send(post);
});

module.exports = router;

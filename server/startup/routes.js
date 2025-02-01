const express = require("express");
const games = require("../routes/games");
const users = require("../routes/users");
const posts = require("../routes/posts");
const auth = require("../routes/auth");
const messages = require("../routes/messages");
const reactions = require("../routes/reactions");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(express.static("public"));
  app.use("/api/games", games);
  app.use("/api/posts", posts);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/messages", messages);
  app.use("/api/reactions", reactions);
  app.use(error);
};

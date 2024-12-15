const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Post, validate} = require('../models/post'); 
const {Game} = require('../models/game'); 
const {User} = require('../models/user'); 
const mongoose = require('mongoose');
//const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

// Initialize Fawn
//Fawn.init('mongodb://localhost/GameLanguageVerify');

router.get('/', async (req, res) => {
  const posts = await Post.find().sort('-date');
  res.send(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  
  res.send(post);
});

router.post('/', auth, async (req, res) => {
  // Validate the request body
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the user by ID
    const user = await User.findById(req.body.userID);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).send('Invalid user.');
    }
    // Extract game name and version details from the request body
    const { gameName, version } = req.body;

    const finalVersion = {
      createdBy: user._id,
      isOfficial: user.isAdmin,
      platform: version.platform,
      code: version.code,
      voiceLanguages: version.voiceLanguages,
      subtitlesLanguages: version.subtitlesLanguages
    };
    
    // Find the existing game by name or create a new one
    let game = await Game.findOneAndUpdate(
      { name: gameName },
      { $push: { versions: finalVersion } },
      { upsert: true, new: true, session }
    );

    // Create a new post document
    const post = new Post({ 
      userID: user._id,
      gameName: gameName,
      versionID: game.versions[game.versions.length - 1]._id
    });

    // Save the post
    await post.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(201).send('Post created successfully');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
  }
});

/*router.post('/', async (req, res) => {
  // Validate the request body
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the user by ID
    const user = await User.findById(req.body.userID);
    if (!user) return res.status(400).send('Invalid user.');
    
    // Extract game name and version details from the request body
    const { gameName, version } = req.body;

    const finalVersion = {
          createdBy: user._id,
          isOfficial: user.isAdmin,
          platform: version.platform,
          code: version.code,
          voiceLanguages: version.voiceLanguages,
          subtitlesLanguages: version.subtitlesLanguages
    };
    
    // Start a Fawn task
    const task = new Fawn.Task();
    
    // Find the existing game by name
    const existingGame = await Game.findOne({ name: gameName });

    if (existingGame) {
      if(existingGame.versions.some(currVersion => currVersion.code === finalVersion.code))
        return res.status(400).send('Version with that Code already exists');
      
      // If the game already exists, push the new version to its versions array
      task.update('games', { _id: existingGame._id }, { $push: { versions: finalVersion } });
    } else {
      // If the game doesn't exist, create a new game with the provided name and version
      task.save('games', new Game({ name: gameName, versions: [finalVersion] }));
    }
    
    // Create a new post document (Second phase of the transaction)
    task.save('posts', new Post({ 
      userID: user._id,
      gameName: gameName,
      versionID: existingGame ? existingGame.versions[existingGame.versions.length - 1]._id : savedGame.versions[0]._id
    }));
    
    // Execute the transaction
    await task.run();
    
    // Send success response
    res.status(201).send('Post created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});*/
  

/*router.post('/', async (req, res) => {
  const { error } = validate(req.body); 
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.userID);
  if (!user) return res.status(400).send('Invalid user.');

  const game = await Game.findOne(req.body.gameName);
  if (!game) return res.status(400).send('Invalid game.');

  const version = await game.versions.findById(req.body.versionID);
  if (!version) return res.status(400).send('Invalid version.');
version
  let post = new Post({ 
    userID: user._id,
    gameName: game.name,
    versionID: version._id
  });
  post = await post.save();
  
  res.send(post);
});*/

module.exports = router; 
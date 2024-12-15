const mongoose = require('mongoose');
const Joi = require('joi');
//const { post } = require('../routes/posts');

const Post = mongoose.model('Post', new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gameName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    versionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version'
    }, //versionID maybe not enough, need full version in the future.
    date: {
        type: Date,
        require: true,
        default: Date.now
    }
}));

function validatePost(post) {
    const schema = {
        userID: Joi.objectId().required(),
        gameName: Joi.string().min(3).max(50).required(),
        version: Joi.object({
            platform: Joi.string().required(),
            code: Joi.string().required(),
            voiceLanguages: Joi.array().items(Joi.string()).required(),
            subtitlesLanguages: Joi.array().items(Joi.string()).required()
        }).required()
    };
      
    return Joi.validate(post, schema);
}

exports.Post = Post;
exports.validate = validatePost;
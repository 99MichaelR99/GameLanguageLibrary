const winston = require('winston');
const { Console } = require('winston/lib/winston/transports');

module.exports = function(err, req, res, next){
  winston.error(err.message, err);
  //console.error(err.message, err); //delete in future

  // error
  // warn
  // info
  // verbose
  // debug 
  // silly

  // Check if the error is a duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(400).send('A version with the same code already exists.');
  }

  res.status(500).send('Something failed.');
}
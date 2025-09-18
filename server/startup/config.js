const config = require("config");

module.exports = function () {
  const jwtKey =
    process.env.JWT_PRIVATE_KEY ||
    (config.has("jwtPrivateKey") ? config.get("jwtPrivateKey") : null);

  if (!jwtKey) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
};

/*module.exports = function() {
  if (!config.get('jwtPrivateKey')) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}*/

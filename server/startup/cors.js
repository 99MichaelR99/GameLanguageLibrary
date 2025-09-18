const cors = require("cors");

module.exports = function (app) {
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://99MichaelR99.github.io",
        "https://99MichaelR99.github.io/GameLanguageLibrary",
      ],
      credentials: true,
    })
  );
};

/*module.exports = function (app) {
  app.use(cors());
};*/

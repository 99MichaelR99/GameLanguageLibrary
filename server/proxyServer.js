require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
let ACCESS_TOKEN = "";

const getAccessToken = async () => {
  try {
    const { data } = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "client_credentials",
        },
      }
    );
    ACCESS_TOKEN = data.access_token;
    console.log("New Access Token:", ACCESS_TOKEN);
  } catch (error) {
    console.error(
      "Error fetching access token:",
      error.response?.data || error
    );
  }
};

// Fetch token at startup
getAccessToken();

app.post("/api/igdb/games", async (req, res) => {
  try {
    const { gameName } = req.body;
    console.log(`Searching for game: ${gameName}`);

    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: "Missing IGDB access token" });
    }

    const { data } = await axios.post(
      "https://api.igdb.com/v4/games",
      `search "${gameName}"; fields id, name, cover.image_id;`,
      {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "text/plain",
        },
      }
    );

    res.json(data);
  } catch (error) {
    console.error("Error fetching IGDB data:", error.response?.data || error);
    res.status(500).json({ error: "Failed to fetch IGDB data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));

import http from "./httpService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/games";

function gameUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getGames() {
  const games = http.get(apiEndpoint);
  return games;
}

export function getGame(gameID) {
  return http.get(gameUrl(gameID));
}

// Function to check if a game with the same name already exists
export function getGameByName(gameName) {
  return http.get(`${apiEndpoint}/name?name=${gameName}`);
}

export async function saveGame(game) {
  let { gameID, versionID, ...body } = game;
  const newVersion = {
    createdBy: "66197c1be429d0dee2322c50",
    isOfficial: false,
    platform: body.platform.toUpperCase(),
    code: body.code,
    voiceLanguages: body.voiceLanguages,
    subtitlesLanguages: body.subtitlesLanguages,
  };
  const dbGame = {
    name: body.gameName,
    versions: [newVersion],
  };

  if (gameID && versionID) {
    console.log(`${gameUrl(gameID)}/${versionID}`);
    return http.put(`${gameUrl(gameID)}/${versionID}`, newVersion);
  } else if (gameID) return http.post(`${gameUrl(gameID)}`, newVersion);

  let existingGame;
  try {
    existingGame = await getGameByName(body.gameName);
  } catch (error) {
    // If the error is not a 404, rethrow it
    if (!error.response || error.response.status !== 404) {
      console.error("Error during game lookup:", error);
      throw error;
    }
  }

  if (existingGame?.data) {
    // If the game exists, update it
    gameID = existingGame.data._id;
    return http.post(`${gameUrl(gameID)}`, newVersion);
  }

  // If the game doesn't exist (caught error or no data), create a new one
  return http.post(apiEndpoint, dbGame);
}

export function deleteGame(gameID, versionID) {
  return http.delete(gameUrl(gameID) + "/" + versionID);
}

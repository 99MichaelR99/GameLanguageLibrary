import http from "./httpService";
import auth from "./authService";

const apiEndpoint = "/games";

function gameUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getGames() {
  return http.get(apiEndpoint);
}

export function getGame(gameID) {
  return http.get(gameUrl(gameID));
}

export function getGameByName(gameName) {
  return http.get(`${apiEndpoint}/name`, { params: { name: gameName } });
}

export async function saveGame(game) {
  let { gameID, versionID, ...body } = game;

  const currentUser = auth.getCurrentUser();
  if (!currentUser || !currentUser.isAdmin || !currentUser._id) {
    throw new Error("User must be an Admin to save a game.");
  }

  const newVersion = {
    createdBy: currentUser._id,
    isOfficial: game.isOfficial || false,
    platform: body.platform.toUpperCase(),
    code: body.code.replace(/_/g, " ").toUpperCase(),
    voiceLanguages: body.voiceLanguages.sort(),
    subtitlesLanguages: body.subtitlesLanguages.sort(),
  };

  if (gameID && versionID)
    return http.put(`${gameUrl(gameID)}/${versionID}`, newVersion);
  if (gameID) return http.post(gameUrl(gameID), newVersion);

  // If no gameID, try to find by name
  let existingGame;
  try {
    existingGame = await getGameByName(body.gameName);
  } catch (error) {
    if (!error.response || error.response.status !== 404) throw error;
  }

  if (existingGame?.data) {
    gameID = existingGame.data._id;
    return http.post(gameUrl(gameID), newVersion);
  }

  const dbGame = {
    name: body.gameName,
    versions: [newVersion],
  };

  return http.post(apiEndpoint, dbGame);
}

export function deleteGame(gameID, versionID) {
  return http.delete(`${gameUrl(gameID)}/${versionID}`);
}

/*import http from "./httpService";
import auth from "../services/authService";
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

  const currentUser = auth.getCurrentUser();
  if (!currentUser || !currentUser.isAdmin || !currentUser._id) {
    throw new Error("User must be an Admin to save a game.");
  }
  const newVersion = {
    createdBy: currentUser._id, // currently only admin id is saved even if a user created a post and admin relesed it
    isOfficial: game.isOfficial || false,
    platform: body.platform.toUpperCase(),
    code: body.code.replace(/_/g, " ").toUpperCase(),
    voiceLanguages: body.voiceLanguages.sort(),
    subtitlesLanguages: body.subtitlesLanguages.sort(),
  };

  if (gameID && versionID) {
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

  const dbGame = {
    name: body.gameName,
    versions: [newVersion],
  };

  // If the game doesn't exist (caught error or no data), create a new one
  return http.post(apiEndpoint, dbGame);
}

export function deleteGame(gameID, versionID) {
  return http.delete(gameUrl(gameID) + "/" + versionID);
}*/

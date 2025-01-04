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

  if (gameID && versionID)
    return http.put(`${gameUrl(gameID)}/${versionID}`, dbGame);
  else if (gameID) return http.post(`${gameUrl(gameID)}`, newVersion); //I think that case never executed

  try {
    // Use await to get the existing game by name
    const existingGame = await getGameByName(body.gameName);

    // If the game exists, use its gameID to update, otherwise create a new game
    gameID = existingGame.data._id;
    if (gameID) return http.post(`${gameUrl(gameID)}`, newVersion);
    else return http.post(apiEndpoint, dbGame);
  } catch (error) {
    console.error("Error during save game:", error);
    throw error; // Rethrow or handle the error as needed
  }

  //return http.post(apiEndpoint, dbGame);
}

export function deleteGame(gameID, versionID) {
  return http.delete(gameUrl(gameID) + "/" + versionID);
}

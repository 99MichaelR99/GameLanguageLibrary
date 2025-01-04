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

export function saveGame(game) {
  const { gameID, versionID, ...body } = game;
  const dbGame = {
    name: body.gameName,
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        isOfficial: false,
        platform: body.platform.toUpperCase(),
        code: body.code,
        voiceLanguages: body.voiceLanguages,
        subtitlesLanguages: body.subtitlesLanguages,
      },
    ],
  };

  if (gameID) {
    const url = versionID
      ? `${gameUrl(gameID)}/${versionID}`
      : `${gameUrl(gameID)}`;
    return http.put(url, dbGame);
  }
  return http.post(apiEndpoint, dbGame);
}

export function deleteGame(gameID, versionID) {
  return http.delete(gameUrl(gameID) + "/" + versionID);
}

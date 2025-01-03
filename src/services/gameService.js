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
  const { gameID, _id, ...body } = game;

  if (gameID) {
    const url = _id ? `${gameUrl(gameID)}/${_id}` : `${gameUrl(gameID)}`;
    return http.put(url, body);
  }
  return http.post(apiEndpoint, body);
}

export function deleteGame(gameID, versionID) {
  return http.delete(gameUrl(gameID) + "/" + versionID);
}

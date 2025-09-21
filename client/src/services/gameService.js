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

// Exists check (always 200)
export function getGameByName(gameName) {
  return http.get(`${apiEndpoint}/exists`, { params: { name: gameName } });
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

  // If no gameID, try to find by name (no 404s now)
  const res = await getGameByName(body.gameName);

  if (res?.data?.exists && res.data._id) {
    gameID = res.data._id;
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

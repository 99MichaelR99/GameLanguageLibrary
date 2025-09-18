import http from "./httpService";
import { getGame } from "./gameService";

const apiEndpoint = "/users";

export function register(user) {
  return http.post(apiEndpoint, {
    name: user.name,
    email: user.email,
    password: user.password,
  });
}

export function updateProfile(user) {
  return http.put(`${apiEndpoint}/me`, {
    name: user.name,
    email: user.email,
    oldPassword: user.oldPassword,
    newPassword: user.newPassword,
  });
}

const transformData = (allGames) => {
  const games = Array.isArray(allGames) ? allGames : [allGames];
  return games.flatMap((game) =>
    game.versions.map((version) => ({
      name: game.name,
      gameID: game._id,
      ...version,
    }))
  );
};

export async function getFavorites() {
  try {
    const favorites = await http.get(`${apiEndpoint}/me/favorites`);
    const withDetails = await Promise.all(
      favorites.data.map(async (fav) => {
        const gameData = await getGame(fav.gameID);
        const fameData = transformData(gameData.data);
        return { ...fav, ...fameData[0] };
      })
    );
    return withDetails;
  } catch (error) {
    console.error("Error fetching favorite games:", error);
    return [];
  }
}

export async function addFavorite(gameID, versionID) {
  await http.put(`${apiEndpoint}/me/favorites`, { gameID, versionID });
  const gameData = await getGame(gameID);
  return { gameID, versionID, gameData };
}

export async function removeFavorite(gameID, versionID) {
  await http.delete(`${apiEndpoint}/me/favorites/${gameID}/${versionID}`);
  return { gameID, versionID };
}

/*import http from "./httpService";
import config from "../config.json";
import { getGame } from "./gameService";

const apiEndpoint = config.apiUrl + "/users";

// Register new user
export function register(user) {
  return http.post(apiEndpoint, {
    name: user.name,
    email: user.email,
    password: user.password,
  });
}

// Update the current user's profile
export function updateProfile(user) {
  return http.put(apiEndpoint + "/me", {
    name: user.name,
    email: user.email,
    oldPassword: user.oldPassword,
    newPassword: user.newPassword,
  });
}

const transformData = (allGames) => {
  // Ensure that the game data is an array (in case there is just one version)
  const games = Array.isArray(allGames) ? allGames : [allGames];

  return games.flatMap((game) =>
    game.versions.map((version) => ({
      name: game.name,
      gameID: game._id,
      ...version,
    }))
  );
};

// Get the current user's favorite games with full game data
export async function getFavorites(userID) {
  try {
    if (!userID) throw new Error("User is not authenticated");
    const favorites = await http.get(`${apiEndpoint}/me/favorites`);

    // Fetch game details for each favorite game and add the full data to the favorite
    const favoriteGamesWithDetails = await Promise.all(
      favorites.data.map(async (fav) => {
        const gameData = await getGame(fav.gameID); // Fetch game details using the gameID
        const fameData = transformData(gameData.data);
        return { ...fav, ...fameData[0] }; // Merge the game data with the favorite entry
      })
    );

    return favoriteGamesWithDetails;
  } catch (error) {
    console.error("Error fetching favorite games:", error);
    return [];
  }
}

// Add a game to the current user's favorites with full game data
export async function addFavorite(gameID, versionID) {
  try {
    await http.put(`${apiEndpoint}/me/favorites`, { gameID, versionID });

    // Fetch the full game data after adding it to favorites
    const gameData = await getGame(gameID);

    // Return the updated favorite with full game data
    return { gameID, versionID, gameData };
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
}

// Remove a game from the current user's favorites
export async function removeFavorite(gameID, versionID) {
  try {
    await http.delete(`${apiEndpoint}/me/favorites/${gameID}/${versionID}`);

    // Return the gameID and versionID after removal
    return { gameID, versionID };
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
}*/

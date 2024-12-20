const games = [
  {
    _id: "6640c5fa93bf8e827945609a",
    name: "Deathloop",
    liked: true,
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "PPSA_01670",
        voiceLanguages: ["English", "Russian"],
        subtitlesLanguages: ["English", "Russian"],
        isOfficial: true,
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "PPSA_01668",
        voiceLanguages: ["English", "Polish"],
        subtitlesLanguages: ["English", "Polish"],
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "PPSA_01671",
        voiceLanguages: ["English", "German"],
        subtitlesLanguages: ["English", "German"],
        isOfficial: true,
      },
    ],
  },
  {
    _id: "6640e4f4503ee6a08dadebd6",
    name: "Deathloop2",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "PPSA_01673",
        voiceLanguages: ["English", "Russian"],
        subtitlesLanguages: ["English", "Russian"],
        isOfficial: true,
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "PPSA_01669",
        voiceLanguages: ["English", "Polish"],
        subtitlesLanguages: ["English", "Polish"],
      },
    ],
  },
  {
    _id: "6640a7f8603de9f12bc4c1a1",
    name: "Wasteland 2: Director's Cut",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_03144",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
  {
    _id: "6640b9d4613de7f3acd2b0b2",
    name: "Watch Dogs",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_00016",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
  {
    _id: "6640d8a1523ee4c8ada3e3b3",
    name: "Watch Dogs 2",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_04295",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_04294",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      },
    ],
  },
  {
    _id: "6640f4a6623ef2e9ada2e3c4",
    name: "Watch Dogs Legion",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "13035",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS5",
        code: "13034",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      },
    ],
  },
  {
    _id: "6640e7f4623ed1e8acd2f3d5",
    name: "Wipeout Omega Collection",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_05670",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
  {
    _id: "6640f9c473ed0e9ada3e4e6",
    name: "Wolfenstein: Youngblood",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_13094",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
  {
    _id: "6640fab483edd0eaadf3f4f7",
    name: "Wolfenstein: The New Order",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_00320",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["Russian"],
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_00314",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      },
    ],
  },
  {
    _id: "6640e4a853ed1ee9ada2f3d8",
    name: "Wolfenstein: The Old Blood",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_01604",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
  {
    _id: "6640facb53edd0ecada4f5f9",
    name: "Wolfenstein: The New Colossus",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_07378",
        voiceLanguages: ["Russian"],
        subtitlesLanguages: ["Russian"],
      },
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_07377",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["English"],
      },
    ],
  },
  {
    _id: "6640fceb53edf0edada5f7fa",
    name: "Wreckfest",
    versions: [
      {
        createdBy: "66197c1be429d0dee2322c50",
        platform: "PS4",
        code: "CUSA_08652",
        voiceLanguages: ["English"],
        subtitlesLanguages: ["Russian"],
      },
    ],
  },
];

export function getGames() {
  return games;
}

export function getGame(id) {
  return games.find((game) => game._id === id);
}

export function saveGame(game) {
  // Validate the game data
  if (
    !game.name ||
    typeof game.name !== "string" ||
    game.name.length < 3 ||
    game.name.length > 50
  ) {
    throw new Error(
      "Invalid game: 'name' must be a string between 3 and 50 characters."
    );
  }

  // Ensure the game data has a valid structure for versions
  if (!Array.isArray(game.versions) || game.versions.length === 0) {
    throw new Error("Invalid game: 'versions' must be a non-empty array.");
  }

  // Prepare the 'versions' array by mapping over the 'data' object
  const versions = game.versions.map((version) => {
    if (!version.platform || typeof version.platform !== "string") {
      throw new Error("Invalid version: 'platform' must be a valid string.");
    }

    if (!version.code || typeof version.code !== "string") {
      throw new Error("Invalid version: 'code' must be a valid string.");
    }

    if (
      !Array.isArray(version.voiceLanguages) ||
      !version.voiceLanguages.every((lang) => typeof lang === "string")
    ) {
      throw new Error(
        "Invalid version: 'voiceLanguages' must be an array of strings."
      );
    }

    if (
      !Array.isArray(version.subtitlesLanguages) ||
      !version.subtitlesLanguages.every((lang) => typeof lang === "string")
    ) {
      throw new Error(
        "Invalid version: 'subtitlesLanguages' must be an array of strings."
      );
    }

    // Validate isOfficial (if defined)
    if (
      version.isOfficial !== undefined &&
      typeof version.isOfficial !== "boolean"
    ) {
      throw new Error(
        "Invalid version: 'isOfficial' must be a boolean if defined."
      );
    }

    // Return the formatted version object
    return {
      createdBy: "66197c1be429d0dee2322c50", // Assuming the createdBy is constant, or modify it accordingly
      platform: version.platform,
      code: version.code,
      voiceLanguages: version.voiceLanguages,
      subtitlesLanguages: version.subtitlesLanguages,
      isOfficial: version.isOfficial || false, // Default to false if undefined
    };
  });

  // Create or update the game in the database
  let gameInDb = games.find((g) => g._id === game._id) || {};

  gameInDb.name = game.name;
  gameInDb.versions = versions;

  // If the game doesn't exist in the database, add it
  if (!gameInDb._id) {
    gameInDb._id = Date.now().toString(); // Assign a unique ID
    games.push(gameInDb);
  }

  return gameInDb;
}

export function deleteGame(id) {
  const gameIndex = games.findIndex((game) => game._id === id);
  if (gameIndex === -1) return null;

  const [deletedGame] = games.splice(gameIndex, 1);
  return deletedGame;
}

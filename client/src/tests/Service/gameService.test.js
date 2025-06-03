import * as gameService from "../../services/gameService";
import httpService from "../../services/httpService";
import authService from "../../services/authService";
import config from "../../config.json";
import { toast } from "react-toastify";

jest.mock("../../services/httpService", () => ({
  post: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  setJwt: jest.fn(),
}));

jest.mock("../../services/authService");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("gameService", () => {
  const apiEndpoint = config.apiUrl + "/games";
  const tokenKey = "token";

  beforeEach(() => {
    jest.clearAllMocks();
    httpService.post.mockResolvedValue({});
    httpService.get.mockResolvedValue({});
    httpService.delete.mockResolvedValue({});
  });

  test("should fetch all games", async () => {
    const mockGames = [{ gameName: "Game 1" }, { gameName: "Game 2" }];
    httpService.get.mockResolvedValue(mockGames);

    const games = await gameService.getGames();

    expect(httpService.get).toHaveBeenCalledWith(apiEndpoint);
    expect(games).toEqual(mockGames);
  });

  test("should fetch a specific game by ID", async () => {
    const mockGame = { gameName: "Game 1", id: 1 };
    httpService.get.mockResolvedValue(mockGame);

    const game = await gameService.getGame(1);

    expect(httpService.get).toHaveBeenCalledWith(`${apiEndpoint}/1`);
    expect(game).toEqual(mockGame);
  });

  test("should check if a game by name already exists", async () => {
    const gameName = "Game 1";
    const mockResponse = { data: { _id: "123", gameName: "Game 1" } };

    httpService.get.mockResolvedValue(mockResponse);

    const game = await gameService.getGameByName(gameName);

    expect(httpService.get).toHaveBeenCalledWith(
      `${apiEndpoint}/name?name=${gameName}`
    );
    expect(game).toEqual(mockResponse);
  });

  test("should throw error if user is not an admin when saving a game", async () => {
    const mockGame = {
      gameID: undefined,
      versionID: undefined,
      gameName: "New Game",
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    const mockUser = { _id: "123", isAdmin: false };

    authService.getCurrentUser.mockReturnValue(mockUser);

    await expect(gameService.saveGame(mockGame)).rejects.toThrow(
      "User must be an Admin to save a game."
    );
  });

  test("should save a game and create a new game if the game doesn't exist", async () => {
    const mockGame = {
      gameID: undefined,
      versionID: undefined,
      gameName: "New Game",
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    const mockUser = { _id: "admin123", isAdmin: true };
    const mockVersion = {
      createdBy: mockUser._id,
      isOfficial: false,
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    // Mock the function to simulate no existing game
    httpService.get.mockRejectedValue({ response: { status: 404 } });
    httpService.post.mockResolvedValue({});

    await gameService.saveGame(mockGame);

    // Ensure the POST call to create a new game is made
    expect(httpService.post).toHaveBeenCalledWith(apiEndpoint, {
      name: mockGame.gameName,
      versions: [mockVersion],
    });
    expect(toast.success).toHaveBeenCalledWith("Game created successfully!");
  });

  test("should update an existing game if a game with the same name exists", async () => {
    const mockGame = {
      gameID: undefined,
      versionID: undefined,
      gameName: "Existing Game",
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    const mockUser = { _id: "admin123", isAdmin: true };
    const mockVersion = {
      createdBy: mockUser._id,
      isOfficial: false,
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    // Simulate that the game already exists and return its ID
    const mockExistingGame = {
      data: { _id: "existingGameID", gameName: "Existing Game" },
    };
    httpService.get.mockResolvedValue(mockExistingGame);

    httpService.post.mockResolvedValue({});

    await gameService.saveGame(mockGame);

    // Ensure the POST call is made to update the existing game
    expect(httpService.post).toHaveBeenCalledWith(
      `${apiEndpoint}/existingGameID`,
      { versions: [mockVersion] }
    );
    expect(toast.success).toHaveBeenCalledWith("Game updated successfully!");
  });

  test("should delete a game version", async () => {
    const gameID = 1;
    const versionID = 1;

    httpService.delete.mockResolvedValue({});

    await gameService.deleteGame(gameID, versionID);

    expect(httpService.delete).toHaveBeenCalledWith(`${apiEndpoint}/1/1`);
  });

  test("should handle blueprint post deletion after saving game", async () => {
    const mockGame = {
      gameID: 1,
      versionID: 1,
      gameName: "Game 1",
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    const mockUser = { _id: "admin123", isAdmin: true };
    const mockVersion = {
      createdBy: mockUser._id,
      isOfficial: false,
      platform: "PS5",
      code: "CODE 12345",
      voiceLanguages: ["English"],
      subtitlesLanguages: ["English"],
    };

    const blueprintPostID = "blueprint123";
    const mockDeletePostResponse = { status: 200 };

    authService.getCurrentUser.mockReturnValue(mockUser);

    httpService.get.mockRejectedValue({ response: { status: 404 } });
    httpService.post.mockResolvedValue({});

    // Mock deletePost function
    gameService.deletePost = jest
      .fn()
      .mockResolvedValue(mockDeletePostResponse);

    await gameService.saveGame({ ...mockGame, blueprintPostID });

    // Ensure deletePost is called with the correct blueprintPostID
    expect(gameService.deletePost).toHaveBeenCalledWith(blueprintPostID);
    expect(toast.info).toHaveBeenCalledWith("Original blueprint post deleted.");
  });
});

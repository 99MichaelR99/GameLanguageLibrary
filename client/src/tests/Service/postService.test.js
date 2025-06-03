import {
  getPosts,
  getPost,
  savePost,
  deletePost,
  checkIfPostExists,
} from "../../services/postService";
import httpService from "../../services/httpService";
import auth from "../../services/authService";

// Mocking necessary modules
jest.mock("../../services/httpService");
jest.mock("../../services/authService");

describe("postService", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test
  });

  test("should get all posts correctly", async () => {
    const posts = [{ _id: "1", gameName: "Game1" }];
    httpService.get.mockResolvedValue({ data: posts });

    const result = await getPosts();

    expect(httpService.get).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts"
    );
    expect(result.data).toEqual(posts);
  });

  test("should get a specific post correctly", async () => {
    const post = { _id: "1", gameName: "Game1" };
    httpService.get.mockResolvedValue({ data: post });

    const result = await getPost("1");

    expect(httpService.get).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts/1"
    );
    expect(result.data).toEqual(post);
  });

  test("should check if post exists (post exists)", async () => {
    const post = { _id: "1", gameName: "Game1" };
    httpService.get.mockResolvedValue({ data: post, status: 200 });

    const result = await checkIfPostExists("1");

    expect(httpService.get).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts/1"
    );
    expect(result).toBe(true); // Should return true
  });

  test("should check if post exists (post doesn't exist)", async () => {
    const errorResponse = {
      response: { status: 404 },
    };
    httpService.get.mockRejectedValue(errorResponse);

    const result = await checkIfPostExists("1");

    expect(httpService.get).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts/1"
    );
    expect(result).toBe(false);
  });

  test("should save a new post", async () => {
    const newPost = {
      gameName: "Game1",
      platform: "PS5",
      code: "GAME_12345", // Ensure this matches
      voiceLanguages: ["English"],
      subtitlesLanguages: ["Spanish"],
    };
    const currentUser = { _id: "user1" };
    auth.getCurrentUser.mockReturnValue(currentUser);
    httpService.post.mockResolvedValue({ data: { _id: "1", ...newPost } });

    const result = await savePost(newPost);

    expect(httpService.post).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts", // Ensure the URL matches
      {
        createdBy: "user1",
        ...newPost,
      }
    );
    expect(result.data).toEqual({ _id: "1", ...newPost });
  });

  test("should update an existing post", async () => {
    const updatedPost = {
      _id: "1",
      gameName: "Updated Game",
      platform: "PS4",
      code: "GAME_54321", // Ensure this matches
      voiceLanguages: ["English"],
      subtitlesLanguages: ["French"],
    };
    const currentUser = { _id: "user1" };
    auth.getCurrentUser.mockReturnValue(currentUser);
    httpService.put.mockResolvedValue({ data: updatedPost });

    const result = await savePost(updatedPost);

    expect(httpService.put).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts/1", // Ensure the URL is correct
      {
        createdBy: "user1",
        ...updatedPost,
      }
    );
    expect(result.data).toEqual(updatedPost);
  });

  test("should delete a post and its reactions", async () => {
    const postID = "1";
    httpService.delete.mockResolvedValue({});

    await deletePost(postID);

    expect(httpService.delete).toHaveBeenCalledWith(
      "http://localhost:3900/api/posts/1"
    );
    expect(httpService.delete).toHaveBeenCalledWith(
      "http://localhost:3900/api/reactions/post/1"
    );
  });
});

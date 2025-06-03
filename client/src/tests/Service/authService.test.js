import authService from "../../services/authService";
import httpService from "../../services/httpService";
import { jwtDecode } from "jwt-decode";

jest.mock("../../services/httpService");
jest.mock("jwt-decode");

describe("authService", () => {
  const tokenKey = "token";

  beforeEach(() => {
    // Mock localStorage methods
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    Storage.prototype.getItem = jest.fn(() => "fake-jwt-token");
    jest.clearAllMocks();

    // Mock console.error to track error logs
    console.error = jest.fn();
  });

  test("should log in and store the JWT token", async () => {
    const email = "test@example.com";
    const password = "password";
    const jwt = "fake-jwt-token";

    // Mock HTTP POST response
    httpService.post.mockResolvedValue({ data: jwt });

    // Act: Call the login method
    await authService.login(email, password);

    // Assert: Check that localStorage and HTTP service were set correctly
    expect(localStorage.setItem).toHaveBeenCalledWith(tokenKey, jwt);
    expect(httpService.setJwt).toHaveBeenCalledWith(jwt);
  });

  test("should log in with JWT and set the token in HTTP service", () => {
    const jwt = "fake-jwt-token";

    // Act: Call loginWithJwt method
    authService.loginWithJwt(jwt);

    // Assert: Check if JWT was saved in localStorage and HTTP service was updated
    expect(localStorage.setItem).toHaveBeenCalledWith(tokenKey, jwt);
    expect(httpService.setJwt).toHaveBeenCalledWith(jwt);
  });

  test("should log out and remove JWT token", () => {
    // Act: Call logout method
    authService.logout();

    // Assert: Check if JWT token was removed from localStorage and HTTP service
    expect(localStorage.removeItem).toHaveBeenCalledWith(tokenKey);
    expect(httpService.setJwt).toHaveBeenCalledWith(null);
  });

  test("should return the current user if JWT is valid", () => {
    const jwt = "fake-jwt-token";
    const decodedUser = { userId: 1, name: "Michael" };

    // Mocking jwtDecode to simulate decoding
    jwtDecode.mockReturnValue(decodedUser);

    // Mocking the getJwt function to return the JWT token
    jest.spyOn(authService, "getJwt").mockReturnValue(jwt);

    // Act: Call getCurrentUser
    const currentUser = authService.getCurrentUser();

    // Assert: Ensure the current user is returned after decoding the JWT
    expect(jwtDecode).toHaveBeenCalledWith(jwt);
    expect(currentUser).toEqual(decodedUser);
  });

  test("should return null if JWT is invalid or missing", () => {
    const invalidJwt = "invalid-jwt";

    // Mocking getJwt to return an invalid JWT
    jest.spyOn(authService, "getJwt").mockReturnValue(invalidJwt);

    // Mocking jwtDecode to throw an error for invalid JWT
    jwtDecode.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    // Act: Call getCurrentUser with an invalid JWT
    const currentUser = authService.getCurrentUser();

    // Assert: Ensure that the current user is null if JWT is invalid
    expect(currentUser).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error decoding JWT:",
      expect.any(Error)
    );
  });

  test("should return null if no JWT exists", () => {
    // Ensure localStorage.getItem returns null
    localStorage.getItem.mockReturnValue(null);

    // Act: Call getCurrentUser with no JWT
    const currentUser = authService.getCurrentUser();

    // Assert: Ensure that the current user is null if no JWT exists
    expect(currentUser).toBeNull();
  });

  test("should get the JWT token from localStorage", () => {
    const jwt = "fake-jwt-token";

    // Ensure no conflicting mocks exist
    jest.restoreAllMocks();

    // Properly mock localStorage.getItem
    jest.spyOn(Storage.prototype, "getItem").mockReturnValue(jwt);

    // Act: Call getJwt
    const token = authService.getJwt();

    // Assert: Ensure the token is retrieved from localStorage
    expect(token).toBe(jwt);
  });
});

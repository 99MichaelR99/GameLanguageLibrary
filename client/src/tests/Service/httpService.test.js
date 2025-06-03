import axios from "axios";
import httpService from "../../services/httpService";
import logger from "../../services/logService";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext"; // Adjust path as needed

// Mocking necessary modules
jest.mock("axios");
jest.mock("../../services/logService");
jest.mock("react-toastify", () => ({
  toast: { error: jest.fn() },
}));

jest.mock("../../context/authContext", () => {
  return {
    useAuth: jest.fn(() => ({ user: { name: "Michael" } })),
  };
});

describe("httpService", () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test
  });

  test("should call axios.get with correct URL", async () => {
    axios.get.mockResolvedValue({ data: { message: "Success" } });

    const result = await httpService.get("/test");

    expect(axios.get).toHaveBeenCalledWith("/test");
    expect(result.data).toEqual({ message: "Success" });
  });

  test("should call axios.post with correct URL and data", async () => {
    const payload = { name: "Michael" };
    axios.post.mockResolvedValue({ data: { id: 1, ...payload } });

    const result = await httpService.post("/users", payload);

    expect(axios.post).toHaveBeenCalledWith("/users", payload);
    expect(result.data).toEqual({ id: 1, name: "Michael" });
  });

  test("should handle 400-499 errors without logging or toasting", async () => {
    const errorResponse = {
      response: { status: 404, data: "Not Found" },
    };
    axios.get.mockRejectedValue(errorResponse);

    await expect(httpService.get("/invalid")).rejects.toEqual(errorResponse);

    expect(logger.log).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  /*test("should log and show toast on unexpected errors (500+)", async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: "Server Error",
      },
    };

    // Mock axios.get to reject with a 500 error
    axios.get.mockRejectedValue(errorResponse);

    // Call the actual service method and expect it to reject with the error
    await expect(httpService.get("/server-error")).rejects.toEqual(
      errorResponse
    );

    // Ensure logger.log and toast.error were called
    expect(logger.log).toHaveBeenCalledWith(errorResponse);
    expect(toast.error).toHaveBeenCalledWith("An unexpected error occurrred.");
  });*/

  test("should set JWT token in axios headers", () => {
    httpService.setJwt("fake-jwt-token");

    expect(axios.defaults.headers.common["x-auth-token"]).toBe(
      "fake-jwt-token"
    );
  });
});

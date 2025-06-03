import logService from "../../services/logService";

describe("logService", () => {
  // Test for log function
  test("should log error to console", () => {
    // Arrange: Create a mock for console.error
    const errorMessage = "Something went wrong!";
    const consoleErrorMock = jest.spyOn(console, "error").mockImplementation();

    // Act: Call the log method
    logService.log(errorMessage);

    // Assert: Check if console.error was called with the correct error message
    expect(consoleErrorMock).toHaveBeenCalledWith(errorMessage);

    // Cleanup: Restore original console.error after the test
    consoleErrorMock.mockRestore();
  });
});

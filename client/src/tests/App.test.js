import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  RouterProvider,
  createMemoryRouter,
} from "react-router-dom";
import App from "../App";

// Mock components
jest.mock("../components/navbar", () => () => (
  <div data-testid="navbar">NavBar</div>
));
jest.mock("../components/homePage", () => () => (
  <div data-testid="home-page">Home Page</div>
));
jest.mock("../components/notFoundPage", () => () => (
  <div data-testid="not-found-page">
    <h2>Unexpected Application Error!</h2>
    <h3 style={{ fontStyle: "italic" }}>404 Not Found</h3>
  </div>
));

// Suppress React Router v7 warnings
beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation((message) => {
    if (message.includes("React Router Future Flag Warning")) {
      return;
    }
    console.warn(message);
  });
});

describe("App Routing", () => {
  test("renders NavBar and HomePage by default", () => {
    const router = createMemoryRouter([{ path: "/", element: <App /> }], {
      future: { v7_startTransition: true, v7_relativeSplatPath: true },
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("redirects to NotFound page for unknown routes", () => {
    const router = createMemoryRouter(
      [{ path: "/unknown-route", element: <App /> }],
      {
        future: { v7_startTransition: true, v7_relativeSplatPath: true },
      }
    );

    render(<RouterProvider router={router} />);

    // Check for error message indicating 404 not found
    expect(screen.getByText(/404 Not Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Unexpected Application Error!/i)
    ).toBeInTheDocument();
  });
});

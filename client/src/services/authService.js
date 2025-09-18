import { jwtDecode } from "jwt-decode";
import http from "./httpService";

const apiEndpoint = "/auth";
const tokenKey = "token";

http.setJwt(getJwt());

export async function login(email, password) {
  const { data } = await http.post(apiEndpoint, { email, password });
  let jwt =
    typeof data === "string"
      ? data
      : data?.token || data?.jwt || data?.accessToken;
  if (typeof jwt !== "string")
    throw new Error("Login endpoint did not return a token string.");
  jwt = jwt.replace(/^Bearer\s+/i, "");
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt);
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt);
}

export function logout() {
  localStorage.removeItem(tokenKey);
  http.setJwt(null);
}

export function getCurrentUser() {
  try {
    const jwt = getJwt();
    if (!jwt) return null;
    return jwtDecode(jwt);
  } catch (ex) {
    console.error("Error decoding JWT:", ex);
    logout();
    return null;
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
};

/*import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is imported correctly
import http from "./httpService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/auth";
const tokenKey = "token";

// Set the JWT in HTTP service on app startup
http.setJwt(getJwt());

// export async function login(email, password) {
// const { data: jwt } = await http.post(apiEndpoint, { email, password });
// localStorage.setItem(tokenKey, jwt);
// http.setJwt(jwt); // Ensure Axios starts using the new token immediately
//}

export async function login(email, password) {
  const { data } = await http.post(apiEndpoint, { email, password });

  // Accept common shapes; your API may be returning { token } (or similar)
  let jwt =
    typeof data === "string"
      ? data
      : data?.token || data?.jwt || data?.accessToken;

  if (typeof jwt !== "string") {
    // Don’t save anything; surface a clear error so the form doesn’t redirect
    throw new Error("Login endpoint did not return a token string.");
  }

  // If the server ever returns "Bearer <JWT>", remove the prefix.
  // If there is no prefix, this is a no-op and changes nothing.
  jwt = jwt.replace(/^Bearer\s+/i, "");

  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt);
}

export function loginWithJwt(jwt) {
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt); // Ensure token is applied to Axios immediately
}

export function logout() {
  localStorage.removeItem(tokenKey);
  http.setJwt(null); // Clear token from Axios headers
}

export function getCurrentUser() {
  try {
    const jwt = getJwt();
    if (!jwt) return null; // If no token, return null (gracefully handle logout)

    return jwtDecode(jwt); // Decode and return user info if token exists
  } catch (ex) {
    console.error("Error decoding JWT:", ex);
    logout(); // Ensure the user is logged out if an error occurs
    return null; // Return null if an error occurs during decoding
  }
}

export function getJwt() {
  return localStorage.getItem(tokenKey);
}

// Add event listener to log out user when window is closed
//window.addEventListener("beforeunload", function (event) {
//  logout();
//});

const authService = {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
};

export default authService;*/

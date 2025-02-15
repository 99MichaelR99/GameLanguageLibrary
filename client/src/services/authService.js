import { jwtDecode } from "jwt-decode"; // Ensure jwt-decode is imported correctly
import http from "./httpService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/auth";
const tokenKey = "token";

// Set the JWT in HTTP service on app startup
http.setJwt(getJwt());

export async function login(email, password) {
  const { data: jwt } = await http.post(apiEndpoint, { email, password });
  localStorage.setItem(tokenKey, jwt);
  http.setJwt(jwt); // Ensure Axios starts using the new token immediately
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
/*window.addEventListener("beforeunload", function (event) {
  logout();
});*/

const authService = {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getJwt,
};

export default authService;

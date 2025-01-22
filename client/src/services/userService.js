import http from "./httpService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/users";

export function register(user) {
  return http.post(apiEndpoint, {
    name: user.name,
    email: user.email,
    password: user.password,
  });
}

export function updateProfile(user) {
  return http.put(apiEndpoint + "/me", {
    name: user.name,
    email: user.email,
    oldPassword: user.oldPassword,
    newPassword: user.newPassword,
  });
}

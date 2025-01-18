import http from "./httpService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/messages";

export function saveMessage(message) {
  return http.post(apiEndpoint, message);
}

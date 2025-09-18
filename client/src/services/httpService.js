import axios from "axios";
import logger from "./logService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Single source of truth for API base
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

axios.interceptors.response.use(null, (error) => {
  const expected =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expected) {
    logger.log(error);
    toast.error("An unexpected error occurrred.");
  }
  return Promise.reject(error);
});

// Your server expects 'x-auth-token'; keep using it
export function setJwt(jwt) {
  if (jwt) axios.defaults.headers.common["x-auth-token"] = jwt;
  else delete axios.defaults.headers.common["x-auth-token"];
}

const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  setJwt,
};

export default http;

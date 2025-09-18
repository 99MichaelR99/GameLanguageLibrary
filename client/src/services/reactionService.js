import http from "./httpService";

const apiEndpoint = "/reactions";

export function getPostReactions(postID) {
  return http.get(`${apiEndpoint}/post/${postID}`);
}

export function updatePostReaction(postID, reactionType) {
  return http.post(`${apiEndpoint}/post/${postID}`, { reactionType });
}

export function getReactionCounts(postID) {
  return http.get(`${apiEndpoint}/${postID}/counts`);
}

/*import http from "./httpService";
//import auth from "../services/authService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/reactions";

export function getPostReactions(postID) {
  return http.get(`${apiEndpoint}/post/${postID}`);
}

export function updatePostReaction(postID, reactionType) {
  return http.post(`${apiEndpoint}/post/${postID}`, { reactionType });
}

//export function updatePostReaction(postID, reactionType) {
//  const currentUser = auth.getCurrentUser();
//  return http.post(`${apiEndpoint}/post/${postID}`, {
//    postID,
//    userID: currentUser._id,
//    reactionType,
//  });
//}

export const getReactionCounts = async (postID) => {
  return await http.get(`/${apiEndpoint}/${postID}/counts`);
};*/

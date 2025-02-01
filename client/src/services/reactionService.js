import http from "./httpService";
//import auth from "../services/authService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/reactions";

export function getPostReactions(postId) {
  return http.get(`${apiEndpoint}/post/${postId}`);
}

export function updatePostReaction(postID, reactionType) {
  return http.post(`${apiEndpoint}/post/${postID}`, { reactionType });
}

/*export function updatePostReaction(postID, reactionType) {
  const currentUser = auth.getCurrentUser();
  return http.post(`${apiEndpoint}/post/${postID}`, {
    postID,
    userID: currentUser._id,
    reactionType,
  });
}*/

export const getReactionCounts = async (postId) => {
  return await http.get(`/${apiEndpoint}/${postId}/counts`);
};

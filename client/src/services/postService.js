import http from "./httpService";
import auth from "../services/authService";
import config from "../config.json";

const apiEndpoint = config.apiUrl + "/posts";
const reactionApiEndpoint = config.apiUrl + "/reactions";

function postUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getPosts() {
  return http.get(apiEndpoint);
}

export function getPost(postID) {
  return http.get(postUrl(postID));
}

export async function checkIfPostExists(postID) {
  try {
    const response = await getPost(postID);
    return response.status === 200; // Post exists
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false; // Post doesn't exist, return false
    }
    console.error("Error checking if post exists:", error);
    return false; // In case of any other error, return false
  }
}

export function getPostsByUser(userId) {
  return http.get(`${apiEndpoint}?createdBy=${userId}`);
}

export async function savePost(post) {
  let { _id: postID, ...body } = post;

  const currentUser = auth.getCurrentUser();
  if (!currentUser || !currentUser._id) {
    throw new Error("User must be authenticated to save a post.");
  }

  const newPost = {
    createdBy: currentUser._id,
    gameName: body.gameName,
    platform: body.platform.toUpperCase(),
    code: body.code.replace(/_/g, " ").toUpperCase(),
    voiceLanguages: body.voiceLanguages.sort(),
    subtitlesLanguages: body.subtitlesLanguages.sort(),
  };

  if (postID) {
    return http.put(postUrl(postID), newPost);
  } else {
    return http.post(apiEndpoint, newPost);
  }
}

export async function deletePost(postID) {
  // Delete the post first
  await http.delete(postUrl(postID));
  // Delete all reactions associated with that post
  await http.delete(`${reactionApiEndpoint}/post/${postID}`);
}

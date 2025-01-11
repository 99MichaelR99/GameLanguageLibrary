import http from "./httpService";
import auth from "../services/authService";

const apiEndpoint = "/posts";

function postUrl(id) {
  return `${apiEndpoint}/${id}`;
}

export function getPosts() {
  return http.get(apiEndpoint);
}

export function getPost(postID) {
  return http.get(postUrl(postID));
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
    code: body.code.replace(/\s+/g, "_").toUpperCase(),
    voiceLanguages: body.voiceLanguages.sort(),
    subtitlesLanguages: body.subtitlesLanguages.sort(),
  };

  if (postID) {
    return http.put(postUrl(postID), newPost);
  } else {
    return http.post(apiEndpoint, newPost);
  }
}

export function deletePost(postID) {
  return http.delete(postUrl(postID));
}

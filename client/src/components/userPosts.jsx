import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getPostsByUser, deletePost } from "../services/postService";
import PostTable from "./postsTable";
import { useAuth } from "../context/authContext";

const UserPosts = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (!user?._id) return;

    try {
      const { data: fetchedPosts } = await getPostsByUser(user._id);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Could not load user posts.");
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (post) => {
    const originalPosts = [...posts];

    try {
      setPosts(posts.filter((p) => p._id !== post._id));
      await deletePost(post._id);
      toast.success("Post deleted successfully!");
      await fetchPosts();
    } catch (ex) {
      setPosts(originalPosts);
      toast.error("Could not delete the post.");
    }
  };

  return (
    <div>
      <h2>User Posts</h2>
      <PostTable posts={posts} onDelete={handleDeletePost} />
    </div>
  );
};

export default UserPosts;

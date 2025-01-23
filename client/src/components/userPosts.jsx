import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getPostsByUser, deletePost } from "../services/postService";
import PostTable from "./postsTable";
import { useAuth } from "../context/authContext";

const UserPosts = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth(); // Fetch user from context

  useEffect(() => {
    if (!user?._id) return;

    const fetchPosts = async () => {
      try {
        const { data: fetchedPosts } = await getPostsByUser(user._id);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Could not load user posts.");
      }
    };

    fetchPosts();
  }, [user]);

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      toast.success("Post deleted successfully!");
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (error) {
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

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { getPostsByUser, deletePost } from "../services/postService";
import PostTable from "./postsTable"; // Keep using PostTable
import { useAuth } from "../context/authContext";

const UserPosts = () => {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState({
    path: "gameName",
    order: "asc",
  }); // Default sort settings

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

  // Handle sorting when column header is clicked
  const handleSort = (sortColumn) => {
    setSortColumn(sortColumn); // Update the sort column state
  };

  return (
    <div>
      <h2>User Posts</h2>
      <PostTable
        posts={posts}
        onDelete={handleDeletePost}
        sortColumn={sortColumn} // Pass sortColumn state
        onSort={handleSort} // Pass handleSort function to PostTable
      />
    </div>
  );
};

export default UserPosts;

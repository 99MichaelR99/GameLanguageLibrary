import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataPage from "./common/dataPage";
import PostTable from "./postsTable";
import { getPosts, deletePost } from "../services/postService";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

const PostsPage = () => {
  const { user } = useAuth();

  const renderHeader = () =>
    user && (
      <Link to="/posts/new" className="btn btn-primary mb-3">
        New Post
      </Link>
    );

  const renderTable = (data, sortColumn, onSort, _onFavorite, onDelete) => (
    <PostTable
      posts={data}
      sortColumn={sortColumn}
      onSort={onSort}
      onDelete={onDelete}
    />
  );

  const handleDeletePost = async (post) => {
    try {
      await deletePost(post._id); // Call the delete service with only post ID
      toast.success("Post deleted successfully!");
    } catch (ex) {
      toast.error("Could not delete the post.");
      throw ex; // Re-throw error for the DataPage to catch
    }
  };

  return (
    <DataPage
      getData={getPosts}
      renderHeader={renderHeader}
      renderTable={renderTable}
      deleteHandler={handleDeletePost}
    />
  );
};

export default PostsPage;

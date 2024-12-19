import React from "react";
import { useNavigate } from "react-router-dom";

const Posts = () => {
  const navigate = useNavigate();

  return (
    <div className="row">
      <h1>Posts</h1>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/posts/new")}
      >
        Add Post
      </button>
    </div>
  );
};

export default Posts;

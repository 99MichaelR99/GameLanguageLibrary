import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import DataTable from "./common/dataTable";
import Like from "./common/like";

const postColumnsConfig = [
  {
    path: "gameName",
    label: "Game Name",
    sortable: true,
    content: (post) => post.gameName || "No Name",
  },
  {
    path: "platform",
    label: "Platform",
    sortable: false,
    content: (post) => post.platform || "No platform",
  },
  {
    path: "code",
    label: "Code",
    sortable: true,
    content: (post) => post.code || "No Code",
  },
  {
    path: "voiceLanguages",
    label: "Voice Languages",
    content: (post) =>
      post.voiceLanguages?.join(", ") || "No languages",
    sortable: false,
  },
  {
    path: "subtitlesLanguages",
    label: "Subtitles Languages",
    content: (post) =>
      post.subtitlesLanguages?.join(", ") || "No languages",
    sortable: false,
  },
  /*{
    path: "createdBy",
    label: "Created By",
    sortable: false,
    content: (post) => post.createdBy || "No creator",
  },*/
  {
    path: "date",
    label: "Date",
    sortable: true,
    content: (post) => new Date(post.date).toLocaleDateString(),
  },
];

const PostTable = ({ posts, sortColumn, onSort, onLike, onDelete }) => {
  const { user } = useAuth();
  // Create a new array for columnsConfig to avoid mutating the original one
  const columnsConfig = [...postColumnsConfig];

  // Modify the 'code' column based on user logic
  columnsConfig[2].content = (post) => {
    return user && (user._id === post.createdBy || user.isAdmin) ? (
      <Link to={`/posts/${post._id}`}>{post.code}</Link>
    ) : (
      <span>{post.code}</span>
    );
  };

  // Conditionally add 'like' column if onLike is provided
  if (onLike) {
    columnsConfig.push({
      key: "like",
      content: (post) => (
        <Like liked={post.liked || false} onClick={() => onLike(post)} />
      ),
      sortable: false,
    });
  }

  // Conditionally add 'delete' column if user is an admin and onDelete is provided
  if (user && user.isAdmin && onDelete) {
    columnsConfig.push({
      key: "delete",
      content: (post) => (
        <button
          onClick={() => onDelete(post)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
      sortable: false,
    });
  }

  return (
    <DataTable
      entityType="posts"
      columnsConfig={columnsConfig}
      data={posts}
      onSort={onSort}
      sortColumn={sortColumn}
    />
  );
};

export default PostTable;

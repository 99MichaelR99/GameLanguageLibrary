import React from "react";
import { Link } from "react-router-dom";
import DataTable from "./common/dataTable";
import Like from "./common/like";

const postColumnsConfig = [
  {
    path: "gameName",
    label: "Game Name",
    sortable: true,
    content: (post) => <Link to={`/posts/${post._id}`}>{post.gameName}</Link>,
  },
  {
    path: "platform",
    label: "Platform",
    sortable: false,
    content: (post) => post.version.platform || "No platform",
  },
  {
    path: "code",
    label: "Version Code",
    sortable: true,
    content: (post) => <span>{post.version.code}</span>, // This will be updated later
  },
  {
    path: "voiceLanguages",
    label: "Voice Languages",
    content: (post) =>
      post.version.voiceLanguages?.join(", ") || "No voice languages",
    sortable: false,
  },
  {
    path: "subtitlesLanguages",
    label: "Subtitles Languages",
    content: (post) =>
      post.version.subtitlesLanguages?.join(", ") || "No subtitles languages",
    sortable: false,
  },
  {
    path: "createdBy",
    label: "Created By",
    sortable: false,
    content: (post) => post.createdBy || "No creator",
  },
  {
    path: "date",
    label: "Date",
    sortable: true,
    content: (post) => new Date(post.date).toLocaleDateString(),
  },
];

const PostTable = ({ posts, user, sortColumn, onSort, onLike, onDelete }) => {
  // Create a new array for columnsConfig to avoid mutating the original one
  const columnsConfig = [...postColumnsConfig];

  // Modify the 'code' column based on user logic
  columnsConfig[2].content = (post) =>
    user && (user._id === post.createdBy || user.isAdmin) ? (
      <Link to={`/posts/${post._id}/edit`}>{post.version.code}</Link>
    ) : (
      <span>{post.version.code}</span>
    );

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
      user={user} // Pass the user to DataTable so that it's available to each column's content
    />
  );
};

export default PostTable;

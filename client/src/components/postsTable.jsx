import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import DataTable from "./common/dataTable";
import SocialReaction from "./common/reaction";
import withRouter from "../hoc/withRouter";

const postColumnsConfig = [
  {
    path: "name",
    label: "Game Name",
    sortable: true,
    content: (post) => post.gameName || post.name || "No Name",
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
    content: (post) => post.voiceLanguages?.join(", ") || "No languages",
    sortable: false,
  },
  {
    path: "subtitlesLanguages",
    label: "Subtitles Languages",
    content: (post) => post.subtitlesLanguages?.join(", ") || "No languages",
    sortable: false,
  },
  {
    path: "date",
    label: "Date",
    sortable: true,
    content: (post) => new Date(post.date).toLocaleDateString(),
  },
];

const PostTable = ({
  posts,
  sortColumn,
  onSort,
  onLike,
  onDelete,
  navigate,
}) => {
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

  // Conditionally add 'reaction' column for SocialReaction component
  columnsConfig.push({
    key: "reaction",
    content: (post) => <SocialReaction postId={post._id} />,
    sortable: false,
  });

  // Conditionally add 'delete' column if user is an admin and onDelete is provided
  if (user && onDelete) {
    columnsConfig.push({
      key: "delete",
      content: (post) =>
        user._id === post.createdBy || user.isAdmin ? (
          <button
            onClick={() => onDelete(post)}
            className="btn btn-danger btn-sm"
          >
            Delete
          </button>
        ) : null,
      sortable: false,
    });
  }

  const handleReleaseGame = (post) => {
    const queryParams = new URLSearchParams({
      gameName: post.name || post.gameName || "",
      platform: post.platform || "",
      code: post.code || "",
      voiceLanguages: post.voiceLanguages?.join(",") || "",
      subtitlesLanguages: post.subtitlesLanguages?.join(",") || "",
      postId: post._id,
    }).toString();

    navigate(`/games/new?${queryParams}`);
  };

  if (user && user.isAdmin) {
    columnsConfig.push({
      key: "releaseGame",
      content: (post) => (
        <button
          onClick={() => handleReleaseGame(post)}
          className="btn btn-primary btn-sm"
        >
          Release
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

export default withRouter(PostTable);

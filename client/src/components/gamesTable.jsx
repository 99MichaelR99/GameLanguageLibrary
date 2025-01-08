import React from "react";
import { Link } from "react-router-dom";
import DataTable from "./common/dataTable";
import Like from "./common/like";

const gameColumnsConfig = [
  {
    path: "name",
    label: "Name",
    sortable: true,
    content: (game) => <Link to={`/games/${game.gameID}`}>{game.name}</Link>,
  },
  { path: "platform", label: "Platform", sortable: false },
  {
    path: "code",
    label: "Code",
    sortable: true,
    content: (game) => <span>{game.code}</span>, // Remove user logic here
  },
  {
    path: "voiceLanguages",
    label: "Voice Languages",
    content: (item) => item.voiceLanguages?.join(", ") || "No data",
    sortable: false,
  },
  {
    path: "subtitlesLanguages",
    label: "Subtitles Languages",
    content: (item) => item.subtitlesLanguages?.join(", ") || "No data",
    sortable: false,
  },
];

const GamesTable = ({ games, user, sortColumn, onSort, onLike, onDelete }) => {
  // Create a new array for columnsConfig to avoid mutating the original one
  const columnsConfig = [...gameColumnsConfig];

  // Modify the 'code' column based on user logic
  columnsConfig[2].content = (game) =>
    user && user.isAdmin ? (
      <Link to={`/games/${game.gameID}/${game._id}`}>{game.code}</Link>
    ) : (
      <span>{game.code}</span>
    );

  // Conditionally add 'like' column if onLike is provided
  if (onLike) {
    columnsConfig.push({
      key: "like",
      content: (game) => (
        <Like liked={game.liked || false} onClick={() => onLike(game)} />
      ),
      sortable: false,
    });
  }

  // Conditionally add 'delete' column if user is an admin and onDelete is provided
  if (user && user.isAdmin && onDelete) {
    columnsConfig.push({
      key: "delete",
      content: (game) => (
        <button
          onClick={() => onDelete(game)}
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
      entityType="games"
      columnsConfig={columnsConfig}
      data={games}
      onSort={onSort}
      sortColumn={sortColumn}
    />
  );
};

export default GamesTable;

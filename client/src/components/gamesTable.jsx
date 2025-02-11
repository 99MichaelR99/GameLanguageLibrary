import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import DataTable from "./common/dataTable";
import Like from "./common/like";

const gameColumnsConfig = [
  {
    path: "name",
    label: "Name",
    sortable: true,
    content: (game) => <Link to={`/games/${game.gameID}`}>{game.name}</Link>,
  },
  { path: "platform", label: "Platform", sortable: true },
  {
    path: "code",
    label: "Code",
    sortable: true,
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

const GamesTable = ({ games, sortColumn, onSort, onLike, onDelete }) => {
  const { user } = useAuth();

  const columnsConfig = [...gameColumnsConfig];

  // Modify the 'code' column based on user permissions
  columnsConfig[2].content = (game) =>
    user && user.isAdmin ? (
      <Link to={`/games/${game.gameID}/${game._id}`}>{game.code}</Link>
    ) : (
      <span>{game.code}</span>
    );

  if (onLike) {
    columnsConfig.push({
      key: "like",
      content: (game) => (
        <Like liked={game.liked || false} onClick={() => onLike(game)} />
      ),
      sortable: false,
    });
  }

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

  columnsConfig.push({
    key: "report",
    content: (game) => (
      <Link
        to={`/contact-us?name=${encodeURIComponent(game.name)}&code=${
          game.code
        }`}
        className="btn btn-warning btn-sm"
      >
        Report
      </Link>
    ),
    sortable: false,
  });

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

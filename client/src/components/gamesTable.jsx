import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import DataTable from "./common/dataTable";
import EpicLink from "./common/epicLink";
import Favorite from "./common/favorite";
import { addFavorite, getFavorites } from "../services/userService";

const gameColumnsConfig = [
  {
    path: "name",
    label: "Name",
    sortable: true,
    content: (game) => (
      <EpicLink to={`/games/${game.gameID}`}>{game.name}</EpicLink>
    ),
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

const GamesTable = ({ games, sortColumn, onSort, onFavorite, onDelete }) => {
  const { user } = useAuth();
  const [userFavoriteGames, setUserFavoriteGames] = useState([]);

  // Fetch user's favorite games
  useEffect(() => {
    if (user) {
      const fetchFavoriteGames = async () => {
        try {
          // Fetch the user's favorite games from the database
          const favoriteGames = await getFavorites(user._id);
          setUserFavoriteGames(favoriteGames || []); // Ensure the state is set to an array
        } catch (error) {
          console.error("Error fetching favorite games:", error);
          setUserFavoriteGames([]); // Fallback to empty array on error
        }
      };
      fetchFavoriteGames();
    }
  }, [user]);

  const columnsConfig = [...gameColumnsConfig];

  columnsConfig[2].content = (game) =>
    user && user.isAdmin ? (
      <EpicLink to={`/games/${game.gameID}/${game._id}`}>{game.code}</EpicLink>
    ) : (
      <span>{game.code}</span>
    );

  if (onFavorite) {
    columnsConfig.push({
      key: "favorite",
      content: (game) => {
        // Ensure userFavoriteGames is always an array before using .some()
        const isFavorited =
          Array.isArray(userFavoriteGames) &&
          userFavoriteGames.some(
            (fav) =>
              fav.gameID.toString() === game.gameID &&
              fav.versionID === game._id
          );
        return (
          <Favorite liked={isFavorited} onClick={() => handleFavorite(game)} />
        );
      },
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
        to={`/contact-us?name=${encodeURIComponent(
          game.name
        )}&code=${encodeURIComponent(game.code)}`}
        className="btn btn-warning btn-sm"
      >
        Report
      </Link>
    ),
    sortable: false,
  });

  const handleFavorite = async (game) => {
    try {
      const versionID = game._id;
      await addFavorite(game.gameID, versionID);
      // Update the favorites state after the operation
      setUserFavoriteGames((prevFavorites) => {
        if (
          prevFavorites.some(
            (fav) =>
              fav.gameID.toString() === game.gameID &&
              fav.versionID === versionID
          )
        ) {
          return prevFavorites.filter(
            (fav) =>
              fav.gameID.toString() !== game.gameID ||
              fav.versionID !== versionID
          );
        } else {
          return [...prevFavorites, { gameID: game.gameID, versionID }];
        }
      });
      if (onFavorite) onFavorite(game);
    } catch (error) {
      console.error("Error liking game:", error);
    }
  };

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

import React from "react";
import { toast } from "react-toastify";
import DataPage from "./common/dataPage";
import GamesTable from "./gamesTable";
import { getGames, deleteGame } from "../services/gameService";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

const GamesPage = () => {
  const { user } = useAuth(); // Use useAuth to access the user context

  const renderHeader = () =>
    user?.isAdmin && (
      <Link to="/games/new" className="btn btn-primary mb-3">
        New Game
      </Link>
    );

  const renderTable = (data, sortColumn, onSort, onLike, onDelete) => (
    <GamesTable
      games={data}
      sortColumn={sortColumn}
      onSort={onSort}
      onDelete={onDelete}
      onLike={onLike}
    />
  );

  const transformData = (allGames) => {
    return (allGames || []).flatMap((game) =>
      game.versions.map((version) => ({
        name: game.name,
        gameID: game._id,
        ...version,
      }))
    );
  };

  const handleDeleteGame = async (game) => {
    const { gameID, _id } = game;
    try {
      await deleteGame(gameID, _id); // Call the delete service with both IDs
      toast.success("Game deleted successfully!");
    } catch (ex) {
      if (ex.response?.status === 404)
        toast.error("This game has already been deleted.");
      throw ex; // Re-throw error for the DataPage to catch
    }
  };

  return (
    <DataPage
      getData={getGames}
      transformData={transformData}
      renderHeader={renderHeader}
      renderTable={renderTable}
      deleteHandler={handleDeleteGame}
    />
  );
};

export default GamesPage;

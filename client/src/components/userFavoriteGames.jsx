import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GamesTable from "./gamesTable";
import { useAuth } from "../context/authContext";
import { getFavorites } from "../services/userService";

const UserFavoriteGames = () => {
  const [favoriteGames, setFavoriteGames] = useState([]);
  const { user } = useAuth();
  const [sortColumn, setSortColumn] = useState({
    path: "name",
    order: "asc",
  });

  const fetchFavoriteGames = useCallback(async () => {
    if (!user?._id) return;

    try {
      const fetchedFavorites = await getFavorites(user._id);

      // Ensure that the data is always an array
      setFavoriteGames(fetchedFavorites || []);
    } catch (error) {
      console.error("Error fetching favorite games:", error);
      toast.error("Could not load your favorite games.");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFavoriteGames();
    } else {
      setFavoriteGames([]);
    }
  }, [fetchFavoriteGames, user]);

  // Handle sorting when column header is clicked
  const handleSort = (sortColumn) => {
    setSortColumn(sortColumn);
  };

  const handleFavorite = (item) => {
    const data = [...this.state.data];
    const index = data.findIndex((i) => i._id === item._id);
    data[index] = { ...data[index], liked: !data[index].liked };
    this.setState({ data });
  };

  return (
    <div>
      <h2>Your Favorite Games</h2>
      <GamesTable
        games={favoriteGames}
        sortColumn={sortColumn}
        onSort={handleSort}
        onFavorite={handleFavorite}
      />
    </div>
  );
};

export default UserFavoriteGames;

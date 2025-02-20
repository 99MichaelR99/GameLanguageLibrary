import React, { useState, useEffect } from "react";
import axios from "axios";

const IGDBImage = ({ gameName }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/igdb/games",
          { gameName }
        );
        if (data.length > 0) {
          // Sort data by name
          const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
          const selectedGame = sortedData[0]; // You can change the logic here if you want to select a different game

          if (selectedGame.cover && selectedGame.cover.image_id) {
            const imageId = selectedGame.cover.image_id;
            const imageUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
            setImageUrl(imageUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching IGDB image:", error);
      }
    };

    if (gameName) {
      fetchImage();
    }
  }, [gameName]);

  return imageUrl ? (
    <img
      src={imageUrl}
      alt={gameName}
      style={{ width: "100%", height: "auto" }}
    />
  ) : null;
};

export default IGDBImage;

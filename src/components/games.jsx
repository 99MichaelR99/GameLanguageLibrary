import React from "react";

const Games = ({ games, onDelete, onLike, LikeComponent }) => {
  return (
    <>
      {games.map((game) =>
        game.versions.map((version, index) => (
          <tr key={version.code}>
            {/* Show the game's name only for the first row of each game */}
            {index === 0 && <td rowSpan={game.versions.length}>{game.name}</td>}
            <td>{version.platform}</td>
            <td>{version.code}</td>
            <td>{version.voiceLanguages.join(", ")}</td>
            <td>{version.subtitlesLanguages.join(", ")}</td>
            {/* Only show like and delete actions in the first row for each game */}
            {index === 0 && (
              <>
                <td rowSpan={game.versions.length}>
                  <LikeComponent
                    liked={game.liked}
                    onClick={() => onLike(game)}
                  />
                </td>
                <td rowSpan={game.versions.length}>
                  <button
                    onClick={() => onDelete(game)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))
      )}
    </>
  );
};

export default Games;

import React from "react";
import Like from "./common/like";

const GamesTable = ({ games, onLike, onDelete }) => {
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Name</th>
          <th>Platform</th>
          <th>Code</th>
          <th>Voice Languages</th>
          <th>Subtitles Languages</th>
          <th>Like</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        {games.map((game) =>
          game.versions.map((version) => (
            <tr key={version.code}>
              <td>{game.name}</td>
              <td>{version.platform}</td>
              <td>{version.code}</td>
              <td>{version.voiceLanguages.join(", ")}</td>
              <td>{version.subtitlesLanguages.join(", ")}</td>
              <td>
                <Like
                  liked={version.liked}
                  onClick={() => onLike(game, version)}
                />
              </td>
              <td>
                <button
                  onClick={() => onDelete(game, version)}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default GamesTable;

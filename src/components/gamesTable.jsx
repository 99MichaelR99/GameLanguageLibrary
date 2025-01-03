import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "./common/table";
import Like from "./common/like";

class GamesTable extends Component {
  columns = [
    {
      path: "name",
      label: "Name",
      sortable: true,
      content: (game) => <Link to={`/games/${game.gameID}`}>{game.name}</Link>,
    },
    { path: "platform", label: "Platform", sortable: false },
    { path: "code", label: "Code", sortable: true, content: (game) => <Link to={`/games/${game._id}/versions/${game.code}`}>{game.code}</Link>},
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

  // Conditionally add 'like' and 'delete' columns based on the presence of props
  componentDidMount() {
    const { onLike, onDelete } = this.props;
  
    // Conditionally add 'like' column if onLike is provided and not already in columns
    if (onLike && !this.columns.find(column => column.key === "like")) {
      this.columns.push({
        key: "like",
        content: (item) => (
          <Like
            liked={item.liked || false}
            onClick={() => onLike(item)} // Use the provided onLike method
          />
        ),
        sortable: false,
      });
    }
  
    // Conditionally add 'delete' column if onDelete is provided and not already in columns
    if (onDelete && !this.columns.find(column => column.key === "delete")) {
      this.columns.push({
        key: "delete",
        content: (item) => (
          <button
            onClick={() => onDelete(item)} // Use the provided onDelete method
            className="btn btn-danger btn-sm"
          >
            Delete
          </button>
        ),
        sortable: false,
      });
    }
  }
  

  render() {
    const { games, sortColumn, onSort } = this.props;

    return (
      <Table
        data={games}
        columns={this.columns}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default GamesTable;

import React, { Component } from "react";
import auth from "../services/authService";
import { Link } from "react-router-dom";
import Table from "./common/table";
import Like from "./common/like";

class GamesTable extends Component {
  constructor(props) {
    super(props);

    const user = auth.getCurrentUser();

    this.columns = [
      {
        path: "name",
        label: "Name",
        sortable: true,
        content: (game) => (
          <Link to={`/games/${game.gameID}`}>{game.name}</Link>
        ),
      },
      { path: "platform", label: "Platform", sortable: false },
      {
        path: "code",
        label: "Code",
        sortable: true,
        content: (game) => (
          <Link to={`/games/${game.gameID}/${game._id}`}>{game.code}</Link>
        ),
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

    if (props.onLike) {
      this.columns.push({
        key: "like",
        content: (item) => (
          <Like
            liked={item.liked || false}
            onClick={() => props.onLike(item)}
          />
        ),
        sortable: false,
      });
    }

    if (user && user.isAdmin && props.onDelete) {
      this.columns.push({
        key: "delete",
        content: (item) => (
          <button
            onClick={() => props.onDelete(item)}
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

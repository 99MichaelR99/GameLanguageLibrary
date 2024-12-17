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
      content: (game) => <Link to={`/games/${game.code}`}>{game.name}</Link>,
    },
    { path: "platform", label: "Platform", sortable: false },
    { path: "code", label: "Code", sortable: true },
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
    {
      key: "like",
      content: (item) => (
        <Like
          liked={item.liked || false}
          onClick={() => this.props.onLike(item)}
        />
      ),
      sortable: false,
    },
    {
      key: "delete",
      content: (item) => (
        <button
          onClick={() => this.props.onDelete(item)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
      sortable: false,
    },
  ];

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

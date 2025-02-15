import React, { Component } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GamesTable from "./gamesTable";
import { getGame, deleteGame } from "../services/gameService";
import withRouter from "../hoc/withRouter";
import AuthContext from "../context/authContext";
import { Link } from "react-router-dom";
import _ from "lodash";

class VersionsPage extends Component {
  state = {
    gameID: "",
    gameName: "",
    versions: [],
    sortColumn: { path: "name", order: "asc" },
  };

  async componentDidMount() {
    const { params } = this.props;
    const { gameID } = params; // Access the game name from URL params
    const { data: game } = await getGame(gameID);

    this.setState({ gameID, gameName: game.name, versions: game.versions });
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleDelete = async (game) => {
    let { gameID, versions } = this.state;
    const versionID = game._id;

    if (game.gameID !== gameID) {
      throw new Error("Game ID mismatch");
    }

    const originalVersions = versions;
    const updatedVersions = versions.filter((v) => v._id !== versionID);
    this.setState({ versions: updatedVersions });

    try {
      await deleteGame(gameID, versionID);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This game has already been deleted.");
      else if (ex.response && ex.response.status === 401) {
        toast.error("You are not authorized to delete this game.");
      } else if (ex.response && ex.response.status === 403) {
        toast.error("You do not have permission to delete this game.");
      }
      this.setState({ versions: originalVersions });
    }
  };

  render() {
    const { gameID, gameName, sortColumn, versions } = this.state; // Get filtered versions from state

    const data = _.orderBy(
      versions.map((version) => ({
        gameID,
        name: gameName,
        ...version,
      })),
      [sortColumn.path],
      [sortColumn.order]
    );

    return (
      <AuthContext.Consumer>
        {(authContext) => {
          const { user } = authContext;
          return (
            <div>
              <h1 className="text-center">Versions for {gameName}</h1>
              <div className="d-flex">
                {user?.isAdmin && (
                  <Link
                    to={`/games/${gameID}/new`}
                    className="btn btn-primary mb-3"
                  >
                    New Version
                  </Link>
                )}
              </div>
              <GamesTable
                className="table table-bordered w-100"
                games={data}
                sortColumn={sortColumn}
                onSort={this.handleSort}
                onDelete={this.handleDelete}
              />
            </div>
          );
        }}
      </AuthContext.Consumer>
    );
  }
}

export default withRouter(VersionsPage);

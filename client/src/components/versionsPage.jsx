import React, { Component } from "react";
import { toast } from "react-toastify";
import GamesTable from "./gamesTable";
import { getGame, deleteGame } from "../services/gameService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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
      console.log(gameID, versionID);
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
    const { user } = this.props;

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
      <div>
        <h1 className="text-center">Versions for {gameName}</h1>
        <div className="d-flex">
          {user && user.isAdmin && (
            <Link to={`/games/${gameID}/new`} className="btn btn-primary mb-3">
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
  }
}

// Helper function to pass router hooks to class components
function withRouter(Component) {
  return function (props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  };
}

export default withRouter(VersionsPage);

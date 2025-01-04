import React, { Component } from "react";
import GamesTable from "./gamesTable";
import { getGame } from "../services/gameService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import _ from "lodash";

class VersionsPage extends Component {
  state = {
    gameID: "",
    gameName: "",
    sortColumn: { path: "name", order: "asc" },
    versions: [],
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
      <div>
        <h1 className="text-center">Versions for {gameName}</h1>
        <div className="d-flex">
          <Link to={`/games/${gameID}/new`} className="btn btn-primary mb-3">
            New Version
          </Link>
        </div>
        <GamesTable
          className="table table-bordered w-100"
          games={data}
          sortColumn={sortColumn}
          onSort={this.handleSort}
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

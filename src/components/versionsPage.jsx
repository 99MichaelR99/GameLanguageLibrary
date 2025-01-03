import React, { Component } from "react";
import GamesTable from "./gamesTable";
import { getGame } from "../services/gameService";
import { useParams, useLocation, useNavigate } from "react-router-dom";

class VersionsPage extends Component {
  state = {
    gameName: "",
    sortColumn: { path: "name", order: "asc" },
    versions: [],
  };

  async componentDidMount() {
    const { params } = this.props;
    const { id: gameId } = params; // Access the game name from URL params
    const { data: game } = await getGame(gameId);

    this.setState({ gameName: game.name, versions: game.versions });
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  render() {
    const { gameName, sortColumn, versions } = this.state; // Get filtered versions from state

    const data = versions.map((version) => ({ name: gameName, ...version }));

    return (
      <div>
        <h1>Versions for {gameName}</h1>
        <GamesTable
          className="table table-bordered"
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

import React, { Component } from "react";
import Games from "./games";
import Like from "./common/like";
import FilteringPanel from "./common/filteringPanel";
import Pagination from "./common/pagination";
import { getGames } from "../services/fakeGamesService";
import { paginate } from "../utils/paginate";
import "./gamesPage.css";

class GamesPage extends Component {
  state = {
    games: [],
    currentPage: 1,
    pageSize: 10,
    filter: {
      showFilters: false,
      platforms: [],
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
  };

  componentDidMount() {
    this.setState({ games: getGames() });
  }

  handleDelete = (game) => {
    const games = this.state.games.filter((g) => g._id !== game._id);
    this.setState({ games });
  };

  handleLike = (game) => {
    const games = [...this.state.games];
    const index = games.indexOf(game);
    games[index] = { ...games[index] };
    games[index].liked = !games[index].liked;
    this.setState({ games });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleFilterToggle = () => {
    this.setState((prevState) => ({
      filter: {
        ...prevState.filter,
        showFilters: !prevState.filter.showFilters,
      },
    }));
  };

  handleFilterChange = (type, value) => {
    this.setState((prevState) => {
      const updatedFilters = { ...prevState.filter };

      if (!updatedFilters[type]) return;

      if (updatedFilters[type].includes(value)) {
        updatedFilters[type] = updatedFilters[type].filter(
          (item) => item !== value
        );
      } else {
        updatedFilters[type] = [...updatedFilters[type], value];
      }

      return { filter: updatedFilters, currentPage: 1 };
    });
  };

  applyFilters = (games) => {
    const { platforms, voiceLanguages, subtitlesLanguages } = this.state.filter;

    return games
      .map((game) => {
        const matchingVersions = game.versions.filter((v) => {
          const platformMatch =
            platforms.length === 0 || platforms.includes(v.platform);
          const voiceLanguageMatch =
            voiceLanguages.length === 0 ||
            v.voiceLanguages.some((lang) => voiceLanguages.includes(lang));
          const subtitlesLanguageMatch =
            subtitlesLanguages.length === 0 ||
            v.subtitlesLanguages.some((lang) =>
              subtitlesLanguages.includes(lang)
            );

          return platformMatch && voiceLanguageMatch && subtitlesLanguageMatch;
        });

        // Include the game only if it has at least one matching version
        return matchingVersions.length > 0
          ? { ...game, versions: matchingVersions }
          : null;
      })
      .filter((game) => game !== null); // Remove games without matching versions
  };

  render() {
    const { games: allGames, currentPage, pageSize, filter } = this.state;
    if (this.state.games.length === 0)
      return <p>There are no games in the database.</p>;

    const filteredGames = this.applyFilters(allGames);
    const games = paginate(filteredGames, currentPage, pageSize);

    return (
      <div className="container-fluid games-page">
        <div className="row">
          {/* Sidebar (Filter Panel) */}
          <div className="col-md-3 col-lg-2 sidebar">
            <button
              className="btn btn-info toggle-button mb-3"
              onClick={this.handleFilterToggle}
            >
              {filter.showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {filter.showFilters && (
              <FilteringPanel
                filter={filter}
                onFilterChange={this.handleFilterChange}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10 main-content">
            <div className="text-end mb-2">
              <p>{filteredGames.length} Results</p>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Platform</th>
                  <th>Code</th>
                  <th>Voice Languages</th>
                  <th>Subtitles Languages</th>
                  <th />
                  <th />
                </tr>
              </thead>
              <tbody>
                <Games
                  games={games}
                  onDelete={this.handleDelete}
                  onLike={this.handleLike}
                  LikeComponent={Like}
                />
              </tbody>
            </table>

            <Pagination
              itemsCount={filteredGames.length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default GamesPage;

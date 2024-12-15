import React, { Component } from "react";
import FilteringPanel from "./common/filteringPanel";
import GamesTable from "./gamesTable";
import Pagination from "./common/pagination";
import { paginate } from "../utils/paginate";
import { getGames } from "../services/fakeGamesService";
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

  handleDelete = (game, version) => {
    const games = this.state.games
      .map((g) => {
        if (g._id === game._id) {
          // Filter out the deleted version
          const updatedVersions = g.versions.filter(
            (v) => v.code !== version.code
          );
          return updatedVersions.length > 0
            ? { ...g, versions: updatedVersions }
            : null;
        }
        return g;
      })
      .filter((g) => g !== null); // Remove games with no versions left

    this.setState({ games });
  };

  handleLike = (game, version) => {
    const games = this.state.games.map((g) => {
      if (g._id === game._id) {
        const updatedVersions = g.versions.map((v) =>
          v.code === version.code ? { ...v, liked: !v.liked } : v
        );
        return { ...g, versions: updatedVersions };
      }
      return g;
    });

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

        return matchingVersions.length > 0
          ? { ...game, versions: matchingVersions }
          : null;
      })
      .filter((game) => game !== null);
  };

  render() {
    const { games: allGames, currentPage, pageSize, filter } = this.state;
    if (allGames.length === 0)
      return <p>There are no games in the database.</p>;

    const filteredGames = this.applyFilters(allGames);
    const games = paginate(filteredGames, currentPage, pageSize);

    return (
      <div className="row">
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

        <div className="col-md-9 col-lg-10 main-content">
          <div className="text-end mb-2">
            <p>
              {filteredGames.reduce(
                (total, game) => total + game.versions.length,
                0
              )}{" "}
              Results
            </p>
          </div>
          <GamesTable
            className="table table-bordered"
            games={games}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={filteredGames.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default GamesPage;

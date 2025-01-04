import React, { Component } from "react";
import { toast } from "react-toastify";
import FilteringPanel from "./common/filteringPanel";
import GamesTable from "./gamesTable";
import Pagination from "./common/pagination";
import SearchBox from "./common/searchBox";
import { paginate } from "../utils/paginate";
import { getGames, deleteGame } from "../services/gameService";
import { Link } from "react-router-dom";
import "./gamesPage.css";
import _ from "lodash";

class GamesPage extends Component {
  state = {
    games: [],
    searchQuery: "",
    currentPage: 1,
    pageSize: 10,
    sortColumn: { path: "name", order: "asc" },
    filter: {
      showFilters: false,
      platforms: [],
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
  };

  async componentDidMount() {
    const { data: games } = await getGames();
    this.setState({ games });
  }

  handleDelete = async (game) => {
    const originalGames = this.state.games;
    const games = originalGames
      .map((g) => {
        if (g._id === game.gameID) {
          const updatedVersions = g.versions.filter((v) => v._id !== game._id);
          return updatedVersions.length > 0
            ? { ...g, versions: updatedVersions }
            : null;
        }
        return g;
      })
      .filter((g) => g !== null);
    this.setState({ games });

    try {
      await deleteGame(game.gameID, game._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This game has already been deleted.");
      this.setState({ games: originalGames });
    }
  };

  handleLike = (game) => {
    const games = this.state.games.map((g) => {
      if (g._id === game.gameID) {
        const updatedVersions = g.versions.map((v) =>
          v.code === game.code ? { ...v, liked: !v.liked } : v
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

  handleSearch = (query) => {
    const { showFilters } = this.state.filter;
    this.setState({
      searchQuery: query,
      currentPage: 1,
      filter: {
        showFilters: showFilters,
        platforms: [],
        voiceLanguages: [],
        subtitlesLanguages: [],
      },
    });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
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

      return { filter: updatedFilters, currentPage: 1, searchQuery: "" };
    });
  };

  applyFilters = (versions) => {
    const { platforms, voiceLanguages, subtitlesLanguages } = this.state.filter;

    return versions.filter((version) => {
      const platformMatch =
        platforms.length === 0 || platforms.includes(version.platform);
      const voiceLanguageMatch =
        voiceLanguages.length === 0 ||
        version.voiceLanguages.some((lang) => voiceLanguages.includes(lang));
      const subtitlesLanguageMatch =
        subtitlesLanguages.length === 0 ||
        version.subtitlesLanguages.some((lang) =>
          subtitlesLanguages.includes(lang)
        );

      return platformMatch && voiceLanguageMatch && subtitlesLanguageMatch;
    });
  };

  getPageData = () => {
    const {
      games: allGames,
      currentPage,
      pageSize,
      sortColumn,
      searchQuery,
    } = this.state;

    // Flatten versions first
    const flattenedVersions = (allGames || []).flatMap((game) => {
      return game.versions.map((version) => ({
        name: game.name,
        gameID: game._id,
        ...version,
        like: game.liked || false,
        isOfficial: version.isOfficial || false,
      }));
    });

    // Now, apply filters selection or search selection to the flattened versions
    let filteredVersions;
    if (searchQuery)
      filteredVersions = flattenedVersions.filter((g) =>
        g.name.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else filteredVersions = this.applyFilters(flattenedVersions);

    // Sort the filtered versions by the selected column and order
    const sortedVersions = _.orderBy(
      filteredVersions,
      [sortColumn.path],
      [sortColumn.order]
    );

    // Apply pagination
    const paginatedVersions = paginate(sortedVersions, currentPage, pageSize);

    return { totalCount: filteredVersions.length, data: paginatedVersions };
  };

  render() {
    const { currentPage, pageSize, sortColumn, searchQuery, filter } =
      this.state;
    if (this.state.games.length === 0)
      return <p>There are no games in the database.</p>;

    const { totalCount, data } = this.getPageData();

    return (
      <div className="games-page-container d-flex flex-wrap justify-content-center">
        <div className="col-md-3 col-lg-2 sidebar">
          <Link to="/games/new" className="btn btn-primary mb-3">
            New Game
          </Link>
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
        <div className="col main-content flex-grow-1">
          <div className="d-flex justify-content-between align-items-center">
            <SearchBox value={searchQuery} onChange={this.handleSearch} />
          </div>
          <GamesTable
            className="table table-bordered w-100"
            games={data}
            sortColumn={sortColumn}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
            <p className="results-count m-0"> {totalCount} Results</p>
            <Pagination
              itemsCount={totalCount}
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

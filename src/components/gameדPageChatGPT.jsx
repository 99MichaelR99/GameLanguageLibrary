import React, { Component } from "react";
import Games from "./games";
import Pagination from "./common/pagination";
import { getGames } from "../services/fakeGamesService";
import { paginate } from "../utils/paginate";
import Like from "./common/like"; // Import Like component
import FilteringPanel from "./FilteringPanel"; // Import FilteringPanel component

class GamesPage extends Component {
  state = {
    games: getGames(),
    currentPage: 1,
    pageSize: 5,
    showFilters: false, // To track if filters panel should be shown
    selectedPlatforms: [], // Store selected platforms
    selectedVoiceLanguages: [], // Store selected voice languages
    selectedSubtitlesLanguages: [], // Store selected subtitles languages
  };

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
      showFilters: !prevState.showFilters,
    }));
  };

  handlePlatformChange = (event) => {
    const platform = event.target.value;
    this.setState((prevState) => {
      const selectedPlatforms = prevState.selectedPlatforms.includes(platform)
        ? prevState.selectedPlatforms.filter((p) => p !== platform)
        : [...prevState.selectedPlatforms, platform];
      return { selectedPlatforms };
    });
  };

  handleVoiceLanguageChange = (event) => {
    const language = event.target.value;
    this.setState((prevState) => {
      const selectedVoiceLanguages = prevState.selectedVoiceLanguages.includes(language)
        ? prevState.selectedVoiceLanguages.filter((l) => l !== language)
        : [...prevState.selectedVoiceLanguages, language];
      return { selectedVoiceLanguages };
    });
  };

  handleSubtitlesLanguageChange = (event) => {
    const language = event.target.value;
    this.setState((prevState) => {
      const selectedSubtitlesLanguages = prevState.selectedSubtitlesLanguages.includes(language)
        ? prevState.selectedSubtitlesLanguages.filter((l) => l !== language)
        : [...prevState.selectedSubtitlesLanguages, language];
      return { selectedSubtitlesLanguages };
    });
  };

  applyFilters = (games) => {
    const { selectedPlatforms, selectedVoiceLanguages, selectedSubtitlesLanguages } = this.state;

    // Filter by platform, voice language, and subtitle language
    return games.filter((game) => {
      const platformMatch =
        selectedPlatforms.length === 0 ||
        game.versions.some((v) => selectedPlatforms.includes(v.platform));
      const voiceLanguageMatch =
        selectedVoiceLanguages.length === 0 ||
        game.versions.some((v) =>
          v.voiceLanguages.some((lang) => selectedVoiceLanguages.includes(lang))
        );
      const subtitlesLanguageMatch =
        selectedSubtitlesLanguages.length === 0 ||
        game.versions.some((v) =>
          v.subtitlesLanguages.some((lang) => selectedSubtitlesLanguages.includes(lang))
        );
      return platformMatch && voiceLanguageMatch && subtitlesLanguageMatch;
    });
  };

  render() {
    const { length: count } = this.state.games;
    const { games: allGames, currentPage, pageSize, showFilters } = this.state;
    if (count === 0) return <p>There are no games in the database.</p>;

    const games = this.applyFilters(allGames); // Apply the filters to the games list
    const paginatedGames = paginate(games, currentPage, pageSize);

    return (
      <div style={{ display: "flex" }}>
        {/* Filters Panel */}
        <FilteringPanel
          showFilters={showFilters}
          onFilterToggle={this.handleFilterToggle}
          onPlatformChange={this.handlePlatformChange}
          onVoiceLanguageChange={this.handleVoiceLanguageChange}
          onSubtitlesLanguageChange={this.handleSubtitlesLanguageChange}
          selectedPlatforms={this.state.selectedPlatforms}
          selectedVoiceLanguages={this.state.selectedVoiceLanguages}
          selectedSubtitlesLanguages={this.state.selectedSubtitlesLanguages}
        />

        {/* Main Table Area */}
        <div style={{ flex: 1 }}>
          {/* Show Filters Button */}
          <button
            className="btn btn-info"
            onClick={this.handleFilterToggle}
            style={{ marginBottom: "10px" }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <p>Showing {games.length} games in the database.</p>
          <table className="table">
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
                games={paginatedGames}
                onDelete={this.handleDelete}
                onLike={this.handleLike}
                LikeComponent={Like} // Pass Like component as a prop
              />
            </tbody>
          </table>
          <Pagination
            itemsCount={games.length}
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

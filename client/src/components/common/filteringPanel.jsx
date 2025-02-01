import React from "react";
import { languages, platforms } from "../gameData";

const FilteringPanel = (props) => {
  const { filter, onFilterChange, onFilterToggle } = props;

  return (
    <div className="filtering-panel">
      <button
        className="btn btn-info toggle-button mb-3"
        onClick={onFilterToggle}
      >
        {filter.showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {filter.showFilters && (
        <div>
          <h5>Filter By:</h5>

          {/* Platform Filter */}
          <div>
            <h6>Platform</h6>
            {platforms.map((platform) => (
              <div key={platform}>
                <label>
                  <input
                    type="checkbox"
                    value={platform}
                    checked={filter.platforms.includes(platform)}
                    onChange={() => onFilterChange("platforms", platform)}
                  />
                  {platform}
                </label>
              </div>
            ))}
          </div>

          {/* Voice Language Filter */}
          <div>
            <h6>Voice Language</h6>
            {languages.map((language) => (
              <div key={language}>
                <label>
                  <input
                    type="checkbox"
                    value={language}
                    checked={filter.voiceLanguages.includes(language)}
                    onChange={() => onFilterChange("voiceLanguages", language)}
                  />
                  {language}
                </label>
              </div>
            ))}
          </div>

          {/* Subtitles Language Filter */}
          <div>
            <h6>Subtitles Language</h6>
            {languages.map((language) => (
              <div key={language}>
                <label>
                  <input
                    type="checkbox"
                    value={language}
                    checked={filter.subtitlesLanguages.includes(language)}
                    onChange={() =>
                      onFilterChange("subtitlesLanguages", language)
                    }
                  />
                  {language}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilteringPanel;

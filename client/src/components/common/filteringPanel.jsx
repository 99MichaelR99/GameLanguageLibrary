import React from "react";

const FilteringPanel = (props) => {
  const platforms = ["PSP", "PSVita", "PS1", "PS2", "PS3", "PS4", "PS5"].sort();
  const languages = [
    "Arabic",
    "Chinese (Simplified)",
    "Chinese (Traditional)",
    "Croatian",
    "Czech",
    "Dutch",
    "English",
    "French (France)",
    "German",
    "Greek",
    "Hungarian",
    "Italian",
    "Japanese",
    "Korean",
    "Polish",
    "Portuguese (Brazil)",
    "Portuguese (Portugal)",
    "Russian",
    "Spanish",
    "Thai",
    "Turkish",
    "Other",
  ];

  const { filter, onFilterChange } = props;

  if (!filter.showFilters) return null;

  return (
    <div className="filtering-panel">
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
                onChange={() => onFilterChange("subtitlesLanguages", language)}
              />
              {language}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilteringPanel;

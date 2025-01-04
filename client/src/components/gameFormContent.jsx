import React from "react";
import { languages, platforms } from "./gameData";

export const renderGameFormContent = (formInstance) => {
  return (
    <form onSubmit={formInstance.handleSubmit} className="form-content">
      {/* Left Column */}
      <div className="form-left">
        {formInstance.renderInput("gameName", "Game Name")}
        {formInstance.renderSelect("platform", "Platform", platforms)}
        {formInstance.renderInput("code", "Code")}
        {formInstance.renderButton("Submit")}
      </div>
      {/* Middle Column */}
      <div className="form-middle">
        {formInstance.renderCustomDropdown(
          "voiceLanguages",
          "Voice Languages",
          languages
        )}
      </div>
      {/* Right Column */}
      <div className="form-right">
        {formInstance.renderCustomDropdown(
          "subtitlesLanguages",
          "Subtitles Languages",
          languages
        )}
      </div>
    </form>
  );
};

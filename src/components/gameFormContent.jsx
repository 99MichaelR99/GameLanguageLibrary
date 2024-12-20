import React from "react";
import Form from "./common/form";

export const renderGameFormContent = () => {
  const languages = [
    "English",
    "French",
    "German",
    "Polish",
    "Russian",
    "Spanish",
  ];
  const platforms = [
    { _id: "ps3", name: "PS3" },
    { _id: "ps4", name: "PS4" },
    { _id: "ps5", name: "PS5" },
  ];

  const formInstance = new Form();

  return (
    <form onSubmit={formInstance.handleSubmit} className="form-content">
      {/* Left Column */}
      <div className="form-left">
        {formInstance.renderInput("gameName", "Game Name")}
        {this.renderSelect("platform", "Platform", platforms)}
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

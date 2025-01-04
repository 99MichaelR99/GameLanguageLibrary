import React from "react";
//import Form from "./common/form";

export const renderGameFormContent = (formInstance) => {
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

  const platforms = [
    { _id: "PSP", name: "PSP" },
    { _id: "PSVita", name: "PSVita" },
    { _id: "PS1", name: "PS1" },
    { _id: "PS2", name: "PS2" },
    { _id: "PS3", name: "PS3" },
    { _id: "PS4", name: "PS4" },
    { _id: "PS5", name: "PS5" },
  ];

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
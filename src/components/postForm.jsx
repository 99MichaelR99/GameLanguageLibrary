import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import "./postForm.css";

class PostForm extends Form {
  state = {
    data: {
      gameName: "",
      platform: "",
      code: "",
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
    errors: {},
    dropdownStates: {}, // Track dropdown open/close states
  };

  schema = {
    gameName: Joi.string().required().label("Game Name"),
    platform: Joi.string().required().label("Platform"),
    code: Joi.string().required().label("Code"),
    voiceLanguages: Joi.array().items(Joi.string()).label("Voice Languages"),
    subtitlesLanguages: Joi.array()
      .items(Joi.string())
      .label("Subtitles Languages"),
  };

  // Toggle dropdown visibility
  toggleDropdown = (name) => {
    this.setState((prevState) => ({
      dropdownStates: {
        ...prevState.dropdownStates,
        [name]: !prevState.dropdownStates[name],
      },
    }));
  };

  // Handle dropdown selection and deselection
  handleDropdownSelect = (name, value) => {
    const data = { ...this.state.data };
    const currentSelections = data[name] || [];

    if (currentSelections.includes(value)) {
      // If the value is already selected, remove it
      data[name] = currentSelections.filter((item) => item !== value);
    } else {
      // If the value is not selected, add it
      data[name] = [...currentSelections, value];
    }

    this.setState({ data });
  };

  // Check if submit button should be enabled
  validate = () => {
    const { error } = Joi.validate(this.state.data, this.schema, {
      abortEarly: false,
    });
    const { voiceLanguages, subtitlesLanguages } = this.state.data;
    if (!error && voiceLanguages.length > 0 && subtitlesLanguages.length > 0) {
      return null; // Valid form with both language arrays filled
    }

    return { formError: "Please select both voice and subtitle languages." }; // Return error if languages are not selected
  };

  doSubmit = () => {
    // Call the server to implement
    console.log("Post Submitted");
  };

  render() {
    const languages = [
      "English",
      "French",
      "German",
      "Polish",
      "Russian",
      "Spanish",
    ];

    return (
      <div className="form-container">
        <h1>Create a New Post</h1>
        <form onSubmit={this.handleSubmit} className="form-content">
          {/* Left Column */}
          <div className="form-left">
            {this.renderInput("gameName", "Game Name")}
            {this.renderInput("platform", "Platform")}
            {this.renderInput("code", "Code")}
            {this.renderButton("Submit")}
          </div>
          {/* Middle Column */}
          <div className="form-middle">
            {this.renderCustomDropdown(
              "voiceLanguages",
              "Voice Languages",
              languages
            )}
          </div>
          {/* Right Column */}
          <div className="form-right">
            {this.renderCustomDropdown(
              "subtitlesLanguages",
              "Subtitles Languages",
              languages
            )}
          </div>
        </form>
      </div>
    );
  }
}

export default PostForm;

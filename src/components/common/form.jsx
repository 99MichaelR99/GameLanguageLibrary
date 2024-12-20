import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";
import Select from "./select";
import "./form.css";

class Form extends Component {
  state = {
    data: {},
    errors: {},
    dropdownStates: {}, // To track dropdown open/close states
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;

    return error.details.reduce((acc, item) => {
      acc[item.path[0]] = item.message;
      return acc;
    }, {});
  };

  validateProperty = ({ name, value }) => {
    const subSchema = { [name]: this.schema[name] };
    const { error } = Joi.validate({ [name]: value }, subSchema);
    return error ? error.details[0].message : null;
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    data[input.name] = input.value;

    this.setState({ data, errors });
  };

  handleDropdownSelect = (name, value) => {
    const data = { ...this.state.data };
    const currentSelections = data[name] || [];
    if (currentSelections.includes(value)) {
      data[name] = currentSelections.filter((item) => item !== value);
    } else {
      data[name] = [...currentSelections, value];
    }
    this.setState({ data });
  };

  toggleDropdown = (name) => {
    this.setState((prevState) => ({
      dropdownStates: {
        ...prevState.dropdownStates,
        [name]: !prevState.dropdownStates[name],
      },
    }));
  };

  renderInput(name, label, type = "text") {
    const { data, errors } = this.state;

    return (
      <Input
        type={type}
        name={name}
        value={data[name]}
        label={label}
        error={errors[name]}
        onChange={this.handleChange}
      />
    );
  }

  renderCustomDropdown(name, label, options) {
    const { data, dropdownStates } = this.state;
    const isOpen = dropdownStates[name];

    return (
      <div className="dropdown-container">
        <label>{label}</label>
        <div className="dropdown-box" onClick={() => this.toggleDropdown(name)}>
          {data[name]?.length > 0
            ? data[name].join(", ")
            : `Select ${label.toLowerCase()}`}
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            {options.map((option) => (
              <li
                key={option}
                className={data[name]?.includes(option) ? "selected" : ""}
                onClick={() => this.handleDropdownSelect(name, option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  renderSelect(name, label, options) {
    const { data, errors } = this.state;

    return (
      <Select
        name={name}
        value={data[name]}
        label={label}
        options={options}
        onChange={this.handleChange}
        error={errors[name]}
      />
    );
  }

  renderButton(label) {
    return (
      <button
        disabled={this.validate()}
        type="submit"
        className="btn btn-primary"
      >
        {label}
      </button>
    );
  }

  renderGameFormContent() {
    const languages = [
      "English",
      "French",
      "German",
      "Polish",
      "Russian",
      "Spanish",
    ];

    return (
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
    );
  }
}

export default Form;

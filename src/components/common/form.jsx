import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";

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
      data[name] = currentSelections.filter((item) => item !== value); // Remove if already selected
    } else {
      data[name] = [...currentSelections, value]; // Add if not selected
    }
    this.setState({ data });
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
          {data[name].length > 0
            ? data[name].join(", ")
            : `Select ${label.toLowerCase()}`}
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            {options.map((option) => (
              <li
                key={option}
                className={data[name].includes(option) ? "selected" : ""}
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

  toggleDropdown = (name) => {
    this.setState((prevState) => ({
      dropdownStates: {
        ...prevState.dropdownStates,
        [name]: !prevState.dropdownStates[name],
      },
    }));
  };

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
}

export default Form;

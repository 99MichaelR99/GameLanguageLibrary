import React, { Component } from "react";
import Joi from "joi-browser";
import Input from "./input";
import Select from "./select";
import MultiSelect from "./multipleSelect";
import SearchableSelect from "./searchableSelect";
import "./form.css";

class Form extends Component {
  state = {
    data: {},
    errors: {},
    multiSelectState: {},
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

  handleSubmit = (e) => {
    e.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    this.doSubmit();
  };

  validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const subSchema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, subSchema);
    return error ? error.details[0].message : null;
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

  handleMultiSelect = (name, value) => {
    const data = { ...this.state.data };
    const currentSelections = data[name] || [];
    if (currentSelections.includes(value)) {
      data[name] = currentSelections.filter((item) => item !== value);
    } else {
      data[name] = [...currentSelections, value];
    }
    this.setState({ data });
  };

  toggleMultiSelect = (name) => {
    this.setState((prevState) => ({
      multiSelectState: {
        ...prevState.multiSelectState,
        [name]: !prevState.multiSelectState[name],
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

  renderMultiSelect(name, label, options) {
    const { data, multiSelectState } = this.state;

    return (
      <MultiSelect
        data={data}
        multiSelectState={multiSelectState}
        name={name}
        label={label}
        options={options}
        toggleMultiSelect={this.toggleMultiSelect}
        handleMultiSelect={this.handleMultiSelect}
      />
    );
  }

  renderSearchableSelect(name, label, options) {
    const { data, errors } = this.state;

    return (
      <SearchableSelect
        name={name}
        label={label}
        options={options}
        value={data[name]}
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
}

export default Form;

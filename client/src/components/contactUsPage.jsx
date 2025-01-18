import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveMessage } from "../services/messageService";
import AuthContext from "../context/authContext";

class ContactUs extends Form {
  state = {
    data: { name: "", email: "", subject: "", description: "" },
    errors: {},
    limits: {
      subject: 40,
      description: 400,
    },
  };

  componentDidMount() {
    const { user } = this.context; // Access the user from context
    if (user) {
      this.setState({
        data: { ...this.state.data, name: user.name, email: user.email }, // Prefill if user is logged in
      });
    }
  }

  schema = {
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Email"),
    subject: Joi.string()
      .max(this.state.limits.subject)
      .required()
      .label("Subject"),
    description: Joi.string()
      .max(this.state.limits.description)
      .required()
      .label("Description"),
  };

  handleChange = ({ currentTarget: input }) => {
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(input);
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    const data = { ...this.state.data };
    const { limits } = this.state;

    // Prevent typing beyond limits dynamically
    if (
      (input.name === "description" &&
        input.value.length > limits.description) ||
      (input.name === "subject" && input.value.length > limits.subject)
    )
      return;

    data[input.name] = input.value;

    this.setState({ data, errors });
  };

  doSubmit = async () => {
    const { data } = this.state;
    const message = {
      name: data.name,
      email: data.email,
      message: `${data.subject}: ${data.description}`,
    };

    try {
      // Send the message to the backend using the new messageService
      await saveMessage(message);
      toast.success("Your message has been sent successfully!");

      // Reset the form state
      this.setState({
        data: { name: "", email: "", subject: "", description: "" },
        errors: {},
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = error.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    const { subject, description } = this.state.data;
    const { subject: subjectLimit, description: descriptionLimit } =
      this.state.limits;

    return (
      <div className="contact-us-container">
        <h1>Contact Us</h1>
        <p>
          Please fill out the form below, and we'll get back to you as soon as
          possible.
        </p>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("name", "Name")}
          {this.renderInput("email", "Email", "email")}

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              name="subject"
              id="subject"
              className="form-control"
              value={subject}
              onChange={this.handleChange}
              maxLength={subjectLimit}
            />
            <div className="character-counter">
              {subject.length}/{subjectLimit}
            </div>
            {this.state.errors.subject && (
              <div className="alert alert-danger">
                {this.state.errors.subject}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              className="form-control"
              rows="6"
              value={description}
              onChange={this.handleChange}
              maxLength={descriptionLimit}
            />
            <div className="character-counter">
              {description.length}/{descriptionLimit}
            </div>
            {this.state.errors.description && (
              <div className="alert alert-danger">
                {this.state.errors.description}
              </div>
            )}
          </div>

          {this.renderButton("Submit")}
        </form>
      </div>
    );
  }
}

ContactUs.contextType = AuthContext; // Set the context type

export default ContactUs;

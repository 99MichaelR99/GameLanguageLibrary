import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { saveMessage } from "../services/messageService";
import AuthContext from "../context/authContext";
import withRouter from "../hoc/withRouter"; // ⬅️ add this

class ContactUs extends Form {
  state = {
    data: {
      name: "",
      email: "",
      subject: "",
      description: "",
      gameName: "",
      code: "",
      provideGameInfo: false,
    },
    errors: {},
    limits: {
      subject: 40,
      description: 400,
    },
  };

  componentDidMount() {
    const { user } = this.context; // Access the user from context

    // --- robust query extraction (works for HashRouter and BrowserRouter) ---
    const routerSearch = this.props.location?.search || "";
    const hash = window.location.hash || ""; // e.g. "#/contact-us?name=...&code=..."
    const hashQuery = hash.includes("?")
      ? hash.substring(hash.indexOf("?"))
      : "";
    const rawSearch = routerSearch || hashQuery || window.location.search || "";
    const urlParams = new URLSearchParams(rawSearch);

    // Start from current state data and fill in known values once
    const nextData = { ...this.state.data };

    // Always fill in the logged-in user's name and email if they are logged in
    if (user) {
      nextData.name = user.name;
      nextData.email = user.email;
    }

    // Check if the user came from the report button (URL params are present)
    const gameNameParam = urlParams.get("name");
    const codeParam = urlParams.get("code");

    if (gameNameParam || codeParam) {
      nextData.gameName = gameNameParam || "";
      nextData.code = codeParam || "";
      nextData.provideGameInfo = true;
    }

    this.setState({ data: nextData });
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
    gameName: Joi.string().allow("").optional().label("Game Name"),
    code: Joi.string().allow("").optional().label("Code"),
    provideGameInfo: Joi.boolean().truthy("true").falsy("false").optional(),
  };

  handleChange = ({ currentTarget: input }) => {
    // Build next data first so validation sees coerced values
    const data = { ...this.state.data };
    const { limits } = this.state;

    // Length limits for live typing
    if (
      (input.name === "description" &&
        input.value.length > limits.description) ||
      (input.name === "subject" && input.value.length > limits.subject)
    )
      return;

    // Convert to boolean for consistency
    if (input.name === "provideGameInfo") {
      data[input.name] = input.value === "true";
    } else {
      data[input.name] = input.value;
    }

    // Validate the specific field after coercion
    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty({
      name: input.name,
      value: data[input.name],
    });
    if (errorMessage) errors[input.name] = errorMessage;
    else delete errors[input.name];

    this.setState({ data, errors });
  };

  // 🔽 Only include gameName/code when provideGameInfo is true
  doSubmit = async () => {
    const { data } = this.state;

    const message = {
      name: data.name,
      email: data.email,
      message: `${data.subject}: ${data.description}`,
    };

    if (data.provideGameInfo) {
      if (data.gameName) message.gameName = data.gameName;
      if (data.code) message.code = data.code;
    }

    try {
      await saveMessage(message);
      toast.success("Your message has been sent successfully!");

      this.setState({
        data: {
          name: "",
          email: "",
          subject: "",
          description: "",
          gameName: "",
          code: "",
          provideGameInfo: false,
        },
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
    const { subject, description, gameName, code, provideGameInfo } =
      this.state.data;
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

          {/* New Fields for Game Info */}
          <div className="form-group">
            <label htmlFor="provideGameInfo">
              Would you like to provide game information?
            </label>
            <select
              name="provideGameInfo"
              id="provideGameInfo"
              className="form-control"
              value={provideGameInfo ? "true" : "false"} // keep options in sync with boolean
              onChange={this.handleChange}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>

          {provideGameInfo && (
            <>
              <div className="form-group">
                <label htmlFor="gameName">Game Name</label>
                <input
                  type="text"
                  name="gameName"
                  id="gameName"
                  className="form-control"
                  value={gameName}
                  onChange={this.handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="code">Code</label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  className="form-control"
                  value={code}
                  onChange={this.handleChange}
                />
              </div>
            </>
          )}

          {/* Existing Fields */}
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

ContactUs.contextType = AuthContext;

export default withRouter(ContactUs); // ⬅️ wrap so location.search is available

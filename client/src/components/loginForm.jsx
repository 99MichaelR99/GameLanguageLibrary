import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import AuthContext from "../context/authContext";
import withRouter from "../hoc/withRouter";

class LoginForm extends Form {
  static contextType = AuthContext;

  state = {
    data: { email: "", password: "" },
    errors: {},
    redirectTo: null,
  };

  schema = {
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  };

  componentDidMount() {
    // Redirect if already logged in
    if (this.context.user) {
      this.setState({ redirectTo: "/" });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Redirect if state has been updated and shouldRedirect is true
    if (
      this.state.redirectTo &&
      this.state.redirectTo !== prevState.redirectTo
    ) {
      this.props.navigate(this.state.redirectTo, { replace: true });
    }
  }

  doSubmit = async () => {
    const { data } = this.state;
    try {
      await this.context.login(data.email, data.password);
      const { from } = this.props.location.state || { from: { pathname: "/" } };
      this.setState({ redirectTo: from }); // Update state with redirect destination
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    return (
      <div>
        <h1>Login</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("email", "Email")}
          {this.renderInput("password", "Password", "password")}
          {this.renderButton("Login")}
        </form>
      </div>
    );
  }
}

export default withRouter(LoginForm);

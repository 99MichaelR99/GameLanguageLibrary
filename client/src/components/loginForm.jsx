import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

class LoginForm extends Form {
  state = {
    data: { email: "", password: "" },
    errors: {},
  };

  schema = {
    email: Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.email, data.password);
      const { from } = this.props.location.state || { from: { pathname: "/" } };
      this.props.navigate(from); // Redirect to the original path
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    if (auth.getCurrentUser()) return <Navigate to="/" replace />;
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

// Use hooks to access location and navigate in the functional component
function LoginFormWrapper(props) {
  const location = useLocation();
  const navigate = useNavigate();

  return <LoginForm {...props} location={location} navigate={navigate} />;
}

export default LoginFormWrapper;

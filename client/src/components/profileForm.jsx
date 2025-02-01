import React from "react";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateProfile } from "../services/userService";
import Form from "./common/form";
import AuthContext from "../context/authContext";
import withRouter from "../hoc/withRouter";

class ProfileForm extends Form {
  static contextType = AuthContext; // Access AuthContext directly

  state = {
    data: {
      name: "",
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    isPasswordChange: false,
    errors: {},
    limits: {
      name: 30,
      email: 255,
      password: 255,
    },
  };

  schema = {
    name: Joi.string()
      .min(3)
      .max(this.state.limits.name)
      .required()
      .label("Name"),
    email: Joi.string()
      .email()
      .max(this.state.limits.email)
      .required()
      .label("Email"),
    oldPassword: Joi.string()
      .min(5)
      .max(this.state.limits.password)
      .allow("")
      .label("Old Password"),
    newPassword: Joi.string()
      .min(5)
      .max(this.state.limits.password)
      .allow("")
      .label("New Password"),
    confirmNewPassword: Joi.any()
      .valid(Joi.ref("newPassword"))
      .when("newPassword", {
        is: Joi.string().min(5).required(),
        then: Joi.required().label("Confirm New Password"),
        otherwise: Joi.optional(),
      })
      .options({
        language: {
          any: {
            allowOnly: "!!Passwords do not match",
          },
        },
      }),
  };

  componentDidMount() {
    const { user } = this.context; // Get user from AuthContext
    if (user) {
      const data = { ...this.state.data };
      data.name = user.name || "";
      data.email = user.email || "";
      this.setState({ data });
    }
  }

  doSubmit = async () => {
    const { name, email, oldPassword, newPassword } = this.state.data;

    const userData = { name, email };
    if (this.state.isPasswordChange) {
      userData.oldPassword = oldPassword;
      userData.newPassword = newPassword;
    }

    try {
      await updateProfile(userData);
      toast.success("Profile updated successfully!");

      // Update user in AuthContext
      const updatedUser = { ...this.context.user, name, email };
      this.context.updateUser(updatedUser);

      // Reset form
      this.setState({
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        },
        isPasswordChange: false,
        errors: {},
      });

      this.props.navigate("/");
    } catch (error) {
      console.error("Error during profile update:", error);
      if (error.response && error.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.email = error.response.data;
        this.setState({ errors });
      } else {
        toast.error("Error updating profile.");
      }
    }
  };

  handlePasswordChangeToggle = () => {
    this.setState((prevState) => ({
      isPasswordChange: !prevState.isPasswordChange,
      data: {
        ...prevState.data,
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      },
    }));
  };

  render() {
    const { isPasswordChange } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Profile</h2>
        {this.renderInput("name", "Name", "text")}
        {this.renderInput("email", "Email", "email")}
        {isPasswordChange && (
          <>
            {this.renderInput("oldPassword", "Old Password", "password")}
            {this.renderInput("newPassword", "New Password", "password")}
            {this.renderInput(
              "confirmNewPassword",
              "Confirm New Password",
              "password"
            )}
          </>
        )}
        <button
          type="button"
          className={`btn ${isPasswordChange ? "btn-danger" : "btn-primary"}`}
          onClick={this.handlePasswordChangeToggle}
        >
          {isPasswordChange ? "Cancel Password Change" : "Change Password"}
        </button>
        <button type="submit" className="btn btn-success mt-3">
          Update Profile
        </button>
      </form>
    );
  }
}

export default withRouter(ProfileForm);

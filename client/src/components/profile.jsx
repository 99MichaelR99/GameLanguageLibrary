import React from "react";
import Form from "./common/form";
import Joi from "joi-browser";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { updateProfile } from "../services/userService";
import AuthContext from "../context/authContext";
import withRouter from "../hoc/withRouter";

class Profile extends Form {
  static contextType = AuthContext;

  state = {
    data: {
      name: "",
      email: "",
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    errors: {},
    limits: {
      name: 30,
      email: 255,
      password: 255,
    },
    isPasswordChange: false,
  };

  componentDidMount() {
    const { user } = this.context;
    if (user) {
      this.setState({
        data: {
          name: user.name || "",
          email: user.email || "",
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        },
      });
    }
  }

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

      const updatedUser = { ...this.state.data };
      this.setState({ data: updatedUser });

      // Update the user in the context
      this.context.updateUser(updatedUser); // Call updateUser here to update context

      this.props.navigate("/"); // Redirect to the home page
    } catch (error) {
      console.log("error:", error);
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
    const { name, email, oldPassword, newPassword, confirmNewPassword } =
      this.state.data;

    return (
      <div className="container">
        <h2>Profile</h2>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("name", "Name", name)}
          {this.renderInput("email", "Email", email)}

          {/* Option to toggle password change */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={this.state.isPasswordChange}
                onChange={this.handlePasswordChangeToggle}
              />
              Change Password
            </label>
          </div>

          {/* Render password fields only if the user chooses to change password */}
          {this.state.isPasswordChange && (
            <>
              {this.renderInput(
                "oldPassword",
                "Old Password",
                oldPassword,
                "password"
              )}
              {this.renderInput(
                "newPassword",
                "New Password",
                newPassword,
                "password"
              )}
              {this.renderInput(
                "confirmNewPassword",
                "Confirm New Password",
                confirmNewPassword,
                "password"
              )}
            </>
          )}

          {this.renderButton("Update Profile")}
        </form>
      </div>
    );
  }
}

Profile.contextType = AuthContext;

export default withRouter(Profile);

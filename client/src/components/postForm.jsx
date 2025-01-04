import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { useNavigate } from "react-router-dom";
import { getUsers } from "../services/fakeUserService";

class PostForm extends Form {
  state = {
    data: {
      //userId: "",
      gameName: "",
      platform: "",
      code: "",
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
    users: [],
    errors: {},
    dropdownStates: {},
  };

  componentDidMount() {
    const users = getUsers();
    this.setState({ users });
  }

  schema = {
    //userId: Joi.string().required(),
    gameName: Joi.string().required().label("Game Name"),
    platform: Joi.string().required().label("Platform"),
    code: Joi.string().required().label("Code"),
    voiceLanguages: Joi.array()
      .items(Joi.string())
      .required()
      .label("Voice Languages"),
    subtitlesLanguages: Joi.array()
      .items(Joi.string())
      .required()
      .label("Subtitles Languages"),
  };

  doSubmit = () => {
    const { navigate } = this.props;
    //savePost(this.state.data);
    navigate("/posts", { replace: true });
  };

  render() {
    return (
      <div className="form-container">
        <h1>Create a New Post</h1>
        {this.renderGameFormContent()}
      </div>
    );
  }
}

function PostFormWithNavigate(props) {
  const navigate = useNavigate();
  return <PostForm {...props} navigate={navigate} />;
}

export default PostFormWithNavigate;

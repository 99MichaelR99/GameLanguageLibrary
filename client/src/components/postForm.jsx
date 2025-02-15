import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { renderGameFormContent } from "./gameFormContent";
import { getPost, savePost } from "../services/postService";
import withRouter from "../hoc/withRouter";

class PostForm extends Form {
  state = {
    data: {
      gameName: "",
      platform: "",
      code: "",
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
    errors: {},
    multiSelectState: {},
  };

  async componentDidMount() {
    const { params, navigate } = this.props;

    const postID = params.id; // Assume 'id' is passed as a route parameter
    if (!postID || postID === "new") return;

    try {
      const { data } = await getPost(postID);
      this.setState({ data: this.mapViewModel(data) });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        navigate("/not-found");
      }
    }
  }

  mapViewModel(post) {
    return {
      _id: post._id,
      gameName: post.gameName || "",
      platform: post.platform || "",
      code: post.code || "",
      voiceLanguages: post.voiceLanguages || [],
      subtitlesLanguages: post.subtitlesLanguages || [],
    };
  }

  schema = {
    _id: Joi.string(),
    gameName: Joi.string().required().label("Game Name"),
    platform: Joi.string()
      .required()
      .valid("PSP", "PSVITA", "PS1", "PS2", "PS3", "PS4", "PS5")
      .label("Platform"),
    code: Joi.string()
      .required()
      .label("Code")
      .regex(/^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/),
    voiceLanguages: Joi.array()
      .items(Joi.string())
      .required()
      .label("Voice Languages"),
    subtitlesLanguages: Joi.array()
      .items(Joi.string())
      .required()
      .label("Subtitles Languages"),
  };

  doSubmit = async () => {
    const { navigate } = this.props;

    try {
      await savePost(this.state.data);
      toast.success("Post saved successfully!");
      navigate("/posts", { replace: true });
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        toast.error(ex.response.data);
      }
    }
  };

  render() {
    return (
      <div className="form-container">
        <h1>Create / Update a Post</h1>
        {renderGameFormContent(this)}
      </div>
    );
  }
}

export default withRouter(PostForm);

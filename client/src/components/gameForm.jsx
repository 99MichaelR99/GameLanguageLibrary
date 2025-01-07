import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { renderGameFormContent } from "./gameFormContent";
import { getGame, saveGame } from "../services/gameService";
import { useParams, useLocation, useNavigate } from "react-router-dom";

class GameForm extends Form {
  state = {
    data: {
      gameName: "",
      platform: "",
      code: "",
      voiceLanguages: [],
      subtitlesLanguages: [],
    },
    errors: {},
    dropdownStates: {},
  };

  async componentDidMount() {
    const { /*location,*/ params, navigate } = this.props;
    //const searchParams = new URLSearchParams(location.search);
    //const gameId = searchParams.get("id");
    const gameID = params.gameID;
    const versionID = params.versionID;

    try {
      if (!gameID || gameID === "new") return;
      const { data } = await getGame(gameID);
      this.setState({ data: this.mapViewModel(data, versionID) });
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        navigate("/not-found");
      }
    }
  }

  mapViewModel(game, versionID) {
    const selectedVersion = game.versions.find(
      (version) => version._id === versionID
    );

    return {
      _id: versionID,
      gameName: game.name || "",
      platform: selectedVersion?.platform || "",
      code: selectedVersion?.code || "",
      voiceLanguages: selectedVersion?.voiceLanguages || [],
      subtitlesLanguages: selectedVersion?.subtitlesLanguages || [],
    };
  }

  schema = {
    _id: Joi.string(),
    gameName: Joi.string().required().label("Game Name"),
    platform: Joi.string().required().label("Platform"),
    code: Joi.string()
      .required()
      .label("Code")
      .regex(/^(?:\d{7}|[A-Za-z]{4}[_ ]\d{5})$/),
    voiceLanguages: Joi.array().items(Joi.string()).label("Voice Languages"),
    subtitlesLanguages: Joi.array()
      .items(Joi.string())
      .label("Subtitles Languages"),
  };

  doSubmit = async () => {
    const { params, navigate } = this.props;
    const { gameID, versionID } = params;
    const data = {
      gameID,
      versionID,
      ...this.state.data,
    };
    try {
      await saveGame(data);
      toast.success("Game saved successfully!");
      navigate("/games", { replace: true });
    } catch (error) {
      // Check if the error is due to a duplicate game code
      if (error.response && error.response.status === 400) {
        const errorMessage =
          error.response.data || "A game with this code already exists.";
        toast.error(errorMessage);
      } else {
        toast.error("An error occurred while saving the game.");
      }
    }
  };

  render() {
    const { user } = this.props;
    return (
      <div className="form-container">
        <h1>Create / Update a Game</h1>
        {renderGameFormContent(this, user)}
      </div>
    );
  }
}

// Helper function to pass router hooks to class components
function withRouter(Component) {
  return function (props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return (
      <Component
        {...props}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  };
}

export default withRouter(GameForm);

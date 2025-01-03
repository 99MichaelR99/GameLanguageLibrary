import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
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
    const versionID = params.versionId;

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

    console.log("platform", selectedVersion.platform);

    if (!selectedVersion) {
      console.warn("Version not found, returning default data");
      return {
        _id: versionID,
        gameName: game.name || "",
        platform: "",
        code: "",
        voiceLanguages: [],
        subtitlesLanguages: [],
      };
    }

    return {
      _id: versionID,
      gameName: game.name || "",
      platform: selectedVersion.platform || "",
      code: selectedVersion.code || "",
      voiceLanguages: selectedVersion.voiceLanguages || [],
      subtitlesLanguages: selectedVersion.subtitlesLanguages || [],
    };
  }

  schema = {
    gameName: Joi.string().required().label("Game Name"),
    platform: Joi.string().required().label("Platform"),
    code: Joi.string().required().label("Code"),
    voiceLanguages: Joi.array().items(Joi.string()).label("Voice Languages"),
    subtitlesLanguages: Joi.array()
      .items(Joi.string())
      .label("Subtitles Languages"),
  };

  doSubmit = () => {
    const { params, navigate } = this.props;
    const { gameID, _id } = params;
    const data = this.state.data.map((version) => ({
      gameID,
      _id,
      ...version,
    }));
    saveGame(data);
    navigate("/games", { replace: true });
  };

  render() {
    return (
      <div className="form-container">
        <h1>Create a New Game</h1>
        {this.renderGameFormContent()}
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

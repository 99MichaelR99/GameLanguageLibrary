import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getGame, saveGame } from "../services/fakeGamesService";
import { useLocation, useNavigate } from "react-router-dom";

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

  componentDidMount() {
    const { location, navigate } = this.props;
    const searchParams = new URLSearchParams(location.search);
    const gameId = searchParams.get("id");

    if (!gameId || gameId === "new") return;

    const game = getGame(gameId);
    if (!game) {
      navigate("/not-found");
      return;
    }

    this.setState({ data: this.mapViewModel(game) });
  }

  mapViewModel(game) {
    return {
      _id: game._id,
      gameName: game.name,
      platform: game.platform,
      code: game.code,
      voiceLanguages: game.voiceLanguages || [],
      subtitlesLanguages: game.subtitlesLanguages || [],
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
    const { navigate } = this.props;
    saveGame(this.state.data);
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
    return <Component {...props} location={location} navigate={navigate} />;
  };
}

export default withRouter(GameForm);

import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { renderGameFormContent } from "./gameFormContent";
import { getGame, saveGame, deleteGame } from "../services/gameService";
import { deletePost } from "../services/postService";
import AuthContext from "../context/authContext";
import withRouter from "../hoc/withRouter";

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
    multiSelectState: {},
    blueprintPostID: null,
  };

  async componentDidMount() {
    const { location, params, navigate } = this.props;
    const searchParams = new URLSearchParams(location.search);

    // Read query parameters
    const gameName = searchParams.get("gameName") || "";
    const platform = searchParams.get("platform") || "";
    const code = searchParams.get("code") || "";
    const voiceLanguages =
      searchParams
        .get("voiceLanguages")
        ?.split(",")
        .filter((lang) => lang.trim() !== "") || [];
    const subtitlesLanguages =
      searchParams
        .get("subtitlesLanguages")
        ?.split(",")
        .filter((lang) => lang.trim() !== "") || [];
    const blueprintPostID = searchParams.get("postID");

    // Populate form state with query parameters if present
    if (gameName || platform || code) {
      this.setState({
        data: {
          gameName,
          platform,
          code,
          voiceLanguages,
          subtitlesLanguages,
        },
        blueprintPostID,
      });
    }

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
    const { blueprintPostID, data } = this.state;

    try {
      // Fetch existing game if it exists
      const existingGame =
        gameID && gameID !== "new" ? (await getGame(gameID)).data : null;

      // Check if game name has changed
      const isNewGame = existingGame && existingGame.name !== data.gameName;

      if (isNewGame && existingGame) {
        // If game name has changed, delete the old game version first
        await deleteGame(existingGame._id, versionID); // Delete the old game and version
        toast.info(
          "Old version deleted. Creating a new version with updated name."
        );
      }

      // Prepare data based on whether it's a new game or update
      const updatedData = isNewGame
        ? { versionID, ...data } // Do not include gameID for new game
        : { gameID, versionID, ...data }; // Include gameID for update

      // Save the new or updated game
      await saveGame(updatedData);
      toast.success(
        isNewGame
          ? "New game created with updated name!"
          : "Game updated successfully!"
      );

      // Handle blueprint post deletion if applicable
      if (blueprintPostID) {
        await deletePost(blueprintPostID).catch((error) => {
          if (error.response?.status !== 404) {
            toast.error("An error occurred while deleting the blueprint post.");
          }
        });
        toast.info("Original blueprint post deleted.");
      }

      // Navigate to the games page
      navigate("/games", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.status === 400
          ? error.response.data || "A game with this code already exists."
          : "An error occurred while saving the game."
      );
    }
  };

  render() {
    return (
      <AuthContext.Consumer>
        {(authContext) => (
          <div className="form-container">
            <h1>Create / Update a Game</h1>
            {renderGameFormContent(this, authContext.user)}
          </div>
        )}
      </AuthContext.Consumer>
    );
  }
}

export default withRouter(GameForm);

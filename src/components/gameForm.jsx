import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const GameForm = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Game Form {code}</h1>
      <button
        className="btn btn-primary"
        onClick={() => navigate("/games")}
      >
        Save
      </button>
    </div>
  );
};

export default GameForm;

import React from "react";
import { Link } from "react-router-dom";
import "./notFoundPage.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-emoji">🤷‍♂️</div>
      <h1 className="not-found-heading">404</h1>
      <p className="not-found-message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p>
        <Link to="/" className="not-found-link">
          Go back to the homepage
        </Link>
      </p>
    </div>
  );
};

export default NotFound;

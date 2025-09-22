import React from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Corrected import
import "react-toastify/dist/ReactToastify.css";
import "./homePage.css";

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Video Games Language Library</h1>
        <p>Your go-to resource for finding and sharing video game language data!</p>
      </header>
      <section className="home-content">
        <h2>About the Site</h2>
        <p>
          GameLang Library is a platform designed to help gamers discover
          language details for different versions of their favorite games. Our
          goal is to create a comprehensive library where users can find and
          share language information, including voice and subtitle languages
          supported by each game version.
        </p>
        <p>
          On the <strong>Games</strong> page, you can explore all available
          versions of each game and check which languages they support. If you
          can’t find the exact version you're looking for, you can explore what
          other users have posted. If you notice any inaccuracies, feel free to
          contribute by adding your own game version details or reporting
          errors!
        </p>

        <div className="cta-buttons">
          <Link to="/games" className="cta-button">
            View Games Library
          </Link>
          <Link to="/posts/new" className="cta-button">
            Post Your Game Version
          </Link>
        </div>
      </section>
      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} GameLang Library. All rights reserved.
        </p>
      </footer>
      {/* Toast notifications */}
      <ToastContainer /> {/* Correct usage */}
    </div>
  );
};

export default HomePage;

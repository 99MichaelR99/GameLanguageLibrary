import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";

const NavBar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Game Language Verify
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Main navigation links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" aria-current="page" to="/games">
                Games
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/posts">
                Posts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact-us">
                Contact Us
              </NavLink>
            </li>
          </ul>

          {/* User links aligned to the right */}
          <ul className="navbar-nav ms-auto">
            {!user && [
              <li className="nav-item" key="login">
                <NavLink className="nav-link" to="/login">
                  Login
                </NavLink>
              </li>,
              <li className="nav-item" key="register">
                <NavLink className="nav-link" to="/register">
                  Registration
                </NavLink>
              </li>,
            ]}
            {user && [
              <li className="nav-item" key="me">
                <NavLink className="nav-link" to="/me">
                  {user.name}
                </NavLink>
              </li>,
              <li className="nav-item" key="logout">
                <NavLink className="nav-link" to="/logout">
                  Logout
                </NavLink>
              </li>,
            ]}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

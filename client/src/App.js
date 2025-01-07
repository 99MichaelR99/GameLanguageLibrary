import React, { Component } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import GamesPage from "./components/gamesPage";
import Versions from "./components/versionsPage";
import GameForm from "./components/gameForm";
import Posts from "./components/postsPage";
import NotFound from "./components/notFoundPage";
import ContactUs from "./components/contactUsPage";
import NavBar from "./components/navbar";
import Logout from "./components/logout.";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import PostForm from "./components/postForm";
import auth from "./services/authService";
import ProtectedRoute from "./components/common/protectedRoute";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    user: null,
  };

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    console.log(user);
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container">
          <Routes>
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/logout" element={<Logout />} />
            <Route
              path="/games/:gameID/:versionID"
              element={<ProtectedRoute element={<GameForm user={user} />} />}
            />
            <Route
              path="/games/:gameID/new"
              element={<ProtectedRoute element={<GameForm user={user} />} />}
            />
            <Route path="/games/:gameID" element={<Versions user={user} />} />
            <Route
              path="/games/new"
              element={<ProtectedRoute element={<GameForm user={user} />} />}
            />
            <Route path="/games" element={<GamesPage user={user} />} />
            <Route path="/posts/:id" element={<PostForm />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/not-found" element={<NotFound />} />
            <Route path="/" exact element={<Navigate to="/games" replace />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </main>
      </React.Fragment>
    );
  }
}

export default App;

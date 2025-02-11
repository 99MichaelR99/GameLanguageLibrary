import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "./components/homePage";
import GamesPage from "./components/gamesPage";
import Versions from "./components/versionsPage";
import GameForm from "./components/gameForm";
import PostsPage from "./components/postsPage";
import NotFound from "./components/notFoundPage";
import ContactUs from "./components/contactUsPage";
import NavBar from "./components/navbar";
import Logout from "./components/logout";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import ProfilePage from "./components/profile";
import PostForm from "./components/postForm";
import ProtectedRoute from "./components/common/protectedRoute";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    <React.Fragment>
      <ToastContainer position="bottom-left" />
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/me"
            element={<ProtectedRoute element={<ProfilePage />} />}
          />
          <Route
            path="/games/:gameID/:versionID"
            element={<ProtectedRoute element={<GameForm />} />}
          />
          <Route
            path="/games/:gameID/new"
            element={<ProtectedRoute element={<GameForm />} />}
          />
          <Route path="/games/:gameID" element={<Versions />} />
          <Route
            path="/games/new"
            element={<ProtectedRoute element={<GameForm />} />}
          />
          <Route path="/games" element={<GamesPage />} />
          <Route
            path="/posts/:id"
            element={<ProtectedRoute element={<PostForm />} />}
          />
          <Route
            path="/posts"
            element={<ProtectedRoute element={<PostsPage />} />}
          />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </main>
    </React.Fragment>
  );
};

export default App;

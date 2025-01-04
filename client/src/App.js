import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Games from "./components/gamesPage";
import Versions from "./components/versionsPage";
import GameForm from "./components/gameForm";
import Posts from "./components/postsPage";
import NotFound from "./components/notFoundPage";
import ContactUs from "./components/contactUsPage";
import NavBar from "./components/navbar";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import PostForm from "./components/postForm";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <React.Fragment>
      <ToastContainer />
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/games/:gameID/:versionId" element={<GameForm />} />
          <Route path="/games/:gameID/new" element={<GameForm />} />
          <Route path="/games/:gameID" element={<Versions />} />
          <Route path="/games/new" element={<GameForm />} />
          <Route path="/games" element={<Games />} />
          <Route path="/posts/:id" element={<PostForm />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/" exact element={<Navigate to="/games" replace />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </main>
    </React.Fragment>
  );
}

export default App;

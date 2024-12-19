import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Games from "./components/gamesPage";
import GameForm from "./components/gameForm";
import Posts from "./components/postsPage";
import NotFound from "./components/notFoundPage";
import ContactUs from "./components/contactUsPage";
import NavBar from "./components/navbar";
import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import PostForm from "./components/postForm";

function App() {
  return (
    <React.Fragment>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/games/:code" element={<GameForm />} />
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

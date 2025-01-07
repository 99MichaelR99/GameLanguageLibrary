// protectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import auth from "../../services/authService";

const ProtectedRoute = ({ element }) => {
  const user = auth.getCurrentUser();
  const location = useLocation(); // Get current location
  if (!user) {
    // Store the current location in the `state` property for the redirect
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return element;
};

export default ProtectedRoute;

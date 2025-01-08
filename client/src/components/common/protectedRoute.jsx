// protectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  const location = useLocation(); // Get current location
  if (!user) {
    // Store the current location in the `state` property for the redirect
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return element;
};

export default ProtectedRoute;

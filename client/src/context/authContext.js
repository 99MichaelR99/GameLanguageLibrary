import React, { createContext, useContext, useState, useEffect } from "react";
import auth from "../services/authService";

const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

export default AuthContext;

export const AuthProvider = ({ children }) => {
  // Function to load the page size for the current user
  const loadPageSize = (userID) => {
    if (userID) {
      const storedPageSize = localStorage.getItem(`pageSize_${userID}`);
      return storedPageSize ? parseInt(storedPageSize, 10) : 10; // Default to 10 if no page size is set
    }
    return 10; // Default page size if user is not logged in
  };

  // Initialize user directly from localStorage
  const [user, setUser] = useState(auth.getCurrentUser());
  const [pageSize, setPageSize] = useState(loadPageSize(user?._id)); // Load page size from localStorage for the user

  useEffect(() => {
    setPageSize(loadPageSize(user?._id));
  }, [user]); // Runs every time `user` changes

  // Function to save the page size for the current user
  const savePageSize = (userID, newPageSize) => {
    localStorage.setItem(`pageSize_${userID}`, newPageSize);
    setPageSize(newPageSize); // Update state as well
  };

  // Login function
  const login = async (email, password) => {
    try {
      await auth.login(email, password);
      const currentUser = auth.getCurrentUser();
      setUser(currentUser); // Update user after successful login
      setPageSize(loadPageSize(currentUser._id));
    } catch (error) {
      console.error("Login error", error);
    }
  };

  // Login with JWT token
  const loginWithJwt = (jwt) => {
    auth.loginWithJwt(jwt);
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setPageSize(loadPageSize(currentUser?._id)); // Load page size for the logged-in user
  };

  // Logout function
  const logout = () => {
    auth.logout();
    setUser(null); // Clear the user on logout
  };

  // Get JWT
  const getJwt = () => auth.getJwt();

  // Update user data
  const updateUser = (updatedUser) => setUser(updatedUser);

  // Update page size and save it in localStorage
  const updatePageSize = (newPageSize) => {
    if (user?._id) {
      savePageSize(user._id, newPageSize);
    } else {
      console.error("Cannot update pageSize: userID is undefined");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pageSize,
        login,
        loginWithJwt,
        logout,
        getJwt,
        updateUser,
        updatePageSize, // Expose updatePageSize function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easier usage
export const useAuth = () => {
  return useContext(AuthContext);
};

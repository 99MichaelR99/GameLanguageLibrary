import React, { createContext, useContext, useState } from "react";
import auth from "../services/authService";

const AuthContext = createContext();
AuthContext.displayName = "AuthContext";

export default AuthContext;

export const AuthProvider = ({ children }) => {
  // Initialize user directly from localStorage instead of delaying it
  const [user, setUser] = useState(auth.getCurrentUser());

  const login = async (email, password) => {
    try {
      await auth.login(email, password);
      const currentUser = auth.getCurrentUser();
      setUser(currentUser); // Update user after successful login
    } catch (error) {
      // Handle error (e.g., invalid credentials)
      console.error("Login error", error);
    }
  };

  const loginWithJwt = (jwt) => {
    auth.loginWithJwt(jwt);
    setUser(auth.getCurrentUser());
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const getJwt = () => auth.getJwt();

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithJwt,
        logout,
        getJwt,
        updateUser,
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

import React, { createContext, useContext, useState, useEffect } from "react";
import auth from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser); // Set user if it's available
    }
  }, []); // This effect runs only once on mount (initial load or after refresh)

  const login = async (email, password) => {
    await auth.login(email, password);
    setUser(auth.getCurrentUser());
  };

  const loginWithJwt = (jwt) => {
    auth.loginWithJwt(jwt);
    setUser(auth.getCurrentUser());
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const getJwt = () => {
    return auth.getJwt();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithJwt,
        logout,
        getJwt,
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

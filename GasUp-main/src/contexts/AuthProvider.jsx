import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const savedToken = sessionStorage.getItem("token") || localStorage.getItem("token") || null;
    return savedToken;
  });

  const [user, setUser] = useState(() => {
    const userData = sessionStorage.getItem("user") || localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("token", token);
      localStorage.setItem("token", token);
    } else {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
    }
  }, [user]);

  function login(newToken, userData) {
    setToken(newToken);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }

  function updateUser(userData) {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  }

  const isAdmin = user?.type === 0 || 
                  user?.type === "0" || 
                  user?.type === "Admin" || 
                  user?.type === "admin";

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
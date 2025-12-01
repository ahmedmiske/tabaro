// src/AuthContext.js
import PropTypes from "prop-types";
import { createContext, useState, useEffect, useContext } from "react";
import { connectSocket, getSocket } from "./socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // تحميل الحالة المحفوظة من localStorage عند بداية التطبيق
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        connectSocket(storedToken);
      }
    } catch (e) {
      console.error("Failed to load auth from localStorage", e);
    }
  }, []);

  // 🟢 تُستدعى من صفحة Login
  // نتوقع كائنًا مثل: { ...userFromBackend, token }
  const login = (userData) => {
    if (!userData) return;

    const { token: newToken, ...userInfo } = userData;

    setUser(userInfo);
    setToken(newToken || null);

    // نخزن اليوزر بدون التوكن
    localStorage.setItem("user", JSON.stringify(userInfo));

    if (newToken) {
      localStorage.setItem("token", newToken);
      connectSocket(newToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    try {
      getSocket()?.disconnect();
    } catch {}
  };

  const value = {
    user,
    token,
    isLoggedIn: !!token,
    isAdmin: user?.role === "admin",
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);

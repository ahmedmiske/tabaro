import { createContext, useState, useEffect, useContext } from 'react';
import socket, { connectSocket } from './socket'; // ✅ من src/socket.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ تحميل المستخدم من localStorage عند أول تحميل
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      connectSocket(token); // ✅ الاتصال بـ socket بالتوكن
    }
  }, []);

  // ✅ تسجيل الدخول: حفظ البيانات + اتصال socket
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token); // تأكد أن userData يحتوي على token
    connectSocket(userData.token); // ✅ الاتصال بـ socket
  };

  // ✅ تسجيل الخروج: حذف البيانات + قطع الاتصال
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    socket.disconnect(); // ✅ إغلاق الاتصال socket
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

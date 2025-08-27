// client/src/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;

  const URL =
    process.env.REACT_APP_SOCKET_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000';

  socket = io(URL, {
    path: '/socket.io',         // لازم يطابق السيرفر
    transports: ['websocket', 'polling'],
    auth: { token },            // JWT للـ auth middleware
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
  });

  return socket;
};

export const getSocket = () => socket;

export const waitUntilConnected = (timeout = 4000) =>
  new Promise((resolve) => {
    const s = connectSocket(
      JSON.parse(localStorage.getItem('user') || '{}')?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
    if (s.connected) return resolve(s);
    const t = setTimeout(() => resolve(null), timeout);
    s.once('connect', () => {
      clearTimeout(t);
      resolve(s);
    });
  });

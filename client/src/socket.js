// client/src/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  // Avoid creating a new socket while an existing one is connected or connecting
  if (socket && (socket.connected || socket.active)) {
    // Refresh token on the existing connection if changed
    if (token && socket.auth?.token !== token) {
      socket.auth = { token };
      if (!socket.connected) socket.connect();
    }
    return socket;
  }

  const URL =
    process.env.REACT_APP_SOCKET_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:5000';

  socket = io(URL, {
    path: '/socket.io', // لازم يطابق السيرفر
    transports: ['websocket', 'polling'],
    auth: { token }, // JWT للـ auth middleware
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    // Backoff for stability
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
  });

  // Basic diagnostics and error visibility
  socket.on('connect', () => {
    // console.debug('Socket connected', socket.id);
  });

  socket.on('connect_error', (err) => {
    // console.warn('Socket connect_error:', err?.message || err);
    // Optionally notify UI to handle re-auth or show toast
    // window.dispatchEvent(new CustomEvent('socket:error', { detail: err?.message || String(err) }));
  });

  socket.on('disconnect', (reason) => {
    // console.info('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

// Update token used by the socket and reconnect if needed
export const updateSocketToken = (token) => {
  if (!socket) return null;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
  return socket;
};

// Gracefully close and cleanup
export const disconnectSocket = () => {
  if (socket) {
    try { socket.removeAllListeners(); } catch {}
    socket.disconnect();
    socket = undefined;
  }
};

export const waitUntilConnected = (timeout = 4000) =>
  new Promise((resolve) => {
    const s = connectSocket(
      JSON.parse(localStorage.getItem('user') || '{}')?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken')
    );
    if (s?.connected) return resolve(s);
    const t = setTimeout(() => resolve(null), timeout);
    s.once('connect', () => {
      clearTimeout(t);
      resolve(s);
    });
  });

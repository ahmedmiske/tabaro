// src/socket.js
import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  transports: ['websocket'], // أسرع وثابت عادة
});

// استدعِ هذا بعد تسجيل الدخول/تحديث التوكن
export const connectSocket = (token) => {
  socket.auth = { token };
  try {
    socket.connect();
  } catch (e) {
    console.warn('Socket connect error:', e?.message || e);
  }
};

// تغيير التوكن أثناء عمل الجلسة (عند تجديده مثلاً)
export const setSocketAuthToken = (token) => {
  socket.auth = { token };
};

// مستمعات مفيدة للتصحيح (اختياري)
socket.on('connect', () => console.log('socket connected:', socket.id));
socket.on('disconnect', (r) => console.log('socket disconnected:', r));
socket.on('connect_error', (err) => console.warn('socket connect_error:', err?.message || err));
socket.on('error', (err) => console.warn('socket error:', err));

export default socket;

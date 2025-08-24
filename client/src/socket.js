// src/socket.js
import { io } from 'socket.io-client';

let socket = null;
let tokenInUse = null;

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const connectSocket = (token) => {
  if (!token) return null;

  // إن كان متصلًا بنفس التوكن، أرجعه كما هو
  if (socket && socket.connected && tokenInUse === token) return socket;

  // افصل أي اتصال قديم ونظّف المستمعين
  if (socket) {
    try { socket.off(); } catch {}
    try { socket.disconnect(); } catch {}
  }

  tokenInUse = token;

  // ⚠️ لا تجبر websocket فقط، اسمح بالـ polling أيضًا
socket = io(API_URL, {
  auth: { token },
  withCredentials: true,
  // اجبر polling فقط كي لا يحاول websocket وبالتالي تختفي التحذيرات
  transports: ['polling'],
  upgrade: false,          // لا تحاول الترقية إلى WebSocket
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
  timeout: 20000,
});


  // (اختياري) لوج مفيد أثناء التطوير
  socket.on('connect', () => console.log('[socket] connected', socket.id));
  socket.on('disconnect', (r) => console.log('[socket] disconnected:', r));
  socket.on('connect_error', (e) => console.warn('[socket] connect_error:', e?.message || e));

  return socket;
};

export const getSocket = () => socket;

// طبقة توافق لمن كان يستدعي default socket
const compat = {
  connect: connectSocket,
  get: getSocket,
  on: (...args) => { const s = getSocket(); if (s) s.on(...args); },
  off: (...args) => { const s = getSocket(); if (s) s.off(...args); },
  emit: (...args) => { const s = getSocket(); if (s) s.emit(...args); },
};

export default compat;

// src/socket.js
import { io } from 'socket.io-client';

let socket = null;
let tokenInUse = null;

function pickApiBase() {
  // 1) جرّب متغيرات البيئة
  const envA = process.env.REACT_APP_API_ORIGIN;
  const envB = process.env.REACT_APP_API_URL;

  // تجاهل قيم placeholder مثل "<URL>"
  const isBad = (v) => !v || /^\s*$/.test(v) || /<\s*url\s*>|<\s*URL\s*>/i.test(v);

  if (!isBad(envA)) return envA.replace(/\/+$/, '');
  if (!isBad(envB)) return envB.replace(/\/+$/, '');

  // 2) نفس أصل الصفحة إن كانت الواجهة تُدار عبر نفس الدومين/البورت proxy
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // في التطوير عادة الـ API على 5000
    const port = 5000;
    return `${protocol}//${hostname}:${port}`;
  }

  // 3) fallback نهائي
  return 'http://localhost:5000';
}

export const API_BASE = pickApiBase();

export const connectSocket = (token) => {
  // نفس الاتصال وبنفس الـ token؟ أعده
  if (socket && socket.connected && tokenInUse === token) return socket;

  // افصل القديم
  if (socket) {
    try { socket.off(); } catch {}
    try { socket.disconnect(); } catch {}
  }

  tokenInUse = token;

  socket = io(API_BASE, {
    // ✅ اسمح بالـ polling كـ fallback
    transports: ['websocket', 'polling'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    // في حال تستخدم كوكيز/سيرفر كروص حقيقي
    withCredentials: true,
  });

  // تجميع لوج مفيد: سبب فشل الاتصال (مثلاً Authentication error)
  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[socket] connect_error:', err?.message || err);
  });

  return socket;
};

export const getSocket = () => socket;

// Promise تُحلّ عند الاتصال، مع مهلة قصوى
export const waitUntilConnected = (timeoutMs = 4000) =>
  new Promise((resolve) => {
    const s = getSocket();
    if (!s) return resolve(null);
    if (s.connected) return resolve(s);

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      resolve(null);
    }, timeoutMs);

    const onConnect = () => {
      if (timedOut) return;
      clearTimeout(timer);
      s.off('connect', onConnect);
      resolve(s);
    };

    s.on('connect', onConnect);
  });

export default { connectSocket, getSocket, waitUntilConnected, API_BASE };

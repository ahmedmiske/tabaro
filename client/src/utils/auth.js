// src/utils/auth.js

// ارجع التوكن المخزّن (أياً كان المفتاح)
export const getToken = () =>
  localStorage.getItem('token') ||
  localStorage.getItem('authToken') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('token') ||
  null;

// ارجع بيانات المستخدم المخزّنة
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

// هل المستخدم مسجّل دخول؟
export const isAuthenticated = () => Boolean(getToken());

// أصل الـ API (عدّله لبيئتك)
export const API_BASE =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// يبني رابطًا مطلقًا لأي مسار ملفات (uploads)
export const assetUrl = (p = '') => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;           // رابط مطلق جاهز
  return `${API_BASE}${p.startsWith('/') ? p : `/${p}`}`;
};

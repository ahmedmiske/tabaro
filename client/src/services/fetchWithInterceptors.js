// src/services/fetchWithInterceptors.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/** تطبيع الرابط ليلتحق بالدومين عند الحاجة */
const normalizeUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;                           // http/https اتركه كما هو
  if (url.startsWith('/api') || url.startsWith('/uploads')) {          // مسارات الخادم
    return `${API_BASE}${url}`;
  }
  return url;                                                          // مسارات داخل الواجهة الأمامية
};

/** قراءة قيمة كوكي بالاسم */
const getCookie = (name) => {
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
};

/** التقاط التوكن من عدة أماكن شائعة */
const getToken = () => {
  const keys = ['token', 'authToken', 'accessToken', 'jwt', '_token'];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (typeof v === 'string' && v.split('.').length === 3) return v;
  }
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u?.token && u.token.split('.').length === 3) return u.token;
  } catch {}
  const cookieToken = getCookie('token');
  if (cookieToken && cookieToken.split('.').length === 3) return cookieToken;
  return null;
};

const fetchWithInterceptors = async (url, options = {}) => {
  const isFormData = options?.body instanceof FormData;

  // ابني الهيدر الموحّد أولاً
  const headers = new Headers(options.headers || {});
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // تمرير هوية المستخدم (اختياري للتتبّع)
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?._id && !headers.has('X-UserId')) headers.set('X-UserId', user._id);
  } catch {}

  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-cache');

  // ✅ ادمج الخيارات ثم ثبّت الهيدر النهائي حتى لا يُستبدل
  const reqInit = {
    cache: 'no-store',
    ...options,                             // خذ أي خصائص مخصّصة
    method: options.method || 'GET',
  };
  reqInit.headers = headers;                // ← اجعل هيدرنا هو النهائي

  const resp = await fetch(normalizeUrl(url), reqInit);

  // حاول قراءة الاستجابة
  let body = null;
  const ct = resp.headers.get('content-type') || '';
  try {
    body = ct.includes('application/json') ? await resp.json() : await resp.text();
  } catch {
    body = null;
  }

  // لو السيرفر أعاد توكن جديد—حدّث التخزين المحلي
  if (body && typeof body === 'object' && typeof body.token === 'string' && body.token) {
    localStorage.setItem('token', body.token);
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u) {
        u.token = body.token;
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch {}
  }

  // نفس الشيء لو أعاد كائن user مُحدّث
  if (body && typeof body === 'object' && body.user && body.user._id) {
    const merged = {
      ...(JSON.parse(localStorage.getItem('user') || '{}')),
      ...body.user,
    };
    if (body.token) merged.token = body.token;
    localStorage.setItem('user', JSON.stringify(merged));
  }

  // أخطاء HTTP
  if (!resp.ok) {
    const message = body && body.message ? body.message : `HTTP error! status: ${resp.status}`;
    const error = new Error(message);
    error.status = resp.status;
    error.body = body;
    if (resp.status === 401) console.warn('Unauthorized (401) — تأكّد من وجود التوكن.');
    throw error;
  }

  return { ok: resp.ok, status: resp.status, headers: resp.headers, body };
};

export default fetchWithInterceptors;

// src/services/fetchWithInterceptors.js
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

/** تطبيع الرابط ليلتحق بالدومين عند الحاجة */
const normalizeUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url; // http/https
  if (url.startsWith("/api") || url.startsWith("/uploads")) {
    return `${API_BASE}${url}`;
  }
  return url; // مسارات داخل الواجهة الأمامية
};

/** قراءة قيمة كوكي بالاسم */
const getCookie = (name) => {
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
};

/** التقاط التوكن من عدة أماكن شائعة */
const getToken = () => {
  const keys = ["token", "authToken", "accessToken", "jwt", "_token"];
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (typeof v === "string" && v.split(".").length === 3) return v;
  }
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.token && u.token.split(".").length === 3) return u.token;
  } catch {}
  const cookieToken = getCookie("token");
  if (cookieToken && cookieToken.split(".").length === 3) return cookieToken;
  return null;
};

/** مهلة افتراضية للطلب (ms) */
const DEFAULT_TIMEOUT = 15000;

/** يحاول تحويل أي قيمة إلى رقم موجب صالح */
const toPositiveInt = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const fetchWithInterceptors = async (url, options = {}) => {
  const isFormData = options?.body instanceof FormData;

  // ابني الهيدر الموحّد
  const headers = new Headers(options.headers || {});
  if (!isFormData && !headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // تمرير هوية المستخدم (اختياري للتتبّع)
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?._id && !headers.has("X-UserId")) headers.set("X-UserId", user._id);
  } catch {}

  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-cache");

  // مهلة الطلب
  const timeoutMs = toPositiveInt(options.timeoutMs, DEFAULT_TIMEOUT);
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(new DOMException("TimeoutError", "AbortError")), timeoutMs);

  // تهيئة الجسم للطلبات غير FormData
  let bodyInit = options.body;
  if (!isFormData && options.body && typeof options.body === "object") {
    // لو Content-Type JSON—حوّل الجسم إلى نص
    const ct = headers.get("Content-Type") || "";
    if (ct.includes("application/json")) {
      bodyInit = JSON.stringify(options.body);
    }
  }

  // ادمج الخيارات، وثبّت الهيدر
  const reqInit = {
    cache: "no-store",
    ...options,
    method: options.method || "GET",
    headers,
    body: bodyInit,
    signal: ac.signal,
  };

  let resp;
  try {
    resp = await fetch(normalizeUrl(url), reqInit);
  } catch (err) {
    clearTimeout(t);
    // أخطاء الشبكة/المهلة
    const error = new Error(err?.name === "AbortError" ? "Request timed out" : "Network error");
    error.cause = err;
    error.isNetworkError = true;
    throw error;
  } finally {
    clearTimeout(t);
  }

  // حاول قراءة الاستجابة
  let body = null;
  const ct = resp.headers.get("content-type") || "";

  try {
    if (resp.status === 204) {
      body = null;
    } else if (ct.includes("application/json")) {
      body = await resp.json();
    } else if (ct.startsWith("text/")) {
      body = await resp.text();
    } else {
      // ملفات/بلوب (صور، pdf..)
      body = await resp.blob();
      body.__isBlob = true;
    }
  } catch {
    body = null;
  }

  // لو السيرفر أعاد توكن جديد—حدّث التخزين المحلي
  if (body && typeof body === "object" && typeof body.token === "string" && body.token) {
    localStorage.setItem("token", body.token);
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u && typeof u === "object") {
        u.token = body.token;
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {}
  }

  // نفس الشيء لو أعاد كائن user مُحدّث
  if (body && typeof body === "object" && body.user && body.user._id) {
    const current = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();
    const merged = { ...current, ...body.user };
    if (body.token) merged.token = body.token;
    localStorage.setItem("user", JSON.stringify(merged));
  }

  // أخطاء HTTP
  if (!resp.ok) {
    const message =
      body && typeof body === "object" && body.message
        ? body.message
        : `HTTP error! status: ${resp.status}`;
    const error = new Error(message);
    error.status = resp.status;
    error.body = body;
    error.headers = resp.headers;
    error.url = normalizeUrl(url);
    if (resp.status === 401) {
      // خيار: يمكنك إزالة التوكن هنا أو إطلاق حدث global
      console.warn("Unauthorized (401) — تأكّد من وجود التوكن.");
    }
    throw error;
  }

  return { ok: resp.ok, status: resp.status, headers: resp.headers, body };
};

export default fetchWithInterceptors;

/* -------------------------------------------------------
   مُختصرات مريحة فوق نفس الدالة
------------------------------------------------------- */
export const get = (url, opts = {}) =>
  fetchWithInterceptors(url, { ...opts, method: "GET" });

export const post = (url, data, opts = {}) =>
  fetchWithInterceptors(url, {
    ...opts,
    method: "POST",
    body: data,
  });

export const put = (url, data, opts = {}) =>
  fetchWithInterceptors(url, {
    ...opts,
    method: "PUT",
    body: data,
  });

export const del = (url, opts = {}) =>
  fetchWithInterceptors(url, { ...opts, method: "DELETE" });

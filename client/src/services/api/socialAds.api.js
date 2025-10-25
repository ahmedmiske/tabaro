import { get, post, put } from '../../services/fetchWithInterceptors.js';

const API_BASE = '/api/social-ads';

const buildQS = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s.length) qs.append(k, s);
  });
  const q = qs.toString();
  return q ? `?${q}` : '';
};

export const listSocialAds = async (params = {}) => {
  const { body } = await get(`${API_BASE}${buildQS(params)}`);
  return body; // ← نُعيد body فقط
};

export const getSocialAd = async (id) => {
  if (!id) throw new Error('معرّف الإعلان مطلوب');
  const { body } = await get(`${API_BASE}/${id}`);
  return body;
};

export const createSocialAd = async (payload) => {
  if (!payload) throw new Error('بيانات الإنشاء مطلوبة');
  const { body } = await post(API_BASE, payload);
  return body;
};

export const updateSocialAd = async (id, payload) => {
  if (!id) throw new Error('معرّف الإعلان مطلوب للتحديث');
  const { body } = await put(`${API_BASE}/${id}`, payload);
  return body;
};

export const renewSocialAd = async (id) => {
  if (!id) throw new Error('معرّف الإعلان مطلوب للتجديد');
  const { body } = await post(`${API_BASE}/${id}/renew`, {});
  return body;
};

export const reportSocialAd = async (id, reason, comment) => {
  if (!id) throw new Error('معرّف الإعلان مطلوب للبلاغ');
  const { body } = await post(`${API_BASE}/${id}/report`, { reason, comment });
  return body;
};

export const startAdConversation = async (id) => {
  if (!id) throw new Error('معرّف الإعلان مطلوب لبدء المحادثة');
  const { body } = await post(`${API_BASE}/${id}/conversations`, {});
  return body; // قد يحتوي { id: 'convId', ... }
};

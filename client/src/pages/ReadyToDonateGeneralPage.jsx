// src/pages/ReadyToDonateGeneralPage.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiHeart } from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { GENERAL_CATEGORY_OPTIONS } from '../constants/donationCategories';

const validatePhone = (v) => /^\d{8}$/.test(v || '');

export default function ReadyToDonateGeneralPage() {
  const [form, setForm] = useState({ city:'', category:'money', note:'', phone:'', whatsapp:'' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (ev) => {
    ev.preventDefault();
    const e = {};
    if (!form.city.trim()) e.city = true;
    if (!form.category) e.category = true;
    if (!validatePhone(form.phone)) e.phone = true;
    if (!validatePhone(form.whatsapp)) e.whatsapp = true;
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      const res = await fetchWithInterceptors('/api/ready-to-donate-general', {
        method: 'POST',
        body: {
          type: 'general',
          city: form.city,
          note: form.note,
          extra: { category: form.category },
          contactMethods: [
            { method: 'phone', number: form.phone },
            { method: 'whatsapp', number: form.whatsapp }
          ]
        }
      });
      if (res?.ok) {
        setMsg('✅ تم تسجيل استعدادك للتبرع العام.');
        setForm({ city:'', category:'money', note:'', phone:'', whatsapp:'' });
        setErrors({});
      } else setMsg('❌ تعذّر الإرسال. حاول لاحقًا.');
    } catch {
      setMsg('❌ تعذّر الإرسال. حاول لاحقًا.');
    }
  };

  const heroSrc = `${process.env.PUBLIC_URL}/images/tabar6.jpg`; // ← من مجلد public

  return (
    <div className="py-4" dir="rtl">
      {/* Hero */}
      <div className="position-relative">
        <img
          src={heroSrc}
          alt="التبرع وأهميته"
          className="w-100"
          style={{ maxHeight: 300, objectFit: 'cover' }}
        />
        <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
          <h1 className="fw-bold mb-2"><FiHeart className="me-2" /> مستعد للتبرع العام</h1>
          <p className="mb-0">مساهمتك تحدث فرقًا حقيقيًا في حياة الناس.</p>
        </div>
      </div>

      <div className="contact-form-section">
        <div className="form-container">
          <div className="form-title">سجّل استعدادك</div>
          <div className="form-header">املأ البيانات التالية لتسجيل استعدادك</div>
          {msg && <Alert variant={msg.startsWith('✅') ? 'success':'danger'}>{msg}</Alert>}
          <Form onSubmit={submit}>
            <div className="form-grid">
              {/* المدينة */}
              <div className="form-field">
                <label className="form-label" htmlFor="city">المدينة</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className="form-input"
                  required
                  style={errors.city ? { borderColor: '#e53e3e' } : {}}
                  placeholder="اكتب اسم المدينة"
                />
                {errors.city && <span className="error-message">هذا الحقل مطلوب</span>}
              </div>

              {/* نوع التبرع */}
              <div className="form-field">
                <label className="form-label" htmlFor="category">نوع التبرع</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  className="form-input"
                  required
                  style={errors.category ? { borderColor: '#e53e3e' } : {}}
                >
                  {GENERAL_CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">اختر نوع التبرع</span>}
              </div>

              {/* الهاتف */}
              <div className="form-field">
                <label className="form-label" htmlFor="phone">الهاتف</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="form-input"
                  placeholder="8 أرقام"
                  style={errors.phone ? { borderColor: '#e53e3e' } : {}}
                />
                {errors.phone && <span className="error-message">رقم غير صالح</span>}
              </div>

              {/* واتساب */}
              <div className="form-field">
                <label className="form-label" htmlFor="whatsapp">واتساب</label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={onChange}
                  className="form-input"
                  placeholder="8 أرقام"
                  style={errors.whatsapp ? { borderColor: '#e53e3e' } : {}}
                />
                {errors.whatsapp && <span className="error-message">رقم غير صالح</span>}
              </div>

              {/* الملاحظة */}
              <div className="form-field full-width">
                <label className="form-label" htmlFor="note">ملاحظة (اختياري)</label>
                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="أي معلومات إضافية تريد إضافتها..."
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">تأكيد التسجيل</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

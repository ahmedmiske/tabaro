// src/pages/ReadyToDonateBloodPage.jsx
import React, { useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiDroplet, FiMapPin, FiPhone, FiMessageCircle, FiFileText, FiCheck } from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

// استيراد ملف الخلفية
import './ReadyToDonateBloodPage.css';

const placesList = [
  'ألاك', 'أمباني', 'امبود', 'آمرج', 'انتيكان', 'أوجفت', 'أطار', 'باسكنو', 'بابابي', 'باركيول',
  'بير أم أكرين', 'بوكي', 'بومديد', 'بوتلميت', 'تفرغ زينة', 'تجكجة', 'تمبدغة', 'توجنين', 'تيارت',
  'تيشيت', 'جلوار (بوغور)', 'جكني', 'دار النعيم', 'روصو', 'الرياض', 'الزويرات', 'السبخة', 'الشامي',
  'شنقيط', 'الطويل', 'الطينطان', 'عرفات', 'عدل بكرو', 'فديرك', 'كرمسين', 'كرو', 'كنكوصة', 'كوبني',
  'كيهيدي', 'كيفة', 'لكصر', 'لكصيبة', 'لعيون', 'مال', 'مقامة', 'مقطع لحجار', 'المذرذرة', 'المجرية',
  'الميناء', 'مونكل', 'نواذيبو', 'نواكشوط', 'النعمة', 'وادان', 'واد الناقة', 'ولد ينج', 'ولاتة', 'ومبو',
  'سيليبابي', 'تامشكط', 'أكجوجت'
];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'غير معروف'];
const validatePhone = (v) => /^\d{8}$/.test(v || '');

export default function ReadyToDonateBloodPage() {
  // صورة الغلاف ثابتة
  const bgUrl = '/images/tabar5.jpg';

  const [form, setForm] = useState({
    location: '',
    bloodType: '',
    note: '',
    phone: '',
    whatsapp: ''
  });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.location.trim()) e.location = true;
    if (!form.bloodType) e.bloodType = true;
    if (!validatePhone(form.phone)) e.phone = true;
    if (!validatePhone(form.whatsapp)) e.whatsapp = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      type: 'blood',
      location: form.location,
      bloodType: form.bloodType,
      note: form.note,
      contactMethods: [
        { method: 'phone', number: form.phone },
        { method: 'whatsapp', number: form.whatsapp }
      ]
    };

    try {
      await fetchWithInterceptors('/api/ready-to-donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setMsg('✅ تم تسجيل استعدادك للتبرع بالدم بنجاح.');
      setForm({ location: '', bloodType: '', note: '', phone: '', whatsapp: '' });
      setErrors({});
    } catch (err) {
      setMsg('❌ حدث خطأ أثناء الإرسال. حاول لاحقًا.');
      console.error(err);
    }
  };

  return (
     <div className="ready-general-row" dir="rtl">

      <section
        className="general-hero"
        style={{
          backgroundImage: `url(${bgUrl})`,
        }}
      >
        <div className="hero-content">
          <h1 className="fw-bold mb-2">
            <FiDroplet className="me-2" /> مستعد للتبرع بالدم
          </h1>
          <p className="mb-3">تبرّعك قد ينقذ حياة إنسان اليوم.</p>
        </div>
      </section>
      <div className="form-side">
        <div className="form-container">
          <div className="form-title">سجّل استعدادك للتبرع</div>
          <div className="form-header">املأ البيانات التالية لتسجيل استعدادك</div>
          {msg && <Alert variant={msg.startsWith('✅') ? 'success' : 'danger'} className="mb-4">{msg}</Alert>}
          <Form onSubmit={submit} className="donation-form">
            <div className="form-grid">
              {/* الموقع */}
              <div className="form-field">
                <label className="form-label" htmlFor="location">
                  <FiMapPin className="me-2" /> الموقع
                </label>
                <input
                  list="locations"
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  className="form-input"
                  required
                  style={errors.location ? { borderColor: '#e53e3e' } : {}}
                  placeholder="اكتب أو اختر المقاطعة"
                />
                <datalist id="locations">{placesList.map(p => <option key={p} value={p} />)}</datalist>
                {errors.location && <span className="error-message">هذا الحقل مطلوب</span>}
              </div>

              {/* فصيلة الدم */}
              <div className="form-field">
                <label className="form-label" htmlFor="bloodType">
                  <FiDroplet className="me-2" /> فصيلة الدم
                </label>
                <select
                  id="bloodType"
                  name="bloodType"
                  value={form.bloodType}
                  onChange={onChange}
                  className="form-input"
                  required
                  style={errors.bloodType ? { borderColor: '#e53e3e' } : {}}
                >
                  <option value="">-- اختر الفصيلة --</option>
                  {bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.bloodType && <span className="error-message">الرجاء اختيار فصيلة الدم</span>}
              </div>

              {/* الهاتف */}
              <div className="form-field">
                <label className="form-label" htmlFor="phone">
                  <FiPhone className="me-2" /> الهاتف
                </label>
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
                <label className="form-label" htmlFor="whatsapp">
                  <FiMessageCircle className="me-2" /> واتساب
                </label>
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
                <label className="form-label" htmlFor="note">
                  <FiFileText className="me-2" /> ملاحظة (اختياري)
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  className="form-textarea"
                  rows={4}
                  placeholder="أي معلومات إضافية تريد إضافتها..."
                />
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                <FiCheck className="me-2" /> تأكيد التسجيل
              </button>
            </div>
          </Form>
        </div>
    </div>
    </div>
  );
}
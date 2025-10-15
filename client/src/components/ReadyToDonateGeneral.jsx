// src/components/ReadyToDonateGeneral.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';

import fetchWithInterceptors from '../services/fetchWithInterceptors';

const validatePhone = (v) => /^\d{8}$/.test(v || '');

export default function ReadyToDonateGeneral() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    city: '',
    category: 'money',   // money | goods | time | other
    note: '',
    phone: '',
    whatsapp: ''
  });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');

  // افتح المودال تلقائيًا عند #ready-general
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#ready-general') setShow(true);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (!form.city.trim()) e.city = true;
    if (!form.category) e.category = true;
    if (!validatePhone(form.phone)) e.phone = true;
    if (!validatePhone(form.whatsapp)) e.whatsapp = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      type: 'general',
      city: form.city,
      note: form.note,
      extra: { category: form.category },
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
      setOk('✅ تم تسجيل استعدادك للتبرع العام.');
      setForm({ city:'', category:'money', note:'', phone:'', whatsapp:'' });
      setErrors({});
      setTimeout(()=>setShow(false), 900);
    } catch (err) {
      setOk('❌ تعذّر الإرسال. حاول لاحقًا.');
      console.error(err);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm p-3 d-flex align-items-center justify-content-between flex-row"
           style={{ borderRadius: 16 }}>
        <div>
          <div className="fw-bold fs-5 mb-1">زر التبرّع العام</div>
          <a href="#ready-general" className="text-decoration-underline">سجّل رغبتك بالتبرّع الآن</a>
        </div>
        <Button className="px-4 py-2" onClick={() => setShow(true)}>
          <i className="fa-regular fa-heart ms-2"></i> أنا مستعد للتبرع
        </Button>
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered dir="rtl">
        <Modal.Header closeButton><Modal.Title>استعداد للتبرع العام</Modal.Title></Modal.Header>
        <Form onSubmit={submit}>
          <Modal.Body>
            {ok && <Alert variant={ok.startsWith('✅') ? 'success' : 'danger'}>{ok}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>المدينة</Form.Label>
              <Form.Control name="city" value={form.city} onChange={onChange} isInvalid={errors.city} required />
              <Form.Control.Feedback type="invalid">هذا الحقل مطلوب</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>نوع التبرع</Form.Label>
              <Form.Select name="category" value={form.category} onChange={onChange} isInvalid={errors.category} required>
                <option value="money">مالي</option>
                <option value="goods">مواد/أغراض</option>
                <option value="time">تطوع بالوقت/الجهد</option>
                <option value="other">أخرى</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">اختر نوع التبرع</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الهاتف</Form.Label>
              <Form.Control name="phone" value={form.phone} onChange={onChange}
                            isInvalid={errors.phone} placeholder="8 أرقام" />
              <Form.Control.Feedback type="invalid">رقم غير صالح</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>واتساب</Form.Label>
              <Form.Control name="whatsapp" value={form.whatsapp} onChange={onChange}
                            isInvalid={errors.whatsapp} placeholder="8 أرقام" />
              <Form.Control.Feedback type="invalid">رقم غير صالح</Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>ملاحظة (اختياري)</Form.Label>
              <Form.Control as="textarea" rows={3} name="note" value={form.note} onChange={onChange}/>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={()=>setShow(false)}>إلغاء</Button>
            <Button type="submit">تأكيد التسجيل</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

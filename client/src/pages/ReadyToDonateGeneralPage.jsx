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

      <Container className="my-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h3 className="mb-3">سجّل استعدادك</h3>
                {msg && <Alert variant={msg.startsWith('✅') ? 'success':'danger'}>{msg}</Alert>}

                <Form onSubmit={submit}>
                  <Form.Group className="mb-3">
                    <Form.Label>المدينة</Form.Label>
                    <Form.Control name="city" value={form.city} onChange={onChange} isInvalid={errors.city} required />
                    <Form.Control.Feedback type="invalid">هذا الحقل مطلوب</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>نوع التبرع</Form.Label>
                    <Form.Select name="category" value={form.category} onChange={onChange} isInvalid={errors.category} required>
                      {GENERAL_CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">اختر نوع التبرع</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>الهاتف</Form.Label>
                        <Form.Control name="phone" value={form.phone} onChange={onChange} isInvalid={errors.phone} placeholder="8 أرقام" />
                        <Form.Control.Feedback type="invalid">رقم غير صالح</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>واتساب</Form.Label>
                        <Form.Control name="whatsapp" value={form.whatsapp} onChange={onChange} isInvalid={errors.whatsapp} placeholder="8 أرقام" />
                        <Form.Control.Feedback type="invalid">رقم غير صالح</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>ملاحظة (اختياري)</Form.Label>
                    <Form.Control as="textarea" rows={3} name="note" value={form.note} onChange={onChange} />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button type="submit">تأكيد التسجيل</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

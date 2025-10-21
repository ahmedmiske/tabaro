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
  // اختر صورة الغلاف (ثابتة أو عشوائية من مجلد public/images)
  const bgCandidates = useMemo(() => [
    '/images/tabar4.jpg',
    '/images/tabar6.jpg',
    '/images/tabar5.jpg',
    '/images/fundo-about.png'
  ], []);
  const bgUrl = useMemo(() => bgCandidates[0], [bgCandidates]); // لو حابب عشوائي: bgCandidates[Math.floor(Math.random()*bgCandidates.length)]

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
    <div className="py-4" dir="rtl">
      {/* HERO مع خلفية قابلة للتبديل عبر CSS var */}
      <section className="blood-hero" style={{ '--bg': `url(${bgUrl})` }}>
        <div className="hero-content">
          <h1 className="fw-bold mb-2">
            <FiDroplet className="me-2" /> مستعد للتبرع بالدم
          </h1>
          <p>تبرّعك قد ينقذ حياة إنسان اليوم.</p>
        </div>
      </section>

      <Container className="my-5">
        <Row className="justify-content-center">
          <Col lg={8} xl={7}>
            <Card className="donation-form-card border-0 shadow-lg">
              <Card.Header className="donation-form-header text-center py-4">
                <div className="header-icon">
                  <FiDroplet />
                </div>
                <h3 className="mb-0 text-white">سجّل استعدادك للتبرع</h3>
                <p className="text-white-50 mb-0 mt-2">املأ البيانات التالية لتسجيل استعدادك</p>
              </Card.Header>

              <Card.Body className="p-4 p-md-5" id="ready-form">
                {msg && <Alert variant={msg.startsWith('✅') ? 'success' : 'danger'} className="mb-4">{msg}</Alert>}

                <Form onSubmit={submit} className="donation-form">
                  {/* الموقع */}
                  <Form.Group className="mb-4 form-group-custom">
                    <Form.Label className="form-label-custom">
                      <FiMapPin className="me-2" />
                      الموقع
                    </Form.Label>
                    <div className="input-group-custom">
                      <Form.Control
                        list="locations"
                        name="location"
                        value={form.location}
                        onChange={onChange}
                        isInvalid={errors.location}
                        placeholder="اكتب أو اختر المقاطعة"
                        className="form-control-custom"
                        required
                      />
                      <datalist id="locations">{placesList.map(p => <option key={p} value={p} />)}</datalist>
                      <Form.Control.Feedback type="invalid" className="feedback-custom">
                        هذا الحقل مطلوب
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  {/* فصيلة الدم */}
                  <Form.Group className="mb-4 form-group-custom">
                    <Form.Label className="form-label-custom">
                      <FiDroplet className="me-2" />
                      فصيلة الدم
                    </Form.Label>
                    <div className="input-group-custom">
                      <Form.Select
                        name="bloodType"
                        value={form.bloodType}
                        onChange={onChange}
                        isInvalid={errors.bloodType}
                        className="form-control-custom"
                        required
                      >
                        <option value="">-- اختر الفصيلة --</option>
                        {bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid" className="feedback-custom">
                        الرجاء اختيار فصيلة الدم
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>

                  {/* أرقام التواصل */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4 form-group-custom">
                        <Form.Label className="form-label-custom">
                          <FiPhone className="me-2" />
                          الهاتف
                        </Form.Label>
                        <div className="input-group-custom">
                          <Form.Control
                            name="phone"
                            value={form.phone}
                            onChange={onChange}
                            isInvalid={errors.phone}
                            placeholder="8 أرقام"
                            className="form-control-custom"
                          />
                          <Form.Control.Feedback type="invalid" className="feedback-custom">
                            رقم غير صالح
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4 form-group-custom">
                        <Form.Label className="form-label-custom">
                          <FiMessageCircle className="me-2" />
                          واتساب
                        </Form.Label>
                        <div className="input-group-custom">
                          <Form.Control
                            name="whatsapp"
                            value={form.whatsapp}
                            onChange={onChange}
                            isInvalid={errors.whatsapp}
                            placeholder="8 أرقام"
                            className="form-control-custom"
                          />
                          <Form.Control.Feedback type="invalid" className="feedback-custom">
                            رقم غير صالح
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* الملاحظة */}
                  <Form.Group className="mb-4 form-group-custom">
                    <Form.Label className="form-label-custom">
                      <FiFileText className="me-2" />
                      ملاحظة (اختياري)
                    </Form.Label>
                    <div className="input-group-custom">
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="note"
                        value={form.note}
                        onChange={onChange}
                        className="form-control-custom"
                        placeholder="أي معلومات إضافية تريد إضافتها..."
                      />
                    </div>
                  </Form.Group>

                  {/* زر الإرسال */}
                  <div className="d-flex justify-content-center mt-4">
                    <Button type="submit" className="submit-btn-custom">
                      <FiCheck className="me-2" />
                      تأكيد التسجيل
                    </Button>
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
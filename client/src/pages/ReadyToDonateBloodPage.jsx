import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiDroplet } from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const placesList = [
  'ألاك','أمباني','امبود','آمرج','انتيكان','أوجفت','أطار','باسكنو','بابابي','باركيول',
  'بير أم أكرين','بوكي','بومديد','بوتلميت','تفرغ زينة','تجكجة','تمبدغة','توجنين','تيارت',
  'تيشيت','جلوار (بوغور)','جكني','دار النعيم','روصو','الرياض','الزويرات','السبخة','الشامي',
  'شنقيط','الطويل','الطينطان','عرفات','عدل بكرو','فديرك','كرمسين','كرو','كنكوصة','كوبني',
  'كيهيدي','كيفة','لكصر','لكصيبة','لعيون','مال','مقامة','مقطع لحجار','المذرذرة','المجرية',
  'الميناء','مونكل','نواذيبو','نواكشوط','النعمة','وادان','واد الناقة','ولد ينج','ولاتة','ومبو',
  'سيليبابي','تامشكط','أكجوجت'
];
const bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-','غير معروف'];
const validatePhone = (v) => /^\d{8}$/.test(v || '');

export default function ReadyToDonateBloodPage() {
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
      setForm({ location:'', bloodType:'', note:'', phone:'', whatsapp:'' });
      setErrors({});
    } catch (err) {
      setMsg('❌ حدث خطأ أثناء الإرسال. حاول لاحقًا.');
      console.error(err);
    }
  };

  return (
    <div className="py-4" dir="rtl">
      {/* Hero */}
      <div className="position-relative">
        <img src="/images/ready-blood.jpg" alt="التبرع بالدم" className="w-100" style={{ maxHeight: 300, objectFit: 'cover' }} />
        <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
          <h1 className="fw-bold mb-2"><FiDroplet className="me-2" /> مستعد للتبرع بالدم</h1>
          <p className="mb-0">تبرّعك قد ينقذ حياة إنسان اليوم.</p>
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
                    <Form.Label>الموقع</Form.Label>
                    <Form.Control
                      list="locations"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      isInvalid={errors.location}
                      placeholder="اكتب أو اختر المقاطعة"
                      required
                    />
                    <datalist id="locations">{placesList.map(p => <option key={p} value={p} />)}</datalist>
                    <Form.Control.Feedback type="invalid">هذا الحقل مطلوب</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>فصيلة الدم</Form.Label>
                    <Form.Select name="bloodType" value={form.bloodType} onChange={onChange} isInvalid={errors.bloodType} required>
                      <option value="">-- اختر الفصيلة --</option>
                      {bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">الرجاء اختيار فصيلة الدم</Form.Control.Feedback>
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

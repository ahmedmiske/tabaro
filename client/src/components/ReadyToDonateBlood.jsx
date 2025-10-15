// src/components/ReadyToDonateBlood.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';

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

export default function ReadyToDonateBlood() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    location: '',
    bloodType: '',
    note: '',
    phone: '',
    whatsapp: ''
  });
  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');

  // افتح المودال تلقائيًا عند #ready-blood
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#ready-blood') setShow(true);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

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
      setOk('✅ تم تسجيل استعدادك للتبرع بالدم بنجاح.');
      setForm({ location:'', bloodType:'', note:'', phone:'', whatsapp:'' });
      setErrors({});
      setTimeout(()=>setShow(false), 900);
    } catch (err) {
      setOk('❌ حدث خطأ أثناء الإرسال. حاول لاحقًا.');
      console.error(err);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm p-3 d-flex align-items-center justify-content-between flex-row"
           style={{ borderRadius: 16 }}>
        <div>
          <div className="fw-bold fs-5 mb-1">زر التبرّع بالدم</div>
          <a href="#ready-blood" className="text-decoration-underline">سجّل رغبتك بالتبرّع الآن</a>
        </div>
        <Button className="px-4 py-2" onClick={() => setShow(true)}>
          <i className="fa-solid fa-droplet ms-2"></i> أنا مستعد للتبرع
        </Button>
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered dir="rtl">
        <Modal.Header closeButton><Modal.Title>استعداد للتبرع بالدم</Modal.Title></Modal.Header>
        <Form onSubmit={submit}>
          <Modal.Body>
            {ok && <Alert variant={ok.startsWith('✅') ? 'success' : 'danger'}>{ok}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label>الموقع</Form.Label>
              <Form.Control list="ready-locations" name="location" value={form.location}
                            onChange={onChange} isInvalid={errors.location} required/>
              <datalist id="ready-locations">
                {placesList.map(p => <option key={p} value={p} />)}
              </datalist>
              <Form.Control.Feedback type="invalid">هذا الحقل مطلوب</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>فصيلة الدم</Form.Label>
              <Form.Select name="bloodType" value={form.bloodType}
                           onChange={onChange} isInvalid={errors.bloodType} required>
                <option value="">-- اختر الفصيلة --</option>
                {bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">الرجاء اختيار فصيلة الدم</Form.Control.Feedback>
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

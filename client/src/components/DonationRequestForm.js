// src/pages/DonationRequestForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Button, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap';
import './DonationRequestForm.css';
import { useNavigate } from 'react-router-dom';

const DonationRequestForm = () => {
  const navigate = useNavigate();

  const [donation, setDonation] = useState({
    category: '',
    type: '',
    description: '',
    place: '',
    amount: '',
    paymentMethods: [],   // [{method, phone}]
    contactMethods: [],   // [{method, number}]
    deadline: '',
    isUrgent: false,
    bloodType: '',
    proofDocuments: [],   // Files فقط للواجهة
    date: new Date().toISOString()
  });

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ paymentPhones: {}, contactNumbers: {} });

  const categories = {
    "الصحة": [ "أدوية", "معدات طبية"],
    "التعليم": ["لوازم مدرسية", "منح دراسية", "دروس خصوصية"],
    "السكن": ["إيجار عاجل", "إعادة بناء", "أثاث"],
    "الكوارث الطبيعية": ["إغاثة عاجلة", "مساعدة متضررين"],
    "الإعلانات الاجتماعية": ["البحث عن مفقود", "إيجاد ممتلكات ضائعة", "إعلانات تبادل المساعدات"]
  };
  const paymentOptions = ["Bankily", "Masrifi", "Sadad", "bim-bank"];
  const contactOptions = ["phone", "whatsapp"];
  const placesList = ['نواكشوط','نواذيبو','روصو','الزويرات','أطار','تمبدغه','كرو','كيهيدي','ألاك','سيلبابي'];

  const validatePhoneNumber = (v) => /^\d{8}$/.test(v || '');
  const socialAds = categories["الإعلانات الاجتماعية"];
  const isFinancial = useMemo(() => donation.type && !socialAds.includes(donation.type), [donation.type]);
  const isStep1Valid = useMemo(() => donation.category && donation.type, [donation.category, donation.type]);

  const contactsValid = useMemo(
    () => donation.contactMethods.every(c => !c.number || validatePhoneNumber(c.number)),
    [donation.contactMethods]
  );

  const paymentsValid = useMemo(() => {
    if (!isFinancial) return true;
    if (!donation.paymentMethods.length) return false;
    const phonesOk = donation.paymentMethods.every(p => validatePhoneNumber(p.phone));
    const amountOk = Number(donation.amount) > 0;
    return phonesOk && amountOk;
  }, [donation.paymentMethods, donation.amount, isFinancial]);

  const displayedStep = !isFinancial && step >= 4 ? step - 1 : step;

  const minDeadline = useMemo(() => {
    const d = new Date(); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('donationRequestDraft');
    if (saved) {
      try { setDonation(prev => ({ ...prev, ...JSON.parse(saved), proofDocuments: [] })); } catch {}
    }
  }, []);
  useEffect(() => {
    const { proofDocuments, ...rest } = donation;
    localStorage.setItem('donationRequestDraft', JSON.stringify(rest));
  }, [donation]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonation(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleCategoryChange = (e) => setDonation(prev => ({ ...prev, category: e.target.value, type: '' }));
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setDonation(prev => ({ ...prev, proofDocuments: [...prev.proofDocuments, ...files] }));
  };
  const handleRemoveFile = (index) => {
    setDonation(prev => ({ ...prev, proofDocuments: prev.proofDocuments.filter((_, i) => i !== index) }));
  };
  const togglePaymentMethod = (method, checked) => {
    setDonation(prev => {
      const current = [...prev.paymentMethods];
      if (checked) {
        if (!current.find(m => m.method === method)) current.push({ method, phone: '' });
      } else {
        return { ...prev, paymentMethods: current.filter(m => m.method !== method) };
      }
      return { ...prev, paymentMethods: current };
    });
  };
  const toggleContactMethod = (method, checked) => {
    setDonation(prev => {
      const current = [...prev.contactMethods];
      if (checked) {
        if (!current.find(m => m.method === method)) current.push({ method, number: '' });
      } else {
        return { ...prev, contactMethods: current.filter(m => m.method !== method) };
      }
      return { ...prev, contactMethods: current };
    });
  };

  const goNext = () => {
    let s = step + 1;
    if (!isFinancial && s === 3) s = 4;
    setStep(Math.min(s, isFinancial ? 5 : 4));
  };
  const goPrev = () => {
    let s = step - 1;
    if (!isFinancial && s === 3) s = 2;
    setStep(Math.max(s, 1));
  };

  // 🔎 دالة تلتقط أي JWT من التخزين (حتى لو داخل JSON)
  const findAnyJWT = () => {
    const isJWT = (v) => typeof v === 'string' && v.includes('.') && v.split('.').length === 3;
    const scanStore = (store) => {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        const val = store.getItem(k);
        if (isJWT(val)) return val;
        try {
          const parsed = JSON.parse(val);
          // ابحث داخل الكائن عن أي قيمة تبدو JWT
          const stack = [parsed];
          while (stack.length) {
            const cur = stack.pop();
            if (typeof cur === 'string' && isJWT(cur)) return cur;
            if (cur && typeof cur === 'object') {
              for (const v of Object.values(cur)) stack.push(v);
            }
          }
        } catch { /* ignore */ }
      }
      return null;
    };
    return (
      scanStore(localStorage) ||
      scanStore(sessionStorage)
    );
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  let hasError = false;
  const newPaymentErrors = {};
  const newContactErrors = {};

  donation.paymentMethods.forEach(({ method, phone }) => {
    if (isFinancial && !validatePhoneNumber(phone)) { newPaymentErrors[method] = true; hasError = true; }
  });
  donation.contactMethods.forEach(({ method, number }) => {
    if (number && !validatePhoneNumber(number)) { newContactErrors[method] = true; hasError = true; }
  });
  setErrors({ paymentPhones: newPaymentErrors, contactNumbers: newContactErrors });

  if (!donation.place) { hasError = true; alert('الرجاء اختيار/كتابة اسم المكان.'); }
  if (isFinancial && !(Number(donation.amount) > 0)) { hasError = true; alert('الرجاء إدخال المبلغ المطلوب.'); }
  if (isFinancial && !donation.paymentMethods.length) { hasError = true; alert('اختر وسيلة دفع واحدة على الأقل.'); }
  if (!contactsValid) { hasError = true; }

  if (hasError) return;

  // ✅ نرسل contactMethods/paymentMethods كـ JSON (مثل التبرع بالدم)
  const fd = new FormData();
  fd.append('category', donation.category);
  fd.append('type', donation.type);
  fd.append('description', donation.description || '');
  fd.append('place', donation.place || '');
  fd.append('deadline', donation.deadline || '');
  fd.append('isUrgent', donation.isUrgent ? 'true' : 'false');
  fd.append('amount', donation.amount || '');
  fd.append('bloodType', donation.bloodType || '');

  // نرشّح العناصر الفارغة فقط للاحتياط
  const cleanContacts = donation.contactMethods
    .filter(x => x && (x.method || x.number));
  const cleanPayments = donation.paymentMethods
    .filter(x => x && (x.method || x.phone));

  fd.append('contactMethods', JSON.stringify(cleanContacts));
  fd.append('paymentMethods', JSON.stringify(cleanPayments));

  donation.proofDocuments.forEach(file => fd.append('files', file));

  try {
    setSubmitting(true);

    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('token') || '';

    if (!token) {
      alert('غير مصرّح. سجّل الدخول.');
      setSubmitting(false);
      return;
    }

    let userId = '';
    try { userId = (JSON.parse(localStorage.getItem('user') || '{}')._id) || ''; } catch {}

    const resp = await fetch('/api/donationRequests', {
      method: 'POST',
      body: fd, // لا تضع Content-Type يدوياً
      headers: {
        Authorization: `Bearer ${token}`,
        'x-auth-token': token,
        'x-access-token': token,
        ...(userId ? { 'X-UserId': userId } : {}),
      },
    });

    const ct = resp.headers.get('content-type') || '';
    const body = ct.includes('application/json') ? await resp.json() : await resp.text();

    if (!resp.ok) {
      const msg = (body && body.message) ? body.message : `HTTP error! status: ${resp.status}`;
      throw new Error(msg);
    }

    const created = body?.data;
    localStorage.removeItem('donationRequestDraft');

    if (created?._id) navigate(`/donations/${created._id}`);
    else alert(body?.message || 'تم إنشاء الطلب بنجاح');
  } catch (err) {
    console.error(err);
    alert(err.message || 'حدث خطأ أثناء الإرسال');
  } finally {
    setSubmitting(false);
  }
};


  const renderFilePreview = (file) => {
    if (!file) return null;
    if (file.type && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return <img alt={file.name} src={url} style={{ maxHeight: 60, maxWidth: 80, objectFit: 'cover', borderRadius: 6 }} onLoad={() => URL.revokeObjectURL(url)} />;
    }
    return <span>{file.name}</span>;
  };

  return (
    <div className="donation-form-container">
      <h2>طلب تبرع جديد</h2>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${(displayedStep / (isFinancial ? 5 : 4)) * 100}%` }} />
        <span className="progress-text">{`الخطوة ${displayedStep} من ${isFinancial ? 5 : 4}`}</span>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* 1) المجال/النوع/الوصف */}
        {step === 1 && (
          <>
            <Form.Group>
              <Form.Label>اختر المجال</Form.Label>
              <Form.Control as="select" name="category" value={donation.category} onChange={handleCategoryChange} required>
                <option value="">-- اختر --</option>
                {Object.keys(categories).map(c => (<option key={c} value={c}>{c}</option>))}
              </Form.Control>
            </Form.Group>

            {donation.category && (
              <Form.Group>
                <Form.Label>اختر نوع التبرع</Form.Label>
                <Form.Control as="select" name="type" value={donation.type} onChange={handleChange} required>
                  <option value="">-- اختر النوع --</option>
                  {categories[donation.category].map(t => (<option key={t} value={t}>{t}</option>))}
                </Form.Control>
              </Form.Group>
            )}

            <Form.Group>
              <Form.Label>وصف الحالة</Form.Label>
              <Form.Control as="textarea" name="description" value={donation.description} onChange={handleChange} placeholder="أدخل وصفًا مختصرًا للحالة أو الاحتياج" />
            </Form.Group>
          </>
        )}

        {/* 2) المكان + وسائل التواصل */}
        {step === 2 && (
          <>
            <Form.Group>
              <Form.Label>الموقع (اسم المكان)</Form.Label>
              <Form.Control list="places" name="place" value={donation.place} onChange={handleChange} placeholder="اكتب أو اختر اسم المكان" required />
              <datalist id="places">{placesList.map(p => <option key={p} value={p} />)}</datalist>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>وسائل التواصل</Form.Label>
              {contactOptions.map(method => {
                const selected = donation.contactMethods.find(m => m.method === method);
                const label = method === 'phone' ? 'هاتف' : 'واتساب';
                return (
                  <div key={method} className="mb-2">
                    <Form.Check type="checkbox" label={label} checked={!!selected} onChange={(e) => toggleContactMethod(method, e.target.checked)} />
                    {selected && (
                      <>
                        <Form.Control
                          type="text"
                          placeholder={`رقم ${label} (8 أرقام)`}
                          value={selected.number}
                          isInvalid={!!errors.contactNumbers[method]}
                          onChange={(e) => {
                            const number = e.target.value;
                            setDonation(prev => ({
                              ...prev,
                              contactMethods: prev.contactMethods.map(m => m.method === method ? { ...m, number } : m)
                            }));
                          }}
                        />
                        {errors.contactNumbers[method] && <div className="invalid-feedback d-block">الرقم يجب أن يتكون من 8 أرقام.</div>}
                      </>
                    )}
                  </div>
                );
              })}
            </Form.Group>
          </>
        )}

        {/* 3) المبلغ + وسائل الدفع (مالية فقط) */}
        {step === 3 && isFinancial && (
          <>
            <Form.Group>
              <Form.Label>المبلغ المطلوب</Form.Label>
              <Form.Control type="number" name="amount" value={donation.amount} onChange={handleChange} min="1" />
            </Form.Group>

            <Form.Group>
              <Form.Label>وسائل الدفع</Form.Label>
              {paymentOptions.map(method => {
                const selected = donation.paymentMethods.find(m => m.method === method);
                return (
                  <div key={method} className="mb-2">
                    <Form.Check type="checkbox" label={method} checked={!!selected} onChange={(e) => togglePaymentMethod(method, e.target.checked)} />
                    {selected && (
                      <>
                        <Form.Control
                          type="text"
                          placeholder={`رقم هاتف ${method} (8 أرقام)`}
                          value={selected.phone}
                          isInvalid={!!errors.paymentPhones[method]}
                          onChange={(e) => {
                            const phone = e.target.value;
                            setDonation(prev => ({
                              ...prev,
                              paymentMethods: prev.paymentMethods.map(m => m.method === method ? { ...m, phone } : m)
                            }));
                          }}
                        />
                        {errors.paymentPhones[method] && <div className="invalid-feedback d-block">الرقم يجب أن يتكون من 8 أرقام.</div>}
                      </>
                    )}
                  </div>
                );
              })}
              {!paymentsValid && <div className="text-danger mt-1">أدخل المبلغ واختر وسيلة دفع واحدة على الأقل مع رقم صحيح.</div>}
            </Form.Group>
          </>
        )}

        {/* 4) التاريخ + الاستعجال */}
        {((step === 4) || (!isFinancial && step === 3)) && (
          <div className="row">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>آخر مهلة (اختياري)</Form.Label>
                <Form.Control type="date" name="deadline" value={donation.deadline} min={minDeadline} onChange={handleChange} />
              </Form.Group>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <Form.Group>
                <Form.Check type="checkbox" label="طلب مستعجل" name="isUrgent" checked={donation.isUrgent} onChange={handleChange} />
              </Form.Group>
            </div>
          </div>
        )}

        {/* 5) الملفات */}
        {((step === 5) || (!isFinancial && step === 4)) && (
          <>
            <Form.Group>
              <div className="d-flex justify-content-between">
                <Form.Label>وثائق داعمة</Form.Label>
                <small className="text-muted">PDF أو صور</small>
              </div>
              <Form.Control type="file" multiple accept=".pdf,image/*" onChange={handleFileUpload} />
              <ListGroup className="mt-2">
                {donation.proofDocuments.map((file, idx) => (
                  <ListGroupItem key={idx} className="d-flex justify-content-between align-items-center">
                    <span>{file.name}</span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveFile(idx)}>حذف</Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Form.Group>
          </>
        )}

        {/* أزرار */}
        <div className="action-buttons mt-3 d-flex gap-2">
          {displayedStep > 1 && (
            <Button variant="secondary" onClick={goPrev} disabled={submitting}>السابق</Button>
          )}
          {displayedStep < (isFinancial ? 5 : 4) && (
            <Button
              variant="primary"
              onClick={goNext}
              disabled={
                submitting ||
                (step === 1 && !isStep1Valid) ||
                (step === 2 && (!donation.place || !contactsValid)) ||
                (step === 3 && isFinancial && !paymentsValid)
              }
            >
              التالي
            </Button>
          )}
          {displayedStep === (isFinancial ? 5 : 4) && (
            <Button type="submit" variant="success" disabled={submitting}>
              {submitting ? (<><Spinner size="sm" className="me-2" /> جارٍ الإرسال...</>) : 'إرسال'}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default DonationRequestForm;

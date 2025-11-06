// src/components/DonationRequestForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Button, ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import './DonationRequestForm.css';
import TitleMain from './TitleMain.jsx';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

/**
 * ✅ التحقق من رقم موريتاني محلي:
 * - 8 أرقام بالضبط
 * - يبدأ بـ 2 أو 3 أو 4
 */
const validatePhoneNumberMR = (v) => {
  if (!v) return false;
  const trimmed = v.trim();
  return /^(2|3|4)\d{7}$/.test(trimmed);
};

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];

const MAX_FILE_MB = 10;

const isAllowed = (f) =>
  f &&
  ALLOWED_FILE_TYPES.includes(f.type) &&
  f.size <= MAX_FILE_MB * 1024 * 1024;

const DonationRequestForm = () => {
  const navigate = useNavigate();

  // تحديث الـ <title>
  useEffect(() => {
    document.title = 'طلب تبرع عام - تبارو';
    return () => {
      document.title = 'تبارو - منصة التبرعات';
    };
  }, []);

  // الحالة الرئيسية للنموذج
  const [donation, setDonation] = useState({
    category: '',
    type: '',
    description: '',
    place: '',
    amount: '',
    paymentMethods: [], // [{ method, phone }]
    contactMethods: [], // [{ method, number }]
    deadline: '',
    isUrgent: false,
    bloodType: '',
    proofDocuments: [], // ملفات مرفقة (واجهة فقط - مش محفوظة في localStorage)
    date: new Date().toISOString(),
  });

  // التحكم في الخطوات
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // أخطاء التحقق لأرقام الدفع/التواصل
  const [errors, setErrors] = useState({
    paymentPhones: {},
    contactNumbers: {},
  });

  // رسالة خطأ رفع الملفات (غير حاسمة)
  const [fileError, setFileError] = useState('');

  // تصنيفات وأنواع التبرع
  const categories = {
    الصحة: ['أدوية', 'معدات طبية'],
    التعليم: ['لوازم مدرسية', 'منح دراسية', 'دروس خصوصية'],
    السكن: ['إيجار عاجل', 'إعادة بناء', 'أثاث'],
    'الكوارث الطبيعية': ['إغاثة عاجلة', 'مساعدة متضررين'],
    'الإعلانات الاجتماعية': [
      'البحث عن مفقود',
      'إيجاد ممتلكات ضائعة',
      'إعلانات تبادل المساعدات',
    ],
  };

  // خيارات وسائل الدفع (للنوع المالي)
  const paymentOptions = ['Bankily', 'Masrifi', 'Sadad', 'bim-bank'];

  // خيارات وسائل التواصل
  const contactOptions = ['phone', 'whatsapp'];

  // قائمة الأماكن/المدن
  const placesList = [
    'ألاك',
    'أمباني',
    'امبود',
    'آمرج',
    'انتيكان',
    'أوجفت',
    'أطار',
    'باسكنو',
    'بابابي',
    'باركيول',
    'بير أم أكرين',
    'بوكي',
    'بومديد',
    'بوتلميت',
    'تفرغ زينة',
    'تجكجة',
    'تمبدغة',
    'توجنين',
    'تيارت',
    'تيشيت',
    'جلوار (بوغور)',
    'جكني',
    'دار النعيم',
    'روصو',
    'الرياض',
    'الزويرات',
    'السبخة',
    'الشامي',
    'شنقيط',
    'الطويل',
    'الطينطان',
    'عرفات',
    'عدل بكرو',
    'فديرك',
    'كرمسين',
    'كرو',
    'كنكوصة',
    'كوبني',
    'كيهيدي',
    'كيفة',
    'لكصر',
    'لكصيبة',
    'لعيون',
    'مال',
    'مقامة',
    'مقطع لحجار',
    'المذرذرة',
    'المجرية',
    'الميناء',
    'مونكل',
    'نواذيبو',
    'نواكشوط',
    'النعمة',
    'وادان',
    'واد الناقة',
    'ولد ينج',
    'ولاتة',
    'ومبو',
    'سيليبابي',
    'تامشكط',
    'أكجوجت',
  ];

  // هل نوع الطلب مالي؟ (غير إعلاني اجتماعي)
  const socialAds = categories['الإعلانات الاجتماعية'];
  const isFinancial = useMemo(
    () => donation.type && !socialAds.includes(donation.type),
    [donation.type, socialAds]
  );

  // التحقق: الخطوة 1 تحتاج category و type
  const isStep1Valid = useMemo(
    () => !!donation.category && !!donation.type,
    [donation.category, donation.type]
  );

  // التحقق: لازم على الأقل وسيلة تواصل واحدة تحتوي على رقم موريتاني صحيح
  const contactsValid = useMemo(
    () =>
      donation.contactMethods.some((c) =>
        validatePhoneNumberMR(c.number)
      ),
    [donation.contactMethods]
  );

  // التحقق: لو الطلب مالي
  // - لازم مبلغ
  // - لازم وسيلة دفع واحدة عالأقل
  // - كل وسيلة دفع لازم رقم موريتاني صحيح
  const paymentsValid = useMemo(() => {
    if (!isFinancial) return true;
    if (!donation.paymentMethods.length) return false;

    const phonesOk = donation.paymentMethods.every((p) =>
      validatePhoneNumberMR(p.phone)
    );
    const amountOk = Number(donation.amount) > 0;

    return phonesOk && amountOk;
  }, [donation.paymentMethods, donation.amount, isFinancial]);

  // معلومات الـ UI لكل خطوة
  const stepInfo = {
    1: {
      title: 'نوع التبرع والوصف',
      description: 'اختر المجال ونوع التبرع واكتب الوصف',
      icon: '📋',
    },
    2: {
      title: 'الموقع والتواصل',
      description: 'حدد المكان وأرقام التواصل',
      icon: '📍',
    },
    3: {
      title: 'التفاصيل المالية',
      description: 'المبلغ وطرق الدفع (للطلبات المالية)',
      icon: '💰',
    },
    4: {
      title: 'الموعد والمراجعة',
      description: 'حدد الموعد النهائي وراجع الطلب',
      icon: '⏰',
    },
  };

  // عدد الخطوات الحقيقي حسب نوع الطلب
  const totalSteps = isFinancial ? 4 : 3;
  const displayedStep = Math.min(step, totalSteps);

  // تاريخ أقل للـ deadline
  const minDeadline = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  // 📝 استرجاع المسودة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('donationRequestDraft');
    if (saved) {
      try {
        setDonation((prev) => ({
          ...prev,
          ...JSON.parse(saved),
          proofDocuments: [], // ما نسترجع الملفات
        }));
      } catch {
        // تجاهل JSON معطوب
      }
    }
  }, []);

  // 📝 حفظ المسودة أوتوماتيكياً (بدون الملفات)
  useEffect(() => {
    const { proofDocuments, ...rest } = donation;
    localStorage.setItem('donationRequestDraft', JSON.stringify(rest));
  }, [donation]);

  // تغيير في input عادي
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonation((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // عند اختيار تصنيف جديد: نفرغ type لإجبار المستخدم يختار نوع جديد
  const handleCategoryChange = (e) =>
    setDonation((prev) => ({
      ...prev,
      category: e.target.value,
      type: '',
    }));

  // رفع ملفات الإثبات
  const handleFileUpload = (e) => {
    const incoming = Array.from(e.target.files || []);
    const ok = [];
    const rejected = [];

    incoming.forEach((f) => (isAllowed(f) ? ok.push(f) : rejected.push(f)));

    setDonation((prev) => ({
      ...prev,
      proofDocuments: [...prev.proofDocuments, ...ok],
    }));

    if (rejected.length) {
      setFileError(
        `❌ تم تجاهل ${rejected.length} ملف (المسموح: صور/PDF حتى ${MAX_FILE_MB}MB).`
      );
      setTimeout(() => setFileError(''), 4000);
    }

    // إعادة تصفير قيمة input file عشان نفس الملف يقدر يتكرر
    e.target.value = '';
  };

  // حذف مرفق واحد
  const handleRemoveFile = (index) => {
    setDonation((prev) => ({
      ...prev,
      proofDocuments: prev.proofDocuments.filter((_, i) => i !== index),
    }));
  };

  // اختيار/إلغاء وسيلة دفع
  const togglePaymentMethod = (method, checked) => {
    setDonation((prev) => {
      const current = [...prev.paymentMethods];
      if (checked) {
        if (!current.find((m) => m.method === method)) {
          current.push({ method, phone: '' });
        }
      } else {
        return {
          ...prev,
          paymentMethods: current.filter((m) => m.method !== method),
        };
      }
      return { ...prev, paymentMethods: current };
    });
  };

  // اختيار/إلغاء وسيلة تواصل
  const toggleContactMethod = (method, checked) => {
    setDonation((prev) => {
      const current = [...prev.contactMethods];
      if (checked) {
        if (!current.find((m) => m.method === method)) {
          current.push({ method, number: '' });
        }
      } else {
        return {
          ...prev,
          contactMethods: current.filter((m) => m.method !== method),
        };
      }
      return { ...prev, contactMethods: current };
    });
  };

  // التالي
  const goNext = () => {
    if (step === 1 && !isStep1Valid) return;
    if (step === 2 && (!donation.place || !contactsValid)) return;
    if (step === 3 && isFinancial && !paymentsValid) return;

    let s = step + 1;
    // لو مو مالي، ما نعرض خطوة المال، فنقفز
    if (!isFinancial && s === 3) s = 4;
    setStep(Math.min(s, totalSteps));
  };

  // السابق
  const goPrev = () => {
    let s = step - 1;
    if (!isFinancial && s === 3) s = 2;
    setStep(Math.max(s, 1));
  };

  // ⬅⬅ الإرسال النهائي باستخدام fetchWithInterceptors
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    const newPaymentErrors = {};
    const newContactErrors = {};

    // تحقق من وسائل الدفع (لو مالي)
    donation.paymentMethods.forEach(({ method, phone }) => {
      if (isFinancial && !validatePhoneNumberMR(phone)) {
        newPaymentErrors[method] = true;
        hasError = true;
      }
    });

    // تحقق من وسائل التواصل
    donation.contactMethods.forEach(({ method, number }) => {
      if (!validatePhoneNumberMR(number)) {
        newContactErrors[method] = true;
        hasError = true;
      }
    });

    // لازم يكون فيه على الأقل رقم تواصل واحد صالح
    if (!contactsValid) {
      alert(
        'أضف رقم تواصل واحد على الأقل (هاتف أو واتساب) برقم صحيح (8 أرقام ويبدأ بـ2 أو 3 أو 4).'
      );
      hasError = true;
    }

    // تحقق إضافي من المكان
    if (!donation.place) {
      hasError = true;
      alert('الرجاء كتابة المكان.');
    }

    // تحقق من البيانات المالية لو الطلب مالي
    if (isFinancial && !(Number(donation.amount) > 0)) {
      hasError = true;
      alert('الرجاء إدخال المبلغ المطلوب.');
    }

    if (isFinancial && !donation.paymentMethods.length) {
      hasError = true;
      alert('اختر وسيلة دفع واحدة على الأقل.');
    }

    setErrors({
      paymentPhones: newPaymentErrors,
      contactNumbers: newContactErrors,
    });

    if (hasError) return;

    // تجهيز الـ FormData
    const fd = new FormData();
    fd.append('category', donation.category);
    fd.append('type', donation.type);
    fd.append('description', donation.description || '');
    fd.append('place', donation.place || '');
    fd.append('deadline', donation.deadline || '');
    fd.append('isUrgent', donation.isUrgent ? 'true' : 'false');
    fd.append('amount', donation.amount || '');
    fd.append('bloodType', donation.bloodType || '');

    const cleanContacts = donation.contactMethods.filter(
      (x) => x && (x.method || x.number)
    );
    const cleanPayments = donation.paymentMethods.filter(
      (x) => x && (x.method || x.phone)
    );

    fd.append('contactMethods', JSON.stringify(cleanContacts));
    fd.append('paymentMethods', JSON.stringify(cleanPayments));

    donation.proofDocuments.forEach((file) => fd.append('files', file));

    try {
      setSubmitting(true);

      // أهم نقطة: نستخدم fetchWithInterceptors بدل fetch
      // علشان:
      // - يضيف Authorization Bearer تلقائي
      // - يضيف X-UserId لو موجود
      // - يحدد الـ API_BASE
      // - يعالج timeout والأخطاء
      const resp = await fetchWithInterceptors('/api/donationRequests', {
        method: 'POST',
        body: fd,
        // مهم: لا نحط Content-Type يدوياً مع FormData
      });

      // resp.body هو اللي ترجعه دالتك (json/text/blob...)
      const created = resp?.body?.data;

      // تنظيف المسودة بعد النجاح
      localStorage.removeItem('donationRequestDraft');

      if (created?._id) {
        navigate(`/donations/${created._id}`);
      } else {
        alert(resp?.body?.message || 'تم إنشاء الطلب بنجاح');
      }
    } catch (err) {
      console.error('خطأ أثناء الإرسال:', err);
      alert(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="donation-form-container" dir="rtl">
      {/* رأس النموذج */}
      <header className="form-header">
        <TitleMain title="طلب تبرع عام 🤝" />

        {/* شريط التقدم البصري */}
        <div
          className="steps-progress-container"
          role="progressbar"
          aria-valuenow={displayedStep}
          aria-valuemin="1"
          aria-valuemax={totalSteps}
        >
          <div className="steps-info">
            <div className="current-step-info">
              <span className="step-icon">
                {stepInfo[displayedStep]?.icon}
              </span>
              <div className="step-details">
                <h3 className="step-title">
                  {stepInfo[displayedStep]?.title}
                </h3>
                <p className="step-description">
                  {stepInfo[displayedStep]?.description}
                </p>
              </div>
            </div>

            <div className="steps-dots-header">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`step-dot-header ${
                    displayedStep >= index + 1 ? 'completed' : ''
                  } ${displayedStep === index + 1 ? 'active' : ''}`}
                  aria-label={`الخطوة ${index + 1}: ${
                    stepInfo[index + 1]?.title
                  }`}
                >
                  {displayedStep > index + 1 ? '✓' : index + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="progress-indicator">
            <div
              className="progress-bar"
              style={{
                width: `${(displayedStep / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      </header>

      {fileError && <Alert variant="warning">{fileError}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* الخطوة ١: المجال / النوع / الوصف */}
        {displayedStep === 1 && (
          <div className="step-content">
            <Form.Group>
              <Form.Label>اختر المجال</Form.Label>
              <Form.Control
                as="select"
                name="category"
                value={donation.category}
                onChange={handleCategoryChange}
                required
              >
                <option value="">-- اختر --</option>
                {Object.keys(categories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {donation.category && (
              <Form.Group className="mt-2">
                <Form.Label>اختر نوع التبرع</Form.Label>
                <Form.Control
                  as="select"
                  name="type"
                  value={donation.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- اختر النوع --</option>
                  {categories[donation.category].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}

            <Form.Group className="mt-2">
              <Form.Label>وصف الحالة</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={donation.description}
                onChange={handleChange}
                placeholder="أدخل وصفًا مختصرًا للحالة أو الاحتياج"
              />
            </Form.Group>
          </div>
        )}

        {/* الخطوة ٢: المكان + وسائل التواصل */}
        {displayedStep === 2 && (
          <div className="step-content">
            <Form.Group>
              <Form.Label>الموقع (اسم المكان)</Form.Label>
              <Form.Control
                list="places"
                name="place"
                value={donation.place}
                onChange={handleChange}
                placeholder="اكتب أو اختر اسم المكان"
                required
              />
              <datalist id="places">
                {placesList.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>وسائل التواصل</Form.Label>

              {contactOptions.map((method) => {
                const selected = donation.contactMethods.find(
                  (m) => m.method === method
                );

                const niceLabel =
                  method === 'phone'
                    ? 'هاتف مباشر'
                    : 'واتساب (مكالمات / رسائل)';

                return (
                  <div key={method} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={niceLabel}
                      checked={!!selected}
                      onChange={(e) =>
                        toggleContactMethod(method, e.target.checked)
                      }
                    />

                    {selected && (
                      <>
                        <Form.Control
                          type="text"
                          placeholder={
                            method === 'phone'
                              ? 'رقم الهاتف للتواصل (8 أرقام ويبدأ بـ2 أو 3 أو 4)'
                              : 'رقم واتساب داخل موريتانيا (8 أرقام ويبدأ بـ2 أو 3 أو 4)'
                          }
                          value={selected.number}
                          isInvalid={!!errors.contactNumbers[method]}
                          onChange={(e) => {
                            const number = e.target.value;
                            setDonation((prev) => ({
                              ...prev,
                              contactMethods: prev.contactMethods.map((m) =>
                                m.method === method
                                  ? { ...m, number }
                                  : m
                              ),
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              contactNumbers: {
                                ...prev.contactNumbers,
                                [method]: !validatePhoneNumberMR(number),
                              },
                            }));
                          }}
                          required
                        />

                        {errors.contactNumbers[method] && (
                          <div className="invalid-feedback d-block">
                            الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {!contactsValid && (
                <div className="text-danger small">
                  يجب إضافة رقم تواصل صالح واحد على الأقل.
                </div>
              )}
            </Form.Group>
          </div>
        )}

        {/* الخطوة ٣: التفاصيل المالية (فقط لو الطلب مالي) */}
        {displayedStep === 3 && isFinancial && (
          <div className="step-content">
            <Form.Group>
              <Form.Label>المبلغ المطلوب</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={donation.amount}
                onChange={handleChange}
                min="1"
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>وسائل الدفع</Form.Label>

              {paymentOptions.map((method) => {
                const selected = donation.paymentMethods.find(
                  (m) => m.method === method
                );

                return (
                  <div key={method} className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label={method}
                      checked={!!selected}
                      onChange={(e) =>
                        togglePaymentMethod(method, e.target.checked)
                      }
                    />

                    {selected && (
                      <>
                        <Form.Control
                          type="text"
                          placeholder={`رقم ${method} (8 أرقام ويبدأ بـ2 أو 3 أو 4)`}
                          value={selected.phone}
                          isInvalid={!!errors.paymentPhones[method]}
                          onChange={(e) => {
                            const phone = e.target.value;
                            setDonation((prev) => ({
                              ...prev,
                              paymentMethods: prev.paymentMethods.map((m) =>
                                m.method === method
                                  ? { ...m, phone }
                                  : m
                              ),
                            }));
                            setErrors((prev) => ({
                              ...prev,
                              paymentPhones: {
                                ...prev.paymentPhones,
                                [method]: !validatePhoneNumberMR(phone),
                              },
                            }));
                          }}
                          required
                        />

                        {errors.paymentPhones[method] && (
                          <div className="invalid-feedback d-block">
                            أدخل رقم صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4).
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {!paymentsValid && (
                <div className="text-danger mt-1">
                  يجب إدخال المبلغ واختيار وسيلة دفع واحدة على الأقل مع رقم صالح.
                </div>
              )}
            </Form.Group>
          </div>
        )}

        {/* الخطوة ٤ (أو ٣ لغير المالي): الموعد والاستعجال */}
        {displayedStep === (isFinancial ? 4 : 3) && (
          <div className="step-content">
            <div className="row">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>آخر مهلة (اختياري)</Form.Label>
                  <Form.Control
                    type="date"
                    name="deadline"
                    value={donation.deadline}
                    min={minDeadline}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="طلب مستعجل"
                    name="isUrgent"
                    checked={donation.isUrgent}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>
          </div>
        )}

        {/* الخطوة الأخيرة: المرفقات / المراجعة */}
        {displayedStep === totalSteps && (
          <div className="step-content">
            <Form.Group>
              <div className="d-flex justify-content-between">
                <Form.Label>وثائق داعمة</Form.Label>
                <small className="text-muted">PDF أو صور</small>
              </div>
              <Form.Control
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFileUpload}
              />
              <ListGroup className="mt-2">
                {donation.proofDocuments.map((file, idx) => (
                  <ListGroupItem
                    key={idx}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{file.name}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      حذف
                    </Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Form.Group>
          </div>
        )}

        {/* أزرار التنقّل والإرسال */}
        <div className="action-buttons mt-3 d-flex gap-2 flex-wrap">
          {displayedStep > 1 && (
            <Button
              variant="secondary"
              onClick={goPrev}
              disabled={submitting}
              size="md"
              className="px-4 py-2"
              type="button"
            >
              السابق
            </Button>
          )}

          {displayedStep < totalSteps && (
            <Button
              variant="primary"
              onClick={goNext}
              size="md"
              className="px-4 py-2"
              disabled={
                submitting ||
                (displayedStep === 1 && !isStep1Valid) ||
                (displayedStep === 2 &&
                  (!donation.place || !contactsValid)) ||
                (displayedStep === 3 &&
                  isFinancial &&
                  !paymentsValid)
              }
              type="button"
            >
              التالي
            </Button>
          )}

          {displayedStep === totalSteps && (
            <Button
              type="submit"
              variant="success"
              disabled={submitting}
              size="md"
              className="px-4 py-2"
            >
              <FaCheck className="me-2" />
              {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default DonationRequestForm;

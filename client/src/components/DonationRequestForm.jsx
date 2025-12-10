// src/components/DonationRequestForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Form, Button, ListGroup, ListGroupItem, Alert } from 'react-bootstrap';
import { FaCheck, FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import './DonationRequestForm.css';
import TitleMain from './TitleMain.jsx';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

// 🖼️ أيقونات وسائل الدفع
import iconBankily from '../images/icon_bankily.png';
import iconBimBank from '../images/icon_bimBank.jpg';
import iconMasrivi from '../images/icon_masrivi.avif';
import iconSadad from '../images/icon_sedad.png';

/**
 * ✅ التحقق من رقم موريتاني محلي (لخدمات الدفع):
 * - 8 أرقام بالضبط
 * - يبدأ بـ 2 أو 3 أو 4
 */
const validatePhoneNumberMR = (v) => {
  if (!v) return false;
  const trimmed = v.trim();
  return /^(2|3|4)\d{7}$/.test(trimmed);
};

/**
 * ✅ رقم دولي عام للتواصل (هاتف / واتساب)
 * - يسمح بـ + في البداية
 * - من 6 إلى 15 رقم
 */
const validatePhoneInternational = (v) => {
  if (!v) return false;
  const trimmed = v.trim();
  return /^\+?\d{6,15}$/.test(trimmed);
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

// ✅ طبيعة التبرع (نفس ReadyToDonateGeneral)
const donationNatureOptions = [
  { value: 'money', label: 'مالي' },
  { value: 'goods', label: 'مواد / أغراض' },
  { value: 'time', label: 'الوقت / الجهد' },
  { value: 'other', label: 'أخرى' },
];

const donationNatureLabels = {
  money: 'مالي',
  goods: 'مواد / أغراض',
  time: 'الوقت / الجهد',
  other: 'أخرى',
};

const DonationRequestForm = () => {
  const navigate = useNavigate();

  // ✅ دالة تمرير لأعلى النموذج / الصفحة
  const scrollToTop = () => {
    const wrapper = document.querySelector('.page-wrapper');
    if (wrapper) {
      wrapper.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // الحالة الرئيسية للنموذج
  const [donation, setDonation] = useState({
    category: '',
    type: '',
    donationNature: 'money', // طبيعة التبرع (مالي / مواد / وقت / أخرى)
    description: '',
    place: '',              // المدينة داخل موريتانيا أو المدينة خارجها
    locationMode: 'mr',     // 'mr' داخل موريتانيا | 'intl' خارج موريتانيا
    foreignCity: '',
    foreignCountry: '',
    amount: '',
    paymentMethods: [],     // [{ method, phone }]
    contactMethods: {
      phone: '',
      whatsapp: '',
    },
    deadline: '',
    isUrgent: false,
    bloodType: '',
    proofDocuments: [],
    date: new Date().toISOString(),
  });

  // التحكم في الخطوات
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // حالة النجاح بعد الإرسال
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [newRequestId, setNewRequestId] = useState(null);

  // أخطاء التحقق لأرقام الدفع/التواصل
  const [errors, setErrors] = useState({
    paymentPhones: {},
    contactNumbers: {}, // { phone, whatsapp }
  });

  // رسالة خطأ رفع الملفات (غير حاسمة)
  const [fileError, setFileError] = useState('');

  // تصنيفات وأنواع التبرع (مجال الطلب)
  const categories = {
    الصحة: ['أدوية', 'معدات طبية'],
    التعليم: ['لوازم مدرسية', 'منح دراسية', 'دروس خصوصية'],
    السكن: ['إيجار عاجل', 'إعادة بناء', 'أثاث'],
    'الكوارث الطبيعية': ['إغاثة عاجلة', 'مساعدة متضررين'],
    
  };

  // ✅ خيارات وسائل الدفع (مع الأيقونات)
  const paymentOptions = [
    { method: 'Bankily', label: 'Bankily', icon: iconBankily },
    { method: 'Masrifi', label: 'Masrifi', icon: iconMasrivi },
    { method: 'Sadad', label: 'Sadad', icon: iconSadad },
    { method: 'bim-bank', label: 'bim-bank', icon: iconBimBank },
  ];

  // قائمة الأماكن/المدن داخل موريتانيا
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

  // 🔹 مقدار المبلغ كعدد
  const hasAmount = useMemo(
    () => Number(donation.amount) > 0,
    [donation.amount]
  );

  // التحقق: الخطوة 1 تحتاج category و type (طبيعة التبرع لها قيمة افتراضية)
  const isStep1Valid = useMemo(
    () => !!donation.category && !!donation.type,
    [donation.category, donation.type]
  );

  // ✅ التحقق: الموقع
  const isLocationValid = useMemo(() => {
    if (donation.locationMode === 'intl') {
      return (
        donation.foreignCity.trim().length > 0 &&
        donation.foreignCountry.trim().length > 0
      );
    }
    // داخل موريتانيا → مدينة واحدة على الأقل
    return donation.place.trim().length > 0;
  }, [
    donation.locationMode,
    donation.place,
    donation.foreignCity,
    donation.foreignCountry,
  ]);

  // ✅ التحقق: لازم على الأقل هاتف أو واتساب صحيح (دولي)
  const contactsValid = useMemo(() => {
    const phoneOk = validatePhoneInternational(
      donation.contactMethods?.phone
    );
    const whatsappOk = validatePhoneInternational(
      donation.contactMethods?.whatsapp
    );
    return phoneOk || whatsappOk;
  }, [donation.contactMethods]);

  // ✅ التحقق: وسائل الدفع فقط إذا كان المبلغ > 0 (محلي MR)
  const paymentsValid = useMemo(() => {
    if (!hasAmount) return true; // لا مبلغ → لا تحقق
    if (!donation.paymentMethods.length) return false;

    const phonesOk = donation.paymentMethods.every((p) =>
      validatePhoneNumberMR(p.phone)
    );

    return phonesOk;
  }, [donation.paymentMethods, hasAmount]);

  // معلومات الـ UI لكل خطوة
  const stepInfo = {
    1: {
      title: 'نوع التبرع والوصف',
      description: 'اختر المجال، طبيعة التبرع، ونوع التبرع ثم اكتب الوصف',
      icon: '📋',
    },
    2: {
      title: 'الموقع والتواصل',
      description: 'حدد مكان وجود المستفيد وأرقام التواصل',
      icon: '📍',
    },
    3: {
      title: 'التفاصيل المالية',
      description: 'يمكنك إدخال مبلغ ووسائل الدفع (اختياري)',
      icon: '💰',
    },
    4: {
      title: 'الموعد والمراجعة',
      description: 'حدد الموعد النهائي وراجع الطلب قبل الإرسال',
      icon: '⏰',
    },
  };

  // عدد الخطوات ثابت ٤
  const totalSteps = 4;
  const displayedStep = step;

  // تاريخ أقل للـ deadline
  const minDeadline = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }, []);

  // ✅ نص المكان النهائي للعرض في الملخص
  const summaryPlace = useMemo(() => {
    if (donation.locationMode === 'intl') {
      if (!donation.foreignCity && !donation.foreignCountry) return '—';
      return [donation.foreignCity, donation.foreignCountry]
        .filter(Boolean)
        .join(' - ');
    }
    if (!donation.place) return '—';
    return `${donation.place} - موريتانيا`;
  }, [
    donation.locationMode,
    donation.place,
    donation.foreignCity,
    donation.foreignCountry,
  ]);

  // 📝 استرجاع المسودة من localStorage
  useEffect(() => {
    const saved = localStorage.getItem('donationRequestDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        // ⚙️ توحيد الشكل القديم (مصفوفة) إلى كائن {phone, whatsapp}
        let contactMethods = parsed.contactMethods;
        if (Array.isArray(contactMethods)) {
          const obj = { phone: '', whatsapp: '' };
          contactMethods.forEach((c) => {
            if (c.method === 'phone') obj.phone = c.number || '';
            if (c.method === 'whatsapp') obj.whatsapp = c.number || '';
          });
          contactMethods = obj;
        }

        setDonation((prev) => ({
          ...prev,
          ...parsed,
          donationNature: parsed.donationNature || 'money',
          locationMode: parsed.locationMode || 'mr',
          foreignCity: parsed.foreignCity || '',
          foreignCountry: parsed.foreignCountry || '',
          contactMethods: contactMethods || { phone: '', whatsapp: '' },
          proofDocuments: [],
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

  // عند اختيار تصنيف جديد
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

  // التالي
  const goNext = () => {
    if (step === 1 && !isStep1Valid) {
      scrollToTop();
      return;
    }
    if (step === 2 && (!isLocationValid || !contactsValid)) {
      scrollToTop();
      return;
    }
    if (step === 3 && hasAmount && !paymentsValid) {
      scrollToTop();
      return;
    }

    const s = Math.min(step + 1, totalSteps);
    setStep(s);
    scrollToTop();
  };

  // السابق
  const goPrev = () => {
    const s = Math.max(step - 1, 1);
    setStep(s);
    scrollToTop();
  };

  // إعادة تعيين النموذج بعد نجاح الإرسال
  const resetForm = () => {
    setDonation({
      category: '',
      type: '',
      donationNature: 'money',
      description: '',
      place: '',
      locationMode: 'mr',
      foreignCity: '',
      foreignCountry: '',
      amount: '',
      paymentMethods: [],
      contactMethods: { phone: '', whatsapp: '' },
      deadline: '',
      isUrgent: false,
      bloodType: '',
      proofDocuments: [],
      date: new Date().toISOString(),
    });
    setStep(1);
    setSubmitting(false);
    setErrors({ paymentPhones: {}, contactNumbers: {} });
    setFileError('');
    setSuccessMessage('');
    setFormSubmitted(false);
    setNewRequestId(null);
    scrollToTop();
  };

  // ⬅⬅ الإرسال النهائي
  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasErrorFlag = false;
    const newPaymentErrors = {};
    const newContactErrors = {};

    // ✅ تحقق من الموقع
    if (!isLocationValid) {
      if (donation.locationMode === 'intl') {
        alert('الرجاء إدخال المدينة والدولة إذا كان المستفيد خارج موريتانيا.');
      } else {
        alert('الرجاء إدخال اسم المدينة داخل موريتانيا.');
      }
      hasErrorFlag = true;
    }

    // ✅ تحقق من وسائل التواصل (هاتف + واتساب) بصيغة دولية
    ['phone', 'whatsapp'].forEach((method) => {
      const number = donation.contactMethods?.[method] || '';
      if (number && !validatePhoneInternational(number)) {
        newContactErrors[method] = true;
        hasErrorFlag = true;
      }
    });

    if (!contactsValid) {
      alert(
        'أضف رقم تواصل واحد على الأقل (هاتف أو واتساب) بصيغة صحيحة. مثال: +22222000000 أو 0034666000000.'
      );
      hasErrorFlag = true;
    }

    // ✅ تحقق من البيانات المالية فقط إذا كان هناك مبلغ
    if (hasAmount) {
      if (!donation.paymentMethods.length) {
        hasErrorFlag = true;
        alert('اختر وسيلة دفع واحدة على الأقل.');
      }

      donation.paymentMethods.forEach(({ method, phone }) => {
        if (!validatePhoneNumberMR(phone)) {
          newPaymentErrors[method] = true;
          hasErrorFlag = true;
        }
      });
    }

    setErrors({
      paymentPhones: newPaymentErrors,
      contactNumbers: newContactErrors,
    });

    if (hasErrorFlag) {
      scrollToTop();
      return;
    }

    // 🔗 تكوين نص المكان النهائي
    const finalPlace =
      donation.locationMode === 'intl'
        ? [donation.foreignCity, donation.foreignCountry]
            .filter(Boolean)
            .join(' - ')
        : donation.place
        ? `${donation.place} - موريتانيا`
        : '';

    const fd = new FormData();
    fd.append('category', donation.category);
    fd.append('type', donation.type);
    fd.append('donationNature', donation.donationNature || '');
    fd.append('description', donation.description || '');
    fd.append('place', finalPlace || '');
    fd.append('locationMode', donation.locationMode || 'mr');
    fd.append('foreignCity', donation.foreignCity || '');
    fd.append('foreignCountry', donation.foreignCountry || '');
    fd.append('deadline', donation.deadline || '');
    fd.append('isUrgent', donation.isUrgent ? 'true' : 'false');
    fd.append('amount', donation.amount || '');
    fd.append('bloodType', donation.bloodType || '');

    // ✅ تحويل الهاتف/الواتساب إلى مصفوفة كما يتوقع الـ backend
    const contactsArr = [];
    if (donation.contactMethods.phone) {
      contactsArr.push({
        method: 'phone',
        number: donation.contactMethods.phone.trim(),
      });
    }
    if (donation.contactMethods.whatsapp) {
      contactsArr.push({
        method: 'whatsapp',
        number: donation.contactMethods.whatsapp.trim(),
      });
    }

    const cleanPayments = donation.paymentMethods.filter(
      (x) => x && (x.method || x.phone)
    );

    fd.append('contactMethods', JSON.stringify(contactsArr));
    fd.append('paymentMethods', JSON.stringify(cleanPayments));

    donation.proofDocuments.forEach((file) => fd.append('files', file));

    try {
      setSubmitting(true);

      const resp = await fetchWithInterceptors('/api/donation-requests', {
        method: 'POST',
        body: fd,
      });

      const created = resp?.body?.data;

      localStorage.removeItem('donationRequestDraft');
      scrollToTop();

      if (created?._id) {
        setNewRequestId(created._id);
      }

      setSuccessMessage(
        resp?.body?.message || 'تم إنشاء طلب التبرع بنجاح!'
      );
      setFormSubmitted(true);
    } catch (err) {
      console.error('خطأ أثناء الإرسال:', err);
      alert(err.message || 'حدث خطأ أثناء الإرسال');
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ واجهة النجاح بعد إرسال الطلب
  if (formSubmitted && successMessage) {
    return (
      <div className="donation-form-container" dir="rtl">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">تم استلام طلبك بنجاح</h2>
          <p className="success-desc">
            شكراً لك. سيتم عرض هذا الطلب للمتطوعين والمتبرعين المهتمين بهذا النوع من المساعدة.
          </p>

          <div className="success-actions">
            {newRequestId && (
              <Button
                variant="success"
                className="w-100 mb-2"
                onClick={() => navigate(`/donations/${newRequestId}`)}
              >
                عرض طلبي الآن
              </Button>
            )}

            <Button
              variant="outline-success"
              className="w-100 mb-2"
              onClick={() => navigate('/donations')}
            >
              مشاهدة جميع طلبات التبرع
            </Button>

            <Button
              variant="primary"
              className="w-100"
              onClick={resetForm}
            >
              إنشاء طلب جديد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-form-container" dir="rtl">
      {/* رأس النموذج */}
      <header className="form-header">
        <TitleMain
          title="طلب تبرع عام 🤝"
          subtitle="يمكن لكل مستخدم إنشاء طلب نيابةً عن أي شخص آخر، لذلك فإن وسائل التواصل ووسائل الدفع مرتبطة بالطلب نفسه وليست بحساب المستخدم."
        />

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
        {/* الخطوة ١: المجال / طبيعة التبرع / النوع / الوصف */}
        {displayedStep === 1 && (
          <div className="step-content">
            <Form.Group>
              <Form.Label>المجال (قطاع المساعدة)</Form.Label>
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

            {/* طبيعة التبرع */}
            <Form.Group className="mt-3">
              <Form.Label>طبيعة التبرع</Form.Label>
              <Form.Select
                name="donationNature"
                value={donation.donationNature}
                onChange={handleChange}
              >
                {donationNatureOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {donation.category && (
              <Form.Group className="mt-3">
                <Form.Label>نوع التبرع داخل هذا المجال</Form.Label>
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

            <Form.Group className="mt-3">
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

        {/* الخطوة ٢: الموقع + وسائل التواصل (دولية) */}
        {displayedStep === 2 && (
          <div className="step-content">
            {/* داخل / خارج موريتانيا */}
            <Form.Group className="mb-3">
              <Form.Label>مكان وجود المستفيد</Form.Label>
              <Form.Select
                name="locationMode"
                value={donation.locationMode}
                onChange={(e) =>
                  setDonation((prev) => ({
                    ...prev,
                    locationMode: e.target.value,
                  }))
                }
              >
                <option value="mr">داخل موريتانيا</option>
                <option value="intl">خارج موريتانيا</option>
              </Form.Select>
            </Form.Group>

            {donation.locationMode === 'mr' ? (
              <Form.Group>
                <Form.Label>المدينة داخل موريتانيا</Form.Label>
                <Form.Control
                  list="places"
                  name="place"
                  value={donation.place}
                  onChange={handleChange}
                  placeholder="اكتب أو اختر اسم المدينة داخل موريتانيا"
                  required
                />
                <datalist id="places">
                  {placesList.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
                {!isLocationValid && (
                  <div className="text-danger small mt-1">
                    الرجاء إدخال اسم المدينة داخل موريتانيا.
                  </div>
                )}
              </Form.Group>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>الدولة</Form.Label>
                  <Form.Control
                    name="foreignCountry"
                    value={donation.foreignCountry}
                    onChange={handleChange}
                    placeholder="مثال: España, France, Sénégal..."
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>المدينة</Form.Label>
                  <Form.Control
                    name="foreignCity"
                    value={donation.foreignCity}
                    onChange={handleChange}
                    placeholder="مثال: Sevilla, París..."
                  />
                </Form.Group>
                {!isLocationValid && (
                  <div className="text-danger small mt-1">
                    الرجاء إدخال المدينة والدولة إذا كان المستفيد خارج موريتانيا.
                  </div>
                )}
              </>
            )}

            {/* ✅ وسائل التواصل ثابتة (دولية) */}
            <Form.Group className="mt-3">
              <Form.Label>وسائل التواصل</Form.Label>

              {/* الهاتف */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-2">
                  <FiPhone size={18} style={{ color: '#2e7d32' }} />
                  الهاتف
                </label>
                <Form.Control
                  type="text"
                  value={donation.contactMethods.phone}
                  onChange={(e) => {
                    const number = e.target.value;
                    setDonation((prev) => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        phone: number,
                      },
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      contactNumbers: {
                        ...prev.contactNumbers,
                        phone:
                          number &&
                          !validatePhoneInternational(number),
                      },
                    }));
                  }}
                  placeholder="مثال: +22222000000 أو 0034666000000"
                  isInvalid={!!errors.contactNumbers?.phone}
                />
                {errors.contactNumbers?.phone && (
                  <div className="invalid-feedback d-block">
                    رقم غير صالح — أدخل رقمًا دوليًا صحيحًا.
                  </div>
                )}
              </div>

              {/* واتساب */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-2">
                  <FaWhatsapp size={18} style={{ color: '#1c9c55' }} />
                  واتساب
                </label>
                <Form.Control
                  type="text"
                  value={donation.contactMethods.whatsapp}
                  onChange={(e) => {
                    const number = e.target.value;
                    setDonation((prev) => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        whatsapp: number,
                      },
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      contactNumbers: {
                        ...prev.contactNumbers,
                        whatsapp:
                          number &&
                          !validatePhoneInternational(number),
                      },
                    }));
                  }}
                  placeholder="مثال: +22222000000 أو 0034666000000"
                  isInvalid={!!errors.contactNumbers?.whatsapp}
                />
                {errors.contactNumbers?.whatsapp && (
                  <div className="invalid-feedback d-block">
                    رقم غير صالح — أدخل رقمًا دوليًا صحيحًا.
                  </div>
                )}
              </div>

              {!contactsValid && (
                <div className="text-danger small">
                  يجب إضافة رقم تواصل صالح واحد على الأقل (هاتف أو واتساب).
                </div>
              )}
            </Form.Group>
          </div>
        )}

        {/* الخطوة ٣: المبلغ + وسائل الدفع (اختياري) */}
        {displayedStep === 3 && (
          <div className="step-content">
            <Form.Group>
              <Form.Label>المبلغ المطلوب (بالأوقية الجديدة)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={donation.amount}
                onChange={handleChange}
                min="0"
              />
              <Form.Text className="text-muted">
                المبلغ يُحتسب بالأوقية الجديدة (MRU). يمكنك ترك الحقل فارغًا إذا لم يكن هناك مبلغ محدد.
              </Form.Text>
            </Form.Group>

            {/* تظهر وسائل الدفع فقط إذا يوجد مبلغ */}
            {hasAmount && (
              <Form.Group className="mt-3">
                <Form.Label>وسائل الدفع (تستعمل في موريتانيا فقط)</Form.Label>

                {paymentOptions.map(({ method, label, icon }) => {
                  const selected = donation.paymentMethods.find(
                    (m) => m.method === method
                  );

                  return (
                    <div key={method} className="mb-3 payment-method-row">
                      <Form.Check
                        type="checkbox"
                        className="payment-method-check"
                        label={
                          <span className="d-inline-flex align-items-center gap-2">
                            <img
                              src={icon}
                              alt={label}
                              className="payment-icon"
                            />
                            <span>{label}</span>
                          </span>
                        }
                        checked={!!selected}
                        onChange={(e) =>
                          togglePaymentMethod(method, e.target.checked)
                        }
                      />

                      {selected && (
                        <>
                          <Form.Control
                            type="text"
                            placeholder={`رقم ${label} (8 أرقام موريتانية)`}
                            value={selected.phone}
                            isInvalid={!!errors.paymentPhones?.[method]}
                            onChange={(e) => {
                              const phone = e.target.value;
                              setDonation((prev) => ({
                                ...prev,
                                paymentMethods: prev.paymentMethods.map((m) =>
                                  m.method === method ? { ...m, phone } : m
                                ),
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                paymentPhones: {
                                  ...(prev.paymentPhones || {}),
                                  [method]: !validatePhoneNumberMR(phone),
                                },
                              }));
                            }}
                            required
                          />

                          {errors.paymentPhones?.[method] && (
                            <div className="invalid-feedback d-block">
                              أدخل رقم موريتاني صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4).
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {!paymentsValid && hasAmount && (
                  <div className="text-danger mt-1">
                    يجب اختيار وسيلة دفع واحدة على الأقل مع رقم صالح عندما يكون المبلغ مُدخلًا.
                  </div>
                )}
              </Form.Group>
            )}
          </div>
        )}

        {/* الخطوة ٤: الموعد + المرفقات + الملخص قبل الإرسال */}
        {displayedStep === 4 && (
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
              <div className="col-md-6 d-flex align-items-end checkbox-urgent">
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

            {/* المرفقات */}
            <Form.Group className="mt-3">
              <div className="d-flex justify-content-between">
                <Form.Label>وثائق داعمة</Form.Label>
                <small className="text-muted">PDF أو صور (اختياري)</small>
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

            {/* ✅ ملخص الطلب قبل الإرسال */}
            <div className="summary-card mt-4">
              <div className="summary-card-header">
                <span className="summary-icon">📄</span>
                <div>
                  <div className="summary-title">ملخص الطلب قبل الإرسال</div>
                  <div className="summary-hint">
                    يرجى مراجعة هذه البيانات جيداً قبل الضغط على &quot;إرسال الطلب&quot;.
                  </div>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">المجال</div>
                  <div className="summary-value">
                    {donation.category || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">طبيعة التبرع</div>
                  <div className="summary-value">
                    {donationNatureLabels[donation.donationNature] || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">نوع التبرع</div>
                  <div className="summary-value">
                    {donation.type || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">الموقع</div>
                  <div className="summary-value">{summaryPlace}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">المبلغ (MRU)</div>
                  <div className="summary-value">
                    {donation.amount ? donation.amount : 'بدون مبلغ محدد'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">الاستعجال</div>
                  <div
                    className={`summary-badge ${
                      donation.isUrgent ? 'urgent' : 'normal'
                    }`}
                  >
                    {donation.isUrgent ? 'مستعجل' : 'عادي'}
                  </div>
                </div>

                <div className="summary-item summary-item-wide">
                  <div className="summary-label">وسائل التواصل</div>
                  <div className="summary-value">
                    {donation.contactMethods.phone && (
                      <div>📞 هاتف: {donation.contactMethods.phone}</div>
                    )}
                    {donation.contactMethods.whatsapp && (
                      <div>💬 واتساب: {donation.contactMethods.whatsapp}</div>
                    )}
                    {!donation.contactMethods.phone &&
                      !donation.contactMethods.whatsapp &&
                      '—'}
                  </div>
                </div>

                {hasAmount && donation.paymentMethods.length > 0 && (
                  <div className="summary-item summary-item-wide">
                    <div className="summary-label">وسائل الدفع</div>
                    <div className="summary-value">
                      {donation.paymentMethods
                        .map(
                          (m) => `${m.method} (${m.phone || 'بدون رقم'})`
                        )
                        .join(' ، ')}
                    </div>
                  </div>
                )}

                <div className="summary-item summary-item-wide">
                  <div className="summary-label">عدد المرفقات</div>
                  <div className="summary-value">
                    {donation.proofDocuments.length
                      ? `${donation.proofDocuments.length} ملف`
                      : 'لا توجد مرفقات'}
                  </div>
                </div>
              </div>
            </div>
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
                  (!isLocationValid || !contactsValid)) ||
                (displayedStep === 3 && hasAmount && !paymentsValid)
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

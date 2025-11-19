// src/components/BloodDonationForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaCheck, FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import TitleMain from './TitleMain.jsx';

import './BloodDonationForm.css';

/**
 * ✅ تحقق من رقم موريتاني:
 * - 8 أرقام
 * - يبدأ بـ 2 أو 3 أو 4
 */
const validatePhoneNumberMR = (v) => {
  if (!v) return false;
  const trimmed = v.trim();
  return /^(2|3|4)\d{7}$/.test(trimmed);
};

/**
 * ✅ عرض تاريخ بسيط DD/MM/YYYY
 */
const formatDateSimple = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * ✅ عرض تاريخ + وقت مثل 11/11/2025 14:35
 */
const formatDateTimeHuman = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hour}:${min}`;
};

const BloodDonationForm = () => {
  // ====== STATE الرئيسي ======
  const [bloodDonation, setBloodDonation] = useState({
    bloodType: '',
    location: '',
    hospital: '',        // المستشفى (اختياري)
    description: '',
    deadline: '',
    isUrgent: false,
    phone: '',
    whatsapp: '',
  });

  const [step, setStep] = useState(1);
  const [supportDocs, setSupportDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileError, setFileError] = useState('');
  const [deadlineWarning, setDeadlineWarning] = useState('');
  const [newRequestId, setNewRequestId] = useState(null);

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

  // ====== إعدادات عامة ======
  useEffect(() => {
    document.title = 'طلب تبرع بالدم - تبارو';
    return () => {
      document.title = 'تبارو - منصة التبرعات';
    };
  }, []);

  useEffect(() => {
    if (formSubmitted) {
      scrollToTop();
    }
  }, [formSubmitted]);

  // أنواع الدم
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'غير معروف'];

  // قائمة الأماكن
  const placesList = [
    'اترارزة', 'أدرار', 'آسابا', 'أكجوجت', 'ألاك', 'أم التونسي',
    'أمورج', 'أوجفت', 'بئر أم اݕرين', 'بوتلميت', 'بنشاب', 'تيجكة',
    'تيشيت', 'تمبدغة', 'جعوار', 'حاسي الشيخ', 'رأس البئر', 'الرشيد',
    'روصو', 'زمال', 'سيليبابي', 'صنقرقة', 'طارة', 'فم لعبرة',
    'قيدي مقة', 'كوبني', 'كرار', 'كنكوصة', 'كيفة', 'لبديا',
    'لعصابة', 'لكصر', 'نواكشوط', 'نواذيبو', 'وألة', 'ولاتة',
    'واد الناگة', 'وسو', 'يورلي',
  ];

  /**
   * ✅ التحقق لكل خطوة
   */
  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!bloodDonation.bloodType) newErrors.bloodType = 'نوع الدم مطلوب';
      if (!bloodDonation.location) newErrors.location = 'المكان مطلوب';
    }

    if (stepNumber === 2) {
      if (!bloodDonation.description) newErrors.description = 'الوصف مطلوب';
    }

    if (stepNumber === 3) {
      if (!bloodDonation.deadline) newErrors.deadline = 'الموعد النهائي مطلوب';
    }

    if (stepNumber === 4) {
      const phoneValid = validatePhoneNumberMR(bloodDonation.phone);
      const whatsappValid = validatePhoneNumberMR(bloodDonation.whatsapp);

      if (bloodDonation.phone && !phoneValid) {
        newErrors.phone = 'الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.';
      }
      if (bloodDonation.whatsapp && !whatsappValid) {
        newErrors.whatsapp = 'الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.';
      }

      if (!phoneValid && !whatsappValid) {
        newErrors.contact = 'يجب إدخال رقم واحد صحيح على الأقل (هاتف أو واتساب).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * ✅ تحديث حقل بسيط في bloodDonation
   */
  const handleInputChange = (field, value) => {
    // معالجة خاصة للموعد النهائي
    if (field === 'deadline') {
      const chosen = new Date(value);
      const now = new Date();

      if (chosen.getTime() < now.getTime()) {
        setDeadlineWarning('لا يمكنك اختيار وقت في الماضي.');
        setBloodDonation((prev) => ({ ...prev, deadline: '' }));
        setErrors((prev) => ({
          ...prev,
          deadline: 'الرجاء اختيار وقت صالح في المستقبل',
        }));
        return;
      }

      const diffMs = chosen.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 2) {
        setDeadlineWarning('تنبيه: المهلة أقل من ساعتين من الآن.');
      } else {
        setDeadlineWarning('');
      }

      setBloodDonation((prev) => ({ ...prev, deadline: value }));
      setErrors((prev) => ({ ...prev, deadline: '' }));
      return;
    }

    const next = { ...bloodDonation, [field]: value };
    setBloodDonation(next);

    // إزالة رسالة الخطأ للحقل الحالي إن وُجدت
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];

      // معالجة خاصة للهاتف والواتساب (تحقق فوري)
      if (field === 'phone' || field === 'whatsapp') {
        delete copy.phone;
        delete copy.whatsapp;
        delete copy.contact;

        const phoneValid = validatePhoneNumberMR(
          field === 'phone' ? value : next.phone,
        );
        const whatsappValid = validatePhoneNumberMR(
         field === 'whatsapp' ? value : next.whatsapp,
        );

        if (next.phone && !validatePhoneNumberMR(next.phone)) {
          copy.phone = 'رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)';
        }
        if (next.whatsapp && !validatePhoneNumberMR(next.whatsapp)) {
          copy.whatsapp = 'رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)';
        }

        if (!phoneValid && !whatsappValid) {
          copy.contact = 'يجب إدخال رقم واحد صالح على الأقل.';
        }
      }

      return copy;
    });
  };

  /**
   * التنقل بين الخطوات
   */
  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      setShowValidationAlert(false);
      scrollToTop();
    } else {
      setShowValidationAlert(true);
      scrollToTop();
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setShowValidationAlert(false);
    scrollToTop();
  };

  /**
   * رفع الملفات الداعمة
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      setFileError('لا يمكن رفع أكثر من 5 ملفات');
      return;
    }

    const validFiles = files.filter((file) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      setFileError(
        'يُسمح بملفات JPG, PNG, PDF فقط وبحجم أقصى 5MB لكل ملف.',
      );
    } else {
      setFileError('');
    }

    setSupportDocs(validFiles);
  };

  /**
   * الإرسال إلى السيرفر
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(4)) {
      setShowValidationAlert(true);
      scrollToTop();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bloodType', bloodDonation.bloodType);
      formData.append('location', bloodDonation.location);
      if (bloodDonation.hospital) {
        formData.append('hospital', bloodDonation.hospital);
      }
      formData.append('description', bloodDonation.description);
      formData.append('deadline', bloodDonation.deadline);
      formData.append('isUrgent', bloodDonation.isUrgent ? 'true' : 'false');

      const contactMethods = [];
      if (bloodDonation.phone) {
        contactMethods.push({ method: 'phone', number: bloodDonation.phone.trim() });
      }
      if (bloodDonation.whatsapp) {
        contactMethods.push({
          method: 'whatsapp',
          number: bloodDonation.whatsapp.trim(),
        });
      }
      formData.append('contactMethods', JSON.stringify(contactMethods));

      supportDocs.forEach((file) => {
        formData.append('docs', file);
      });

      const response = await fetchWithInterceptors('/api/blood-requests', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const created = response.body;
        const newId = created?._id || created?.id || null;

        setNewRequestId(newId);
        setSuccessMessage('تم إرسال طلب التبرع بالدم بنجاح!');
        setFormSubmitted(true);
      } else {
        setErrors({
          general: response?.body?.message || 'حدث خطأ أثناء إرسال الطلب',
        });
        scrollToTop();
      }
    } catch (error) {
      console.error('Error submitting blood donation request:', error);
      setErrors({ general: 'حدث خطأ أثناء إرسال الطلب' });
      scrollToTop();
    }
  };

  /**
   * إعادة فورم جديد يدويًا
   */
  const resetForm = () => {
    setBloodDonation({
      bloodType: '',
      location: '',
      hospital: '',
      description: '',
      deadline: '',
      isUrgent: false,
      phone: '',
      whatsapp: '',
    });
    setSupportDocs([]);
    setStep(1);
    setErrors({});
    setShowValidationAlert(false);
    setSuccessMessage('');
    setFormSubmitted(false);
    setDeadlineWarning('');
    setNewRequestId(null);
    scrollToTop();
  };

  /**
   * معلومات واجهة الخطوات (UI فقط) – مختصرة
   */
  const stepInfo = {
    1: { title: 'نوع الدم والمكان', icon: '🩸' },
    2: { title: 'وصف الحالة', icon: '📝' },
    3: { title: 'الموعد النهائي', icon: '⏰' },
    4: { title: 'معلومات التواصل', icon: '📞' },
  };

  const totalSteps = 4;

  /**
   * شاشة النجاح بعد الإرسال
   */
  if (formSubmitted && successMessage) {
    return (
      <div className="donation-form-container" dir="rtl">
        <div className="success-card">
          <div className="success-icon">🎉</div>
          <h2 className="success-title">تم استلام طلبك بنجاح</h2>
          <p className="success-desc">
            سيتم عرض هذا الطلب للمتبرعين في المنصة للتواصل عبر الأرقام المرفقة.
          </p>

          <div className="success-actions">
            {newRequestId && (
              <Button
                variant="success"
                className="w-100 mb-2"
                onClick={() => {
                  window.location.href = `/blood-donation-details/${newRequestId}`;
                }}
              >
                عرض طلبي الآن
              </Button>
            )}

            <Button
              variant="outline-success"
              className="w-100 mb-2"
              onClick={() => {
                window.location.href = '/blood-donations';
              }}
            >
              مشاهدة طلبات التبرع بالدم
            </Button>

            <Button variant="primary" className="w-100" onClick={resetForm}>
              إنشاء طلب جديد
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * الواجهة الرئيسية متعددة الخطوات
   */
  return (
    <div className="donation-form-container" dir="rtl">
      {/* رأس النموذج / العنوان */}
      <header className="form-header">
        <TitleMain title="طلب تبرع بالدم 🩸" />

        {/* ✅ الفقرة التوضيحية الوحيدة (كما اتفقنا) */}
        <Alert variant="light" className="small mb-3 border">
          يمكنك استخدام هذا النموذج لطلب التبرع <strong>لنفسك</strong> أو{' '}
          <strong>لأي شخص محتاج</strong>، فقط تأكد من إدخال{' '}
          <strong>وسائل تواصل صحيحة</strong> حتى يتمكن المتبرعون من الوصول إليكم.
        </Alert>

        {/* شريط التقدم متعدد الخطوات */}
        <div
          className="steps-progress-container"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin="1"
          aria-valuemax={totalSteps}
        >
          <div className="steps-info">
            <div className="current-step-info">
              <span className="step-icon">{stepInfo[step]?.icon}</span>
              <div className="step-details">
                <h3 className="step-title">{stepInfo[step]?.title}</h3>
              </div>
            </div>

            <div className="steps-dots-header">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`step-dot-header ${
                    step >= index + 1 ? 'completed' : ''
                  } ${step === index + 1 ? 'active' : ''}`}
                  aria-label={`الخطوة ${index + 1}`}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="progress-indicator">
            <div
              className="progress-bar"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {showValidationAlert && (
        <Alert variant="danger" className="text-center">
          يرجى ملء الحقول المطلوبة قبل المتابعة
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* الخطوة 1: نوع الدم + المكان + المستشفى (اختياري) */}
        {step === 1 && (
          <div className="step-content">
            <Form.Group className="mb-3">
              <Form.Label>نوع الدم المطلوب *</Form.Label>
              <Form.Select
                value={bloodDonation.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                isInvalid={!!errors.bloodType}
              >
                <option value="">اختر نوع الدم</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Form.Select>
              {errors.bloodType && (
                <Form.Control.Feedback type="invalid">
                  {errors.bloodType}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>المكان (مدينة / ولاية) *</Form.Label>
              <Form.Select
                value={bloodDonation.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                isInvalid={!!errors.location}
              >
                <option value="">اختر المكان</option>
                {placesList.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </Form.Select>
              {errors.location && (
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>اسم المستشفى (اختياري)</Form.Label>
              <Form.Control
                type="text"
                value={bloodDonation.hospital}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
                placeholder="مثال: مستشفى الصداقة - نواكشوط"
              />
            </Form.Group>
          </div>
        )}

        {/* الخطوة 2: وصف الحالة + المرفقات */}
        {step === 2 && (
          <div className="step-content">
            <Form.Group className="mb-3">
              <Form.Label>وصف الحالة *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={bloodDonation.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="اكتب وصفاً مختصراً عن الحالة والحاجة للدم..."
                isInvalid={!!errors.description}
              />
              {errors.description && (
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الملفات الداعمة (اختياري)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                حتى 5 ملفات (صور أو PDF، حجم أقصى 5MB لكل ملف)
              </Form.Text>
              {fileError && <div className="text-danger mt-2">{fileError}</div>}
              {supportDocs.length > 0 && (
                <div className="mt-2">
                  <small className="text-success">
                    تم اختيار {supportDocs.length} ملف(ات)
                  </small>
                </div>
              )}
            </Form.Group>
          </div>
        )}

        {/* الخطوة 3: الموعد النهائي + الاستعجال */}
        {step === 3 && (
          <div className="step-content">
            <Form.Group className="mb-3">
              <Form.Label>آخر مهلة للتبرع *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={bloodDonation.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                isInvalid={!!errors.deadline}
              />
              {errors.deadline && (
                <Form.Control.Feedback type="invalid">
                  {errors.deadline}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted d-block mt-1">
                سيتم العرض بهذا الشكل:{' '}
                <strong>{formatDateTimeHuman(bloodDonation.deadline)}</strong>
              </Form.Text>

              {deadlineWarning && (
                <div className="text-warning small mt-2">{deadlineWarning}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="urgent-check"
                checked={bloodDonation.isUrgent}
                onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                label={(
                  <span style={{ color: '#e05a2e', fontWeight: 600, margin: '20px' }}>
                    حالة طارئة
                  </span>
                )}
                className="d-flex align-items-center gap-2"
              />
            </Form.Group>
          </div>
        )}

        {/* الخطوة 4: وسائل التواصل + الملخص */}
        {step === 4 && (
          <div className="step-content">
            <Form.Group className="mb-3">
              <Form.Label>
                <span className="d-inline-flex align-items-center gap-2">
                  <FiPhone /> هاتف للتواصل
                </span>
              </Form.Label>
              <Form.Control
                type="text"
                value={bloodDonation.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                isInvalid={!!errors.phone}
                placeholder="مثال: 22000000"
              />
              {errors.phone && (
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <span className="d-inline-flex align-items-center gap-2">
                  <FaWhatsapp /> واتساب
                </span>
              </Form.Label>
              <Form.Control
                type="text"
                value={bloodDonation.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                isInvalid={!!errors.whatsapp}
                placeholder="مثال: 32000000"
              />
              {errors.whatsapp && (
                <Form.Control.Feedback type="invalid">
                  {errors.whatsapp}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {errors.contact && (
              <div className="text-danger small mb-2">{errors.contact}</div>
            )}

            {/* ملخص الطلب قبل الإرسال */}
            <div className="summary-card mt-4">
              <div className="summary-card-header">
                <span className="summary-icon">📄</span>
                <div>
                  <div className="summary-title">ملخص الطلب</div>
                  <div className="summary-hint">تحقق سريع قبل الإرسال</div>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">نوع الدم</div>
                  <div className="summary-value">
                    {bloodDonation.bloodType || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">المكان</div>
                  <div className="summary-value">
                    {bloodDonation.location || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">المستشفى</div>
                  <div className="summary-value">
                    {bloodDonation.hospital || '—'}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">آخر مهلة</div>
                  <div className="summary-value">
                    {formatDateSimple(bloodDonation.deadline)}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">حالة طارئة</div>
                  <div
                    className={`summary-badge ${
                      bloodDonation.isUrgent ? 'urgent' : 'normal'
                    }`}
                  >
                    {bloodDonation.isUrgent ? 'نعم' : 'لا'}
                  </div>
                </div>

                <div className="summary-item summary-item-wide">
                  <div className="summary-label">التواصل</div>
                  <div className="summary-value">
                    {bloodDonation.phone || bloodDonation.whatsapp
                      ? [
                          bloodDonation.phone
                            ? `هاتف (${bloodDonation.phone})`
                            : null,
                          bloodDonation.whatsapp
                            ? `واتساب (${bloodDonation.whatsapp})`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' ، ')
                      : '—'}
                  </div>
                </div>

                {supportDocs.length > 0 && (
                  <div className="summary-item summary-item-wide">
                    <div className="summary-label">الملفات الداعمة</div>
                    <div className="summary-value">
                      {supportDocs.length} ملف(ات)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <Alert variant="danger" className="mt-3 text-center">
            {errors.general}
          </Alert>
        )}

        {/* أزرار التنقل / الإرسال */}
        <div className="action-buttons mt-3 d-flex gap-2 flex-wrap">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={prevStep}
              size="md"
              className="px-4 py-2"
              type="button"
            >
              السابق
            </Button>
          )}

          {step < 4 && (
            <Button
              variant="primary"
              onClick={nextStep}
              size="md"
              className="px-4 py-2"
              type="button"
            >
              التالي
            </Button>
          )}

          {step === 4 && (
            <Button
              type="submit"
              variant="success"
              size="md"
              className="px-4 py-2"
            >
              <FaCheck className="me-2" />
              إرسال الطلب
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default BloodDonationForm;

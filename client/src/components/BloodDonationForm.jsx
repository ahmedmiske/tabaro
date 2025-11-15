// src/components/BloodDonationForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

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
    description: '',
    deadline: '',
    isUrgent: false,
    // contactMethods: [{ method: 'phone'|'whatsapp', number: '2xxxxxxx' }]
    contactMethods: []
  });

  const [step, setStep] = useState(1);
  const [supportDocs, setSupportDocs] = useState([]);
  const [errors, setErrors] = useState({
    contactNumbers: {},
  });
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileError, setFileError] = useState('');
  const [deadlineWarning, setDeadlineWarning] = useState('');
  const [newRequestId, setNewRequestId] = useState(null);

  // ====== إعدادات عامة ======
  useEffect(() => {
    document.title = 'طلب تبرع بالدم - تبارو';
    return () => {
      document.title = 'تبارو - منصة التبرعات';
    };
  }, []);

  // أنواع الدم
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "غير معروف"];

  // وسائل التواصل الممكنة
  const contactOptions = [
    { key: 'phone', label: 'هاتف مباشر', icon: <FiPhone className="contact-icon" /> },
    { key: 'whatsapp', label: 'واتساب (مكالمات / رسائل)', icon: <FaWhatsapp className="contact-icon" /> }
  ];

  // قائمة الأماكن
  const placesList = [
    'اترارزة', 'أدرار', 'آسابا', 'أكجوجت', 'ألاك', 'أم التونسي',
    'أمورج', 'أوجفت', 'بئر أم اݕرين', 'بوتلميت', 'بنشاب', 'تيجكة',
    'تيشيت', 'تمبدغة', 'جعوار', 'حاسي الشيخ', 'رأس البئر', 'الرشيد',
    'روصو', 'زمال', 'سيليبابي', 'صنقرقة', 'طارة', 'فم لعبرة',
    'قيدي مقة', 'كوبني', 'كرار', 'كنكوصة', 'كيفة', 'لبديا',
    'لعصابة', 'لكصر', 'نواكشوط', 'نواذيبو', 'وألة', 'ولاتة',
    'واد الناگة', 'وسو', 'يورلي'
  ];

  /**
   * ✅ هل عندنا على الأقل رقم واحد صحيح؟
   */
  const contactsValid = useMemo(() => {
    return bloodDonation.contactMethods.some(entry =>
      validatePhoneNumberMR(entry?.number)
    );
  }, [bloodDonation.contactMethods]);

  /**
   * ✅ التحقق لكل خطوة
   */
  const validateStep = (stepNumber) => {
    const newErrors = { contactNumbers: {} };

    if (stepNumber === 1) {
      if (!bloodDonation.bloodType) newErrors.bloodType = 'نوع الدم مطلوب';
      if (!bloodDonation.location) newErrors.location = 'المكان مطلوب';
    }

    if (stepNumber === 2) {
      if (!bloodDonation.description) newErrors.description = 'الوصف مطلوب';
      // المرفقات اختيارية
    }

    if (stepNumber === 3) {
      if (!bloodDonation.deadline) newErrors.deadline = 'الموعد النهائي مطلوب';
      // isUrgent اختياري
    }

    if (stepNumber === 4) {
      // لازم يختار على الأقل وسيلة واحدة
      if (!bloodDonation.contactMethods.length) {
        newErrors.contactMethods = 'يجب اختيار طريقة تواصل واحدة على الأقل';
      }

      // تحقق من صحة كل الأرقام المُدخلة
      bloodDonation.contactMethods.forEach(({ method, number }) => {
        if (!validatePhoneNumberMR(number)) {
          newErrors.contactNumbers[method] = true;
        }
      });

      // تحقق عام: هل يوجد رقم واحد صالح؟
      if (!contactsValid) {
        newErrors.contactMethods =
          'أدخل رقم تواصل صحيح (8 أرقام ويبدأ بـ2 أو 3 أو 4)';
      }
    }

    setErrors(newErrors);

    const hasMainErrors = Object.entries(newErrors)
      .filter(([key]) => key !== 'contactNumbers')
      .some(([, val]) => !!val);

    const hasContactNumberErrors = Object.values(newErrors.contactNumbers)
      .some(v => v === true);

    return !hasMainErrors && !hasContactNumberErrors;
  };

  /**
   * تحديث حقل بسيط في bloodDonation
   * ملاحظة: لو الحقل deadline نعمل تحقق إضافي
   */
  const handleInputChange = (field, value) => {
    if (field === 'deadline') {
      const chosen = new Date(value);
      const now = new Date();

      if (chosen.getTime() < now.getTime()) {
        setDeadlineWarning('لا يمكنك اختيار وقت في الماضي.');
        setBloodDonation(prev => ({ ...prev, deadline: '' }));
        setErrors(prev => ({ ...prev, deadline: 'الرجاء اختيار وقت صالح في المستقبل' }));
        return;
      }

      const diffMs = chosen.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 2) {
        setDeadlineWarning('تنبيه: المهلة أقل من ساعتين من الآن. هل الحالة طارئة جدًا؟');
      } else {
        setDeadlineWarning('');
      }

      setBloodDonation(prev => ({ ...prev, deadline: value }));
      setErrors(prev => ({ ...prev, deadline: '' }));
      return;
    }

    setBloodDonation(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * ✅ تشغيل/إيقاف وسيلة تواصل (phone / whatsapp)
   * إذا فعّل المستخدم الوسيلة، نضيف كائن {method, number:''}
   * إذا لغى التفعيل، نحذف هذا الكائن.
   */
  const toggleContactMethod = (method, checked) => {
    setBloodDonation(prev => {
      const current = [...prev.contactMethods];

      if (checked) {
        if (!current.find(m => m.method === method)) {
          current.push({ method, number: '' });
        }
      } else {
        return {
          ...prev,
          contactMethods: current.filter(m => m.method !== method),
        };
      }

      return { ...prev, contactMethods: current };
    });

    if (errors.contactMethods) {
      setErrors(prev => ({ ...prev, contactMethods: '' }));
    }
  };

  /**
   * ✅ تغيير رقم وسيلة تواصل معينة
   */
  const handleContactNumberChange = (method, number) => {
    setBloodDonation(prev => ({
      ...prev,
      contactMethods: prev.contactMethods.map(m =>
        m.method === method ? { ...m, number } : m
      ),
    }));

    setErrors(prev => ({
      ...prev,
      contactNumbers: {
        ...prev.contactNumbers,
        [method]: !validatePhoneNumberMR(number),
      },
    }));
  };

  /**
   * التنقل بين الخطوات
   */
  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setShowValidationAlert(false);
    } else {
      setShowValidationAlert(true);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setShowValidationAlert(false);
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

    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length !== files.length) {
      setFileError(
        'بعض الملفات غير صالحة. يُسمح بملفات JPG، PNG، PDF فقط بحجم أقصى 5MB'
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

  // تأكد أن الخطوة الأخيرة صالحة
  if (!validateStep(4)) {
    setShowValidationAlert(true);
    return;
  }

  try {
    const formData = new FormData();
    formData.append('bloodType', bloodDonation.bloodType);
    formData.append('location', bloodDonation.location);
    formData.append('description', bloodDonation.description);
    formData.append('deadline', bloodDonation.deadline);
    formData.append('isUrgent', bloodDonation.isUrgent ? 'true' : 'false');

    // مهم: contactMethods بصيغة JSON نصية
    formData.append(
      'contactMethods',
      JSON.stringify(bloodDonation.contactMethods)
    );

    // ⬅⬅⬅ هنا التغيير المهم
    // backend يتوقع حقول docs / files
    // خلّينا نرسل كل الملفات على الحقل "docs"
    supportDocs.forEach((file) => {
      formData.append('docs', file); // بدل supportDocs
    });

    const response = await fetchWithInterceptors('/api/blood-requests', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      // بافتراض أن الـ body فيه الطلب الجديد
      const created = response.body;
      const newId = created?._id || created?.id || null;

      setNewRequestId(newId);
      setSuccessMessage('تم إرسال طلب التبرع بالدم بنجاح!');
      setFormSubmitted(true);

      // مانعمل reset الآن، نخليه بعد ما يختار من شاشة النجاح
    } else {
      setErrors({
        general: response?.body?.message || 'حدث خطأ أثناء إرسال الطلب',
      });
    }
  } catch (error) {
    console.error('Error submitting blood donation request:', error);
    setErrors({ general: 'حدث خطأ أثناء إرسال الطلب' });
  }
};


  /**
   * إعادة فورم جديد يدويًا
   */
  const resetForm = () => {
    setBloodDonation({
      bloodType: '',
      location: '',
      description: '',
      deadline: '',
      isUrgent: false,
      contactMethods: []
    });
    setSupportDocs([]);
    setStep(1);
    setErrors({ contactNumbers: {} });
    setShowValidationAlert(false);
    setSuccessMessage('');
    setFormSubmitted(false);
    setDeadlineWarning('');
    setNewRequestId(null);
  };

  /**
   * معلومات واجهة الخطوات (UI فقط)
   */
  const stepInfo = {
    1: {
      title: 'نوع الدم والمكان',
      description: 'اختر نوع الدم المطلوب وحدد المكان',
      icon: '🩸',
    },
    2: {
      title: 'وصف الحالة',
      description: 'اكتب وصفاً واضحاً وأرفق وثائق داعمة',
      icon: '📝',
    },
    3: {
      title: 'الموعد والإعدادات',
      description: 'حدد آخر موعد للتبرع وهل الحالة طارئة',
      icon: '⏰',
    },
    4: {
      title: 'معلومات التواصل',
      description: 'أدخل أرقام الهاتف أو الواتساب للتواصل السريع',
      icon: '📞',
    },
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
            شكراً لك. سيتم تنبيه المتبرعين القريبين من المنطقة.
          </p>

          <div className="success-actions">
            {newRequestId && (
              <Button
                variant="success"
                className="w-100 mb-2"
                onClick={() => {
                  window.location.href = `/blood-requests/${newRequestId}`;
                }}
              >
                عرض طلبي الآن
              </Button>
            )}

            <Button
              variant="outline-success"
              className="w-100 mb-2"
              onClick={() => {
                window.location.href = '/blood-requests';
              }}
            >
              مشاهدة طلبات التبرع بالدم
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

  /**
   * الواجهة الرئيسية متعددة الخطوات
   */
  return (
    <div className="donation-form-container" dir="rtl">
      {/* رأس النموذج / العنوان */}
      <header className="form-header">
        <TitleMain title="طلب تبرع بالدم 🩸" />

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
                <p className="step-description">
                  {stepInfo[step]?.description}
                </p>
              </div>
            </div>

            {/* الدوائر اللي فوق */}
            <div className="steps-dots-header">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`step-dot-header ${
                    step >= index + 1 ? 'completed' : ''
                  } ${step === index + 1 ? 'active' : ''}`}
                  aria-label={`الخطوة ${index + 1}: ${stepInfo[index + 1]?.title}`}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* الـ progress bar */}
          <div className="progress-indicator">
            <div
              className={`progress-bar ${formSubmitted ? 'complete' : ''}`}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {showValidationAlert && (
        <Alert variant="danger" className="text-center">
          يرجى ملء جميع الحقول المطلوبة قبل المتابعة
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* الخطوة 1: نوع الدم + المكان */}
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
              <Form.Label>المكان *</Form.Label>
              <Form.Select
                value={bloodDonation.location}
                onChange={(e) =>
                  handleInputChange('location', e.target.value)
                }
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
          </div>
        )}

        {/* الخطوة 2: وصف الحالة + المرفقات */}
        {step === 2 && (
          <div className="step-content">
            <h4 className="step-title">وصف الحالة</h4>
            <Form.Group className="mb-3">
              <Form.Label>وصف الحالة *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={bloodDonation.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="اكتب وصفاً مفصلاً عن الحالة والحاجة للتبرع..."
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
                يمكنك رفع حتى 5 ملفات (صور أو PDF، حجم أقصى 5MB لكل ملف)
              </Form.Text>
              {fileError && (
                <div className="text-danger mt-2">{fileError}</div>
              )}
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
            <h4 className="step-title">الموعد النهائي</h4>

            <Form.Group className="mb-3">
              <Form.Label>آخر مهلة للتبرع *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={bloodDonation.deadline}
                onChange={(e) =>
                  handleInputChange('deadline', e.target.value)
                }
                isInvalid={!!errors.deadline}
              />
              {errors.deadline && (
                <Form.Control.Feedback type="invalid">
                  {errors.deadline}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted d-block mt-1">
                سيتم عرضه للمستخدمين بهذه الصيغة:{' '}
                <strong>{formatDateTimeHuman(bloodDonation.deadline)}</strong>
              </Form.Text>

              {deadlineWarning && (
                <div className="text-warning small mt-2">
                  {deadlineWarning}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="حالة طارئة"
                checked={bloodDonation.isUrgent}
                onChange={(e) =>
                  handleInputChange('isUrgent', e.target.checked)
                }
              />
            </Form.Group>
          </div>
        )}

        {/* الخطوة 4: وسائل التواصل + الملخص */}
        {step === 4 && (
          <div className="step-content">
            <h4 className="step-title">طرق التواصل</h4>

            <Form.Group className="mb-3">
              <Form.Label>اختر طرق التواصل وأدخل الرقم *</Form.Label>

              {contactOptions.map((opt) => {
                const { key: method, label, icon } = opt;

                // هل هذه الوسيلة مفعَّلة؟
                const selectedEntry = bloodDonation.contactMethods.find(
                  (m) => m.method === method
                );

                return (
                  <div
                    key={method}
                    className={`contact-method-card ${selectedEntry ? 'active' : ''}`}
                  >
                    {/* checkbox لتشغيل/إلغاء الوسيلة */}
                    <Form.Check
                      type="checkbox"
                      label={
                        <span className="contact-method-label">
                          <span className="contact-method-icon-wrap">
                            {icon}
                          </span>
                          <span>{label}</span>
                        </span>
                      }
                      checked={!!selectedEntry}
                      onChange={(e) =>
                        toggleContactMethod(method, e.target.checked)
                      }
                    />

                    {/* إذا مفعّلة، نظهر حقل الرقم */}
                    {selectedEntry && (
                      <>
                        <Form.Control
                          type="text"
                          className="mt-2"
                          placeholder="رقم (8 أرقام ويبدأ بـ2 أو 3 أو 4)"
                          value={selectedEntry.number}
                          isInvalid={!!errors.contactNumbers?.[method]}
                          onChange={(e) =>
                            handleContactNumberChange(
                              method,
                              e.target.value
                            )
                          }
                          required
                        />
                        {errors.contactNumbers?.[method] && (
                          <div className="invalid-feedback d-block">
                            الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {errors.contactMethods && (
                <div className="text-danger mt-2">
                  {errors.contactMethods}
                </div>
              )}

              {!contactsValid && (
                <div className="text-danger small">
                  يجب إدخال رقم واحد صالح على الأقل.
                </div>
              )}
            </Form.Group>

            {/* ملخص الطلب قبل الإرسال */}
            <div className="summary-card mt-4">
              <div className="summary-card-header">
                <span className="summary-icon">📄</span>
                <div>
                  <div className="summary-title">ملخص الطلب</div>
                  <div className="summary-hint">يرجى التأكد قبل الإرسال النهائي</div>
                </div>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-label">نوع الدم</div>
                  <div className="summary-value">{bloodDonation.bloodType || '—'}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">المكان</div>
                  <div className="summary-value">{bloodDonation.location || '—'}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">آخر مهلة</div>
                  <div className="summary-value">
                    {formatDateSimple(bloodDonation.deadline)}
                  </div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">حالة طارئة</div>
                  <div className={`summary-badge ${bloodDonation.isUrgent ? 'urgent' : 'normal'}`}>
                    {bloodDonation.isUrgent ? 'نعم' : 'لا'}
                  </div>
                </div>

                <div className="summary-item summary-item-wide">
                  <div className="summary-label">التواصل</div>
                  <div className="summary-value">
                    {(bloodDonation.contactMethods || []).length
                      ? bloodDonation.contactMethods
                          .map((m) => {
                            const niceLabel = m.method === 'phone' ? 'هاتف' : 'واتساب';
                            return `${niceLabel} (${m.number || 'بدون رقم'})`;
                          })
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

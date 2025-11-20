// src/pages/social/SocialForm.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import fetchWithInterceptors from '../../services/fetchWithInterceptors';
import TitleMain from '../../components/TitleMain.jsx';
import { SOCIAL_AD_CATEGORY, CATEGORY_LABELS_AR } from '../../constants/social.enums';

import '../../styles/social/social-form.css';

const MIN_DESC = 30;

const SocialForm = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   document.title = 'إعلان اجتماعي - تبارو';
  //   return () => { document.title = 'تبارو - منصة التبرعات'; };
  // }, []);

  // ========= الحالة =========
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [form, setForm] = useState({
    category: '',
    wilaya: '',
    city: '',
    title: '',
    description: '',
    durationDays: 30,
    extraFields: {},
  });

  const [files, setFiles] = useState([]);            // ملفات مختارة من المستخدم
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ========= بيانات =========
  const wilayas = ['نواكشوط', 'نواذيبو', 'اترارزة', 'الحوض الغربي', 'الحوض الشرقي'];
  const cities  = ['تفرغ زينة', 'عرفات', 'لكصر', 'ازويرات', 'روصو'];

  // بطاقات الفئات + الأيقونات
  const categoryCards = [
    { id: SOCIAL_AD_CATEGORY.VOLUNTEERING,           icon: '🤝', label: CATEGORY_LABELS_AR.VOLUNTEERING },
    { id: SOCIAL_AD_CATEGORY.SOCIAL_IDEA,            icon: '💡', label: CATEGORY_LABELS_AR.SOCIAL_IDEA },
    { id: SOCIAL_AD_CATEGORY.JOB_SEEKER,             icon: '🔎', label: CATEGORY_LABELS_AR.JOB_SEEKER },
    { id: SOCIAL_AD_CATEGORY.JOB_OFFER,              icon: '🧱', label: CATEGORY_LABELS_AR.JOB_OFFER },
    { id: SOCIAL_AD_CATEGORY.MISSING_PERSON_SEARCH,  icon: '🚨', label: CATEGORY_LABELS_AR.MISSING_PERSON_SEARCH },
    { id: SOCIAL_AD_CATEGORY.MISSING_PERSON_FOUND,   icon: '🗣️', label: CATEGORY_LABELS_AR.MISSING_PERSON_FOUND },
  ];

  // الحقول الإضافية حسب النوع (عناوين عربية داخل المدخلات)
  const fieldsByCategory = useMemo(() => ({
    VOLUNTEERING: [
      { name: 'organizer', label: 'الجهة المنظمة' },
      { name: 'neededVolunteers', label: 'عدد المتطوعين المطلوبين' },
      { name: 'dateOrSchedule', label: 'التاريخ / الفترة' },
    ],
    SOCIAL_IDEA: [
      { name: 'targetAudience', label: 'الفئة المستهدفة' },
      { name: 'ideaType', label: 'نوع الفكرة (ثقافية/بيئية/تعليمية…)' },
    ],
    JOB_SEEKER: [
      { name: 'profession', label: 'المهنة المطلوبة' },
      { name: 'experience', label: 'الخبرة' },
      { name: 'availability', label: 'التوافر' },
    ],
    JOB_OFFER: [
      { name: 'employer', label: 'الجهة/الشركة' },
      { name: 'requirements', label: 'المتطلبات' },
      { name: 'salaryRange', label: 'نطاق الراتب (اختياري)' },
      { name: 'contractType', label: 'نوع العقد' },
    ],
  }), []);
  const extraFieldsForCategory = fieldsByCategory[form.category] || [];

  // خريطة ترجمة مفاتيح التفاصيل الإضافية للعربية (تُستخدم في المراجعة)
  const extraFieldLabelsAR = {
    organizer: 'الجهة المنظمة',
    neededVolunteers: 'عدد المتطوعين المطلوبين',
    dateOrSchedule: 'التاريخ / الفترة',
    targetAudience: 'الفئة المستهدفة',
    ideaType: 'نوع الفكرة',
    approxAge: 'العمر التقريبي',
    lastSeenPlace: 'آخر مكان شوهد فيه',
    lastSeenTime: 'الوقت التقريبي',
    guardianConsent: 'موافقة ولي الأمر',
    foundPlace: 'مكان العثور',
    foundTime: 'وقت العثور',
    profession: 'المهنة المطلوبة',
    experience: 'الخبرة',
    availability: 'التوافر',
    employmentType: 'نوع العمل',
    employer: 'الجهة / الشركة',
    requirements: 'المتطلبات',
    salaryRange: 'نطاق الراتب',
    contractType: 'نوع العقد',
  };

  // ========= رأس الخطوات =========
  const stepInfo = {
    1: { title: 'النوع والمكان',    description: 'اختر نوع الإعلان وحدد المنطقة',          icon: '📌' },
    2: { title: 'التفاصيل الأساسية', description: 'اكتب العنوان والوصف وارفع الملفات',       icon: '📝' },
    3: { title: 'تفاصيل إضافية',     description: 'حقول مخصصة حسب نوع الإعلان',             icon: '➕' },
    4: { title: 'مراجعة ونشر',       description: 'تحقق من المعلومات ثم أنشئ الإعلان',       icon: '✅' },
  };

  // ========= تغييرات الحقول =========
  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };
  const handleExtraChange = (name, value) => {
    setForm((f) => ({ ...f, extraFields: { ...f.extraFields, [name]: value } }));
  };

  // ========= رفع الملفات =========
  const onFilesPick = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length > 5) {
      setFileError('لا يمكن رفع أكثر من 5 ملفات');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const valid = list.filter((f) => validTypes.includes(f.type) && f.size <= maxSize);
    if (valid.length !== list.length) {
      setFileError('بعض الملفات غير صالحة. يُسمح بـ JPG/PNG/PDF وبحجم أقصى 5MB لكل ملف.');
    } else setFileError('');
    setFiles(valid);
  };

  // ========= التحقق =========
  const validateStep = (n) => {
    const e = {};
    switch (n) {
      case 1:
        if (!form.category) e.category = 'نوع الإعلان مطلوب';
        if (!form.wilaya)  e.wilaya  = 'الولاية مطلوبة';
        if (!form.city)    e.city    = 'المدينة مطلوبة';
        break;
      case 2:
        if (!form.title) e.title = 'العنوان مطلوب';
        if (!form.description) e.description = 'الوصف مطلوب';
        else if (String(form.description).trim().length < MIN_DESC)
          e.description = `الوصف قصير (الحد الأدنى ${MIN_DESC} حرفًا)`;
        break;
      case 3:
        if (form.category === 'JOB_OFFER' && !form.extraFields?.employer)
          e.employer = 'الجهة/الشركة مطلوبة';
        break;
      default: break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      setShowValidationAlert(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else setShowValidationAlert(true);
  };
  const prevStep = () => {
    setStep((s) => s - 1);
    setShowValidationAlert(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========= الإرسال =========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) { setShowValidationAlert(true); return; }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('durationDays', String(form.durationDays));
      fd.append('location', JSON.stringify({ wilaya: form.wilaya, city: form.city }));
      fd.append('extraFields', JSON.stringify(form.extraFields || {}));
      files.forEach((f) => fd.append('files', f));

      const resp = await fetchWithInterceptors('/api/social-ads', { method: 'POST', body: fd });
      if (resp?.ok) {
        const body = resp.body || {};
        setSuccessMessage('تم نشر إعلانك بنجاح!');
        setTimeout(() => {
          if (body?._id) navigate(`/social/${body._id}`); else navigate('/social');
        }, 900);
      }
    } catch (err) {
      setErrors({ general: err?.message || 'حدث خطأ أثناء إنشاء الإعلان' });
    } finally {
      setSubmitting(false);
    }
  };

  // ========= الواجهة =========
  return (
    <div className="donation-form-container">
      {/* رأس مثل نموذج الدم */}
      <header className="form-header">
        <TitleMain title="إعلان اجتماعي" />
        <div className="steps-progress-container" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax={totalSteps}>
          <div className="steps-info">
            <div className="current-step-info">
              <span className="step-icon">{stepInfo[step]?.icon}</span>
              <div className="step-details">
                <h3 className="step-title">{stepInfo[step]?.title}</h3>
                <p className="step-description">{stepInfo[step]?.description}</p>
              </div>
            </div>
            <div className="steps-dots-header">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i + 1}
                  className={`step-dot-header ${step >= i + 1 ? 'completed' : ''} ${step === i + 1 ? 'active' : ''}`}
                  aria-label={`الخطوة ${i + 1}: ${stepInfo[i + 1]?.title}`}
                >
                  {step > i + 1 ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="progress-indicator">
            <div className="progress-bar" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
        </div>
      </header>

      {showValidationAlert && (
        <Alert variant="danger" className="text-center">يرجى ملء الحقول المطلوبة قبل المتابعة</Alert>
      )}
      {errors.general && <Alert variant="danger" className="text-center">{errors.general}</Alert>}

      <Form onSubmit={handleSubmit}>
        {/* ===== الخطوة 1: النوع والمكان ===== */}
        {step === 1 && (
          <div className="step-content">
            {/* بطاقات الفئات مع الأيقونات */}
            <Form.Group className="mb-3">
              <Form.Label>نوع الإعلان *</Form.Label>
              <div className="cat-cards">
                {categoryCards.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    className={`cat-card ${form.category === c.id ? 'is-selected' : ''}`}
                    onClick={() => handleChange('category', c.id)}
                    aria-pressed={form.category === c.id}
                  >
                    <span className="cat-ico">{c.icon}</span>
                    <span className="cat-txt">{c.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && <div className="text-danger mt-2">{errors.category}</div>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الولاية *</Form.Label>
              <Form.Select
                value={form.wilaya}
                onChange={(e) => handleChange('wilaya', e.target.value)}
                isInvalid={!!errors.wilaya}
              >
                <option value="">اختر الولاية</option>
                {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
              </Form.Select>
              {errors.wilaya && <Form.Control.Feedback type="invalid">{errors.wilaya}</Form.Control.Feedback>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>المدينة *</Form.Label>
              <Form.Select
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                isInvalid={!!errors.city}
              >
                <option value="">اختر المدينة</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
              {errors.city && <Form.Control.Feedback type="invalid">{errors.city}</Form.Control.Feedback>}
            </Form.Group>
          </div>
        )}

        {/* ===== الخطوة 2: التفاصيل + رفع ملفات ===== */}
        {step === 2 && (
          <div className="step-content">
            <h4 className="step-title">التفاصيل الأساسية</h4>

            <Form.Group className="mb-3">
              <Form.Label>العنوان *</Form.Label>
              <Form.Control
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                isInvalid={!!errors.title}
                placeholder="عنوان مختصر وواضح"
              />
              {errors.title && <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الوصف *</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                isInvalid={!!errors.description}
                placeholder="اكتب وصفًا واضحًا دون بيانات حساسة. الحد الأدنى 30 حرفًا."
              />
              <div className="d-flex justify-content-between">
                <small className={form.description.trim().length >= MIN_DESC ? 'text-success' : 'text-muted'}>
                  {form.description.trim().length} / {MIN_DESC}
                </small>
                {errors.description && <div className="text-danger">{errors.description}</div>}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الملفات الداعمة (اختياري)</Form.Label>
              <Form.Control type="file" multiple accept="image/*,.pdf" onChange={onFilesPick} />
              <Form.Text muted>حتى 5 ملفات (صور أو PDF) — 5MB كحد أقصى لكل ملف</Form.Text>
              {fileError && <div className="text-danger mt-2">{fileError}</div>}
              {files.length > 0 && (
                <div className="mt-2">
                  <small className="text-success">تم اختيار {files.length} ملف(ات)</small>
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>مدة الصلاحية (أيام)</Form.Label>
              <Form.Control
                type="number" min="1" max="180"
                value={form.durationDays}
                onChange={(e) => handleChange('durationDays', e.target.value)}
              />
            </Form.Group>
          </div>
        )}

        {/* ===== الخطوة 3: حقول إضافية ===== */}
        {step === 3 && (
          <div className="step-content">
            <h4 className="step-title">تفاصيل إضافية</h4>
            {extraFieldsForCategory.length ? (
              extraFieldsForCategory.map((f) => (
                <Form.Group className="mb-3" key={f.name}>
                  <Form.Label>{f.label}</Form.Label>
                  <Form.Control
                    value={form.extraFields[f.name] || ''}
                    onChange={(e) => handleExtraChange(f.name, e.target.value)}
                    isInvalid={!!errors[f.name]}
                  />
                  {errors[f.name] && <Form.Control.Feedback type="invalid">{errors[f.name]}</Form.Control.Feedback>}
                </Form.Group>
              ))
            ) : (
              <Alert variant="light">لا توجد تفاصيل إضافية لهذا النوع.</Alert>
            )}
          </div>
        )}

        {/* ===== الخطوة 4: المراجعة ===== */}
        {step === 4 && (
          <div className="step-content">
            <h4 className="step-title">مراجعة ونشر</h4>
            <ul className="mb-3">
              <li><strong>النوع:</strong> {CATEGORY_LABELS_AR[form.category] || '—'}</li>
              <li><strong>الموقع:</strong> {form.wilaya} — {form.city}</li>
              <li><strong>العنوان:</strong> {form.title}</li>
              <li><strong>المدة:</strong> {form.durationDays} يومًا</li>
            </ul>
            <div className="mb-3">
              <strong>الوصف:</strong>
              <p className="mb-0">{form.description}</p>
            </div>
            {Object.keys(form.extraFields || {}).length > 0 && (
              <div className="mb-3">
                <strong>تفاصيل إضافية:</strong>
                <ul className="mb-0">
                  {Object.entries(form.extraFields).map(([k, v]) => (
                    <li key={k}><b>{extraFieldLabelsAR[k] || k}:</b> {String(v)}</li>
                  ))}
                </ul>
              </div>
            )}
            {files.length > 0 && (
              <div className="mb-2">
                <strong>الملفات المختارة:</strong> {files.length} ملف(ات)
              </div>
            )}
          </div>
        )}

        {/* أزرار التنقل */}
        <div className="action-buttons mt-3 d-flex gap-2">
          {step > 1 && (
            <Button variant="secondary" onClick={prevStep} size="md" className="px-4 py-2">
              السابق
            </Button>
          )}
          {step < totalSteps && (
            <Button variant="primary" onClick={nextStep} size="md" className="px-4 py-2">
              التالي
            </Button>
          )}
          {step === totalSteps && (
            <Button type="submit" variant="success" size="md" className="px-4 py-2" disabled={submitting}>
              <FaCheck className="me-2" />
              {submitting ? 'جارِ النشر…' : 'نشر الإعلان'}
            </Button>
          )}
        </div>
      </Form>

      {successMessage && (
        <Alert variant="success" className="text-center mt-3">
          <FaCheck className="me-2" />
          {successMessage}
        </Alert>
      )}
    </div>
  );
};

export default SocialForm;

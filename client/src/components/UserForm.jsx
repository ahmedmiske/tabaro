// src/components/UserForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Toast, Alert, Spinner, InputGroup } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { FaArrowRight, FaArrowLeft, FaCheck, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';

import './UserForm.css';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_IMAGE_MB = 5;
const isAllowedImage = (f) =>
  f && ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_MB * 1024 * 1024;

// 🔐 شرط بسيط لقوة كلمة المرور: على الأقل 6، فيها حرف ورقم
const isMediumPassword = (pwd) => {
  if (!pwd || typeof pwd !== 'string' || pwd.length < 6) return false;
  const hasLetter = /[A-Za-z]/.test(pwd);
  const hasDigit = /\d/.test(pwd);
  return hasLetter && hasDigit;
};

// ✅ شرط بسيط لشكل رقم الهاتف: أرقام فقط، من 6 إلى 15 رقم
const isPhoneFormatValid = (phone) => /^[0-9]{6,15}$/.test(phone);

// فلاغ OTP (حاليًا معطّل، لكن التحقق من الهاتف يشتغل)
const USE_OTP = false;

function UserForm({
  addUser,
  isLoading,
  className,
  currentStep = 1,
  onNextStep,
  onPreviousStep,
}) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    address: '',
    wilaya: '',
    moughataa: '',
    commune: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: '',
    // الموقع
    locationMode: 'mr', // 'mr' = داخل موريتانيا, 'abroad' = خارجها
    country: '',
    city: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  // أوتوكومبليت للبلدية داخل موريتانيا
  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);

  // حالة التحقق من الهاتف
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneCheckStatus, setPhoneCheckStatus] = useState(null); // 'ok' | 'exists' | 'invalid'
  const [phoneCheckMessage, setPhoneCheckMessage] = useState('');

  const step = currentStep;
  const [error, setError] = useState('');
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();
  
  const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : '');
  const getOptionLabel = (option) => option?.name_ar || '';
  
  const [institutionNotice, setInstitutionNotice] = useState(false);

  /* ================= تحميل القوائم من الباكند ================= */

  useEffect(() => {
    let ignore = false;

    const extractArray = (response) => {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (Array.isArray(response.body)) return response.body;
      if (Array.isArray(response.data)) return response.data;
      if (response.body && Array.isArray(response.body.items)) return response.body.items;
      return [];
    };

    const fetchOptions = async (endpoint, setter) => {
      try {
        const response = await fetchWithInterceptors(endpoint);
        const list = extractArray(response);
        if (!ignore) setter(list);
      } catch {
        if (!ignore) setter([]);
      }
    };

    fetchOptions('/api/wilayas', setWilayaOptions);
    fetchOptions('/api/moughataas', setMoughataaOptions);
    fetchOptions('/api/communes', setCommuneOptions);

    return () => {
      ignore = true;
    };
  }, []);

  const findOption = (options, value) => {
    const normalized = normalizeValue(value);
    if (!normalized) return null;
    return options.find((opt) => normalizeValue(opt.name_ar) === normalized) || null;
  };

  /* ================= منطق الموقع داخل موريتانيا ================= */

  const selectedCommune = useMemo(
    () =>
      user.locationMode === 'mr'
        ? findOption(communeOptions, user.commune)
        : null,
    [communeOptions, user.commune, user.locationMode],
  );

  const selectedMoughataa = useMemo(() => {
    if (user.locationMode !== 'mr' || !selectedCommune?.code) return null;
    const mCode = selectedCommune.code.slice(0, 4);
    return moughataaOptions.find((m) => m.code === mCode) || null;
  }, [selectedCommune, moughataaOptions, user.locationMode]);

  const selectedWilaya = useMemo(() => {
    if (user.locationMode !== 'mr' || !selectedCommune?.code) return null;
    const wCode = selectedCommune.code.slice(0, 2);
    return wilayaOptions.find((w) => w.code === wCode) || null;
  }, [selectedCommune, wilayaOptions, user.locationMode]);

  // ملء الولاية والمقاطعة تلقائياً من البلدية (فقط لموريتانيا)
  useEffect(() => {
    if (user.locationMode !== 'mr' || !selectedCommune) return;

    setUser((prev) => {
      const next = { ...prev };
      if (selectedMoughataa) next.moughataa = getOptionLabel(selectedMoughataa);
      if (selectedWilaya) next.wilaya = getOptionLabel(selectedWilaya);
      return next;
    });
  }, [selectedCommune, selectedMoughataa, selectedWilaya, user.locationMode]);

  // أوتوكومبليت للبلدية
  const filteredCommuneAutocomplete = useMemo(() => {
    if (user.locationMode !== 'mr') return [];
    const term = normalizeValue(user.commune);
    if (!term) return communeOptions.slice(0, 10);
    return communeOptions
      .filter((c) => normalizeValue(getOptionLabel(c)).includes(term))
      .slice(0, 10);
  }, [user.commune, communeOptions, user.locationMode]);

  const isCommuneValueValid = (value) => {
    if (!value?.trim()) return false;
    return Boolean(findOption(communeOptions, value));
  };
  const communeInputInvalid =
    user.locationMode === 'mr' &&
    Boolean(user.commune?.trim()) &&
    !isCommuneValueValid(user.commune);

  /* ==================== التحقق من رقم الهاتف ==================== */

  const resetPhoneCheck = () => {
    setPhoneCheckStatus(null);
    setPhoneCheckMessage('');
  };

  const checkPhoneUnique = async (value) => {
    const phone = normalizeValue(value);

    // لا شيء مكتوب → لا نعرض أي رسالة
    if (!phone) {
      resetPhoneCheck();
      return;
    }

    // ✅ تحقق شكلي محلي (أرقام فقط وطول معقول)
    if (!isPhoneFormatValid(phone)) {
      setPhoneCheckStatus('invalid');
      setPhoneCheckMessage(
        'رقم الهاتف غير صالح: استخدم أرقامًا فقط بدون مسافات أو رموز، بين 6 و 15 رقمًا.',
      );
      return;
    }

    setIsCheckingPhone(true);
    try {
      const res = await fetchWithInterceptors(
        `/api/users/check-phone?phone=${encodeURIComponent(phone)}`,
      );

      const available =
        res?.body?.available ?? res?.data?.available ?? res?.available;

      if (res?.ok && available === true) {
        setPhoneCheckStatus('ok');
        setPhoneCheckMessage('هذا الرقم متاح للتسجيل.');
      } else if (res?.ok && available === false) {
        setPhoneCheckStatus('exists');
        setPhoneCheckMessage(
          'هذا الرقم مسجّل مسبقاً. إذا كان رقمك فجرّب تسجيل الدخول بدلاً من إنشاء حساب جديد.',
        );
      } else {
        // ❌ في هذه النسخة لا نعرض رسالة "تعذر الاتصال" للمستخدم
        resetPhoneCheck();
      }
    } catch {
      // ❌ نفس الشيء: أي خطأ شبكة → نلغي التحقق بصمت
      resetPhoneCheck();
    } finally {
      setIsCheckingPhone(false);
    }
  };

  /* ======================== Handlers عامة ======================== */

     const handleChange = (e) => {
    const { name, value } = e.target;

    // 👇 منطق خاص بنوع الحساب
    if (name === 'userType') {
      if (value === 'institutional') {
        // لا نسمح باختياره في هذه النسخة
        setInstitutionNotice(true);
        // نترك userType فارغ حتى لا يُعتبر صالحاً
        setUser((prev) => ({ ...prev, userType: '' }));
        return;
      }

      // إذا اختار "فرد" نخفي الملاحظة
      setInstitutionNotice(false);
    }

    setUser((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'locationMode' && value === 'abroad'
        ? {
            commune: '',
            wilaya: '',
            moughataa: '',
          }
        : {}),
    }));

    if (name === 'commune') setShowCommuneSuggestions(true);
    if (name === 'phoneNumber') resetPhoneCheck();
  };


  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setProfileImage(null);
      setFileError('');
      return;
    }
    if (!isAllowedImage(f)) {
      setProfileImage(null);
      setFileError(
        `❌ ملف غير مسموح: يُقبل فقط ${ALLOWED_IMAGE_TYPES.map((t) =>
          t.split('/')[1],
        ).join(', ')} وبحجم ≤ ${MAX_IMAGE_MB}MB`,
      );
      // eslint-disable-next-line no-param-reassign
      e.target.value = '';
      return;
    }
    setFileError('');
    setProfileImage(f);
  };

  const handleSelectCommune = (option) => {
    const label = getOptionLabel(option);
    setUser((prev) => ({ ...prev, commune: label }));
    setShowCommuneSuggestions(false);
  };

  /* ========================== التحقق لكل خطوة ========================== */

  const validateStep = () => {
    let valid = true;

    if (step === 1 && !user.userType) valid = false;

    if (step === 2) {
      if (!user.phoneNumber?.trim()) valid = false;
      if (phoneCheckStatus === 'exists' || phoneCheckStatus === 'invalid') valid = false;
    }

    if (step === 3) {
      if (user.userType === 'individual') {
        if (!user.firstName?.trim() || !user.lastName?.trim()) valid = false;
      } else if (user.userType === 'institutional') {
        if (
          !user.institutionName?.trim() ||
          !user.institutionLicenseNumber?.trim() ||
          !user.institutionAddress?.trim()
        ) {
          valid = false;
        }
      } else {
        valid = false;
      }
    }

    if (step === 4) {
      if (user.locationMode === 'mr') {
        if (!user.commune?.trim() || !isCommuneValueValid(user.commune)) valid = false;
      } else if (user.locationMode === 'abroad') {
        if (!user.country?.trim() || !user.city?.trim()) valid = false;
      } else {
        valid = false;
      }
    }

    if (step === 5) {
      if (
        !user.username?.trim() ||
        !user.password ||
        user.password !== user.confirmPassword ||
        !isMediumPassword(user.password)
      ) {
        valid = false;
      }
    }

    setShowValidationAlert(!valid);
    return valid;
  };

  const mapBackendErrorToFriendly = (backendMessage) => {
    const msg = String(backendMessage || '').toLowerCase();
    if (msg.includes('e11000') && msg.includes('email')) {
      return 'هذا البريد الإلكتروني مسجَّل مسبقاً. إذا كان هذا بريدك فجرّب تسجيل الدخول، أو استخدم بريدًا آخر للتسجيل.';
    }
    if (msg.includes('e11000') && msg.includes('phonenumber')) {
      return 'رقم الهاتف هذا مسجَّل مسبقاً. إذا كان رقمك، فجرّب تسجيل الدخول بدلاً من إنشاء حساب جديد.';
    }
    if (msg.includes('e11000') && msg.includes('username')) {
      return 'اسم المستخدم مستعمَل من قبل. من فضلك اختر اسم مستخدم آخر.';
    }
    if (backendMessage) return String(backendMessage);
    return 'حدث خطأ أثناء إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى.';
  };

  /* ============================ الإرسال ============================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    // تحضير بيانات الإرسال
    let preparedUser = { ...user };

    // إذا كان المستخدم خارج موريتانيا نعيد استخدام الحقول الحالية
    if (preparedUser.locationMode === 'abroad') {
      if (preparedUser.country) preparedUser.wilaya = preparedUser.country;
      if (preparedUser.city) preparedUser.moughataa = preparedUser.city;
      if (!preparedUser.commune) preparedUser.commune = '';
    }

    if (addUser) {
      const userData = { ...preparedUser };
      if (profileImage) userData.profileImage = profileImage;
      await addUser(userData);
      return;
    }

    const fd = new FormData();
    Object.entries(preparedUser).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (profileImage) fd.append('profileImage', profileImage);

    try {
      const response = await fetchWithInterceptors('/api/users', {
        method: 'POST',
        body: fd,
      });

      if (response && response.ok) {
        setShowSuccessMessage(true);
        setError('');
      } else {
        const backendMessage =
          response?.body?.message || response?.body?.error || response?.message;
        setError(mapBackendErrorToFriendly(backendMessage));
      }
    } catch {
      setError('تعذر الاتصال بالخادم. حاول لاحقاً.');
    }
  };

  /* ============================ JSX ============================ */

  return (
    <div className="user-form-container">
      {showValidationAlert && (
        <Alert variant="danger" className="text-center user-form-error-alert">
          ⚠️ يرجى ملء الحقول المطلوبة قبل المتابعة.
        </Alert>
      )}
      {fileError && (
        <Alert variant="warning" className="text-center user-form-error-alert">
          {fileError}
        </Alert>
      )}

      {showSuccessMessage ? (
        <div className="success-message-box text-center">
          <h4>🎉 تم إرسال بياناتك بنجاح!</h4>
          <p>تم إنشاء حسابك على المنصة، يمكنك الآن تسجيل الدخول باسم المستخدم وكلمة المرور.</p>
          <Button className="go-login-button" onClick={() => navigate('/login')}>
            الانتقال إلى صفحة تسجيل الدخول
          </Button>
        </div>
      ) : (
        <>
          {/* رسالة خطأ خفيفة وصغيرة تحت الهيدر/الخطوات */}
          {error && (
            <Alert variant="danger" className="text-center user-form-error-alert">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className={`user-form ${className || ''}`}>
            {/* 1. نوع الحساب */}
                         {step === 1 && (
              <div className="info-section">
                <h4 className="step-title">1. اختيار نوع الحساب</h4>
                <Form.Group>
                  <Form.Label>نوع الحساب</Form.Label>
                  <Form.Select
                    name="userType"
                    value={user.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- اختر --</option>
                    <option value="individual">فرد</option>
                    <option value="institutional">مؤسسة (قريباً)</option>
                  </Form.Select>
                </Form.Group>

                {institutionNotice && (
                  <small className="text-muted d-block mt-2">
                    🔔 في هذه النسخة التجريبية، التسجيل مفتوح للحسابات الفردية فقط.
                    سيتم فتح حسابات المؤسسات والهيئات الخيرية في التحديث القادم إن شاء الله.
                  </small>
                )}
              </div>
            )}

            {/* 2. بيانات التواصل */}
            {step === 2 && (
              <div className="info-section">
                <h4 className="step-title">2. بيانات التواصل</h4>

                {/* رقم الهاتف */}
                <Form.Group>
                  <Form.Label>رقم الهاتف</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaPhoneAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={user.phoneNumber}
                      onChange={handleChange}
                      onBlur={() => checkPhoneUnique(user.phoneNumber)}
                      placeholder="مثال: 44112233"
                      required
                    />
                  </InputGroup>

                  <div className="phone-check-hint">
                    {isCheckingPhone && (
                      <span className="text-muted d-block mt-1">
                        <Spinner animation="border" size="sm" className="me-1" />
                        يتم التحقق من رقم الهاتف...
                      </span>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'ok' && (
                      <small className="text-success d-block mt-1">{phoneCheckMessage}</small>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'exists' && (
                      <small className="text-danger d-block mt-1">{phoneCheckMessage}</small>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'invalid' && (
                      <small className="text-danger d-block mt-1">{phoneCheckMessage}</small>
                    )}
                  </div>

                  {!USE_OTP && (
                    <small className="text-muted d-block mt-1">
                      * نتحقق فقط من أن الرقم غير مكرر وأن شكله صحيح في هذه النسخة.
                    </small>
                  )}
                </Form.Group>

                {/* رقم واتساب */}
                <Form.Group className="mt-3">
                  <Form.Label>رقم واتساب (اختياري)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ color: '#25D366' }}>
                      <FaWhatsapp />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="whatsappNumber"
                      value={user.whatsappNumber}
                      onChange={handleChange}
                      placeholder=""
                    />
                  </InputGroup>
                </Form.Group>

                {/* البريد الإلكتروني */}
                <Form.Group className="mt-3">
                  <Form.Label>البريد الإلكتروني (اختياري)</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </Form.Group>
              </div>
            )}

            {/* 3. بيانات شخصية / مؤسسية */}
            {step === 3 && (
              <div className="info-section">
                {user.userType === 'individual' ? (
                  <>
                    <h4 className="step-title">3. تسجيل بياناتك الأساسية</h4>
                    <Form.Group>
                      <Form.Label>الاسم الشخصي</Form.Label>
                      <Form.Control
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>الاسم العائلي</Form.Label>
                      <Form.Control
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>الصورة الشخصية (اختياري)</Form.Label>
                      <Form.Control
                        type="file"
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        onChange={handleFileChange}
                      />
                      {profileImage && (
                        <small className="text-success">✅ {profileImage.name}</small>
                      )}
                    </Form.Group>
                  </>
                ) : (
                  <>
                    <h4 className="step-title">3. بيانات المؤسسة</h4>
                    <Form.Group>
                      <Form.Label>اسم المؤسسة</Form.Label>
                      <Form.Control
                        name="institutionName"
                        value={user.institutionName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>رقم الترخيص</Form.Label>
                      <Form.Control
                        name="institutionLicenseNumber"
                        value={user.institutionLicenseNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>عنوان المؤسسة</Form.Label>
                      <Form.Control
                        name="institutionAddress"
                        value={user.institutionAddress}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </>
                )}
              </div>
            )}

            {/* 4. الموقع */}
            {step === 4 && (
              <div className="info-section">
                <h4 className="step-title">4. تحديد موقعك الجغرافي</h4>

                <Form.Group className="mb-3">
                  <Form.Label>مكان الإقامة</Form.Label>
                  <div className="location-mode-options">
                    <Form.Check
                      inline
                      type="radio"
                      id="locationMode-mr"
                      name="locationMode"
                      value="mr"
                      label="داخل موريتانيا"
                      checked={user.locationMode === 'mr'}
                      onChange={handleChange}
                    />
                    <Form.Check
                      inline
                      type="radio"
                      id="locationMode-abroad"
                      name="locationMode"
                      value="abroad"
                      label="خارج موريتانيا"
                      checked={user.locationMode === 'abroad'}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                {user.locationMode === 'mr' ? (
                  <>
                    <div className="location-row">
                      <Form.Group className="flex-grow-1">
                        <Form.Label>البلدية (إجباري)</Form.Label>
                        <div className="autocomplete-wrapper">
                          <Form.Control
                            name="commune"
                            value={user.commune}
                            onChange={handleChange}
                            onFocus={() => setShowCommuneSuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowCommuneSuggestions(false), 150);
                            }}
                            placeholder="اكتب الأحرف الأولى من اسم البلدية"
                            autoComplete="off"
                            isInvalid={communeInputInvalid}
                          />
                          {showCommuneSuggestions &&
                            filteredCommuneAutocomplete.length > 0 && (
                              <div className="autocomplete-list">
                                {filteredCommuneAutocomplete.map((c) => {
                                  const optionValue = getOptionLabel(c);
                                  return (
                                    <button
                                      key={c?.code || optionValue}
                                      type="button"
                                      className="autocomplete-item"
                                      onMouseDown={(ev) => {
                                        ev.preventDefault();
                                        handleSelectCommune(c);
                                      }}
                                    >
                                      {optionValue}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                        <Form.Control.Feedback type="invalid">
                          اختر بلدية من المقترحات.
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="flex-grow-1">
                        <Form.Label>او الحي المكان </Form.Label>
                        <Form.Control
                          name="address"
                          value={user.address}
                          onChange={handleChange}
                          placeholder="مثال:  عرفات، قرب مسجد النور"
                        />
                      </Form.Group>
                    </div>

                    <div className="location-summary">
                      <p className="location-summary-title">سيتم ربط حسابك بالموقع التالي:</p>
                      <div className="location-summary-row">
                        <span className="location-label">الولاية:</span>
                        <span className="location-value">
                          {selectedWilaya ? getOptionLabel(selectedWilaya) : '—'}
                        </span>
                      </div>
                      <div className="location-summary-row">
                        <span className="location-label">المقاطعة:</span>
                        <span className="location-value">
                          {selectedMoughataa ? getOptionLabel(selectedMoughataa) : '—'}
                        </span>
                      </div>
                      <div className="location-summary-row">
                        <span className="location-label">البلدية:</span>
                        <span className="location-value">
                          {selectedCommune ? getOptionLabel(selectedCommune) : '—'}
                        </span>
                      </div>
                      <p className="location-summary-note">
                        بمجرد اختيار البلدية، يقوم النظام بتحديد الولاية والمقاطعة تلقائياً، ولن تحتاج
                        لكتابتهما يدوياً.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="location-row">
                      <Form.Group className="flex-grow-1">
                        <Form.Label>الدولة (إجباري)</Form.Label>
                        <Form.Control
                          name="country"
                          value={user.country}
                          onChange={handleChange}
                          placeholder="مثال: إسبانيا، فرنسا، المغرب..."
                        />
                      </Form.Group>

                      <Form.Group className="flex-grow-1">
                        <Form.Label>المدينة (إجباري)</Form.Label>
                        <Form.Control
                          name="city"
                          value={user.city}
                          onChange={handleChange}
                          placeholder="مثال: فيتوريا-غاستيث، برشلونة..."
                        />
                      </Form.Group>
                    </div>

                    <Form.Group className="mt-3">
                      <Form.Label>وصف المكان بالتحديد (اختياري)</Form.Label>
                      <Form.Control
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                        placeholder="مثال: حي كذا، قرب المحطة أو مركز معيّن"
                      />
                    </Form.Group>

                    <div className="location-summary">
                      <p className="location-summary-title">ملخص موقعك خارج موريتانيا:</p>
                      <div className="location-summary-row">
                        <span className="location-label">الدولة:</span>
                        <span className="location-value">
                          {user.country?.trim() || '—'}
                        </span>
                      </div>
                      <div className="location-summary-row">
                        <span className="location-label">المدينة:</span>
                        <span className="location-value">
                          {user.city?.trim() || '—'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 5. بيانات الدخول */}
            {step === 5 && (
              <div className="info-section">
                <h4 className="step-title">5. بيانات الدخول إلى الحساب</h4>
                <Form.Group>
                  <Form.Label>اسم المستخدم</Form.Label>
                  <Form.Control
                    name="username"
                    value={user.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>كلمة المرور</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                  {user.password && !isMediumPassword(user.password) && (
                    <small className="text-danger d-block mt-1">
                      يجب أن تكون كلمة المرور 6 مقاطع على الأقل، وتحتوي على حروف وأرقام.
                    </small>
                  )}
                  {user.password && isMediumPassword(user.password) && (
                    <small className="text-success d-block mt-1">
                      كلمة المرور تبدو جيدة 👍
                    </small>
                  )}
                </Form.Group>
                <Form.Group>
                  <Form.Label>تأكيد كلمة المرور</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                {user.password !== user.confirmPassword && (
                  <p className="text-danger">كلمتا المرور غير متطابقتين</p>
                )}
              </div>
            )}

            {/* أزرار التنقّل */}
            <div className="mt-4 d-flex align-items-center gap-3 action-buttons">
              {step > 1 && step < 6 && (
                <Button
                  className="button-prev"
                  onClick={() => onPreviousStep && onPreviousStep()}
                >
                  <FaArrowRight className="ms-2" /> السابق
                </Button>
              )}

              {step < 5 && (
                <Button
                  className="button-next"
                  onClick={() => validateStep() && onNextStep && onNextStep()}
                  disabled={isLoading}
                >
                  التالي <FaArrowLeft className="me-2" />
                </Button>
              )}

              {step === 5 && (
                <Button
                  className="button-submit"
                  type="submit"
                  disabled={
                    isLoading ||
                    user.password !== user.confirmPassword ||
                    !isMediumPassword(user.password)
                  }
                >
                  <FaCheck className="ms-2" /> {isLoading ? 'جاري التسجيل...' : 'تسجيل'}
                </Button>
              )}
            </div>
          </Form>
        </>
      )}

      {/* Toast غير مستعمل حاليًا لكن نتركه إن احتجته لاحقًا */}
      <Toast
        onClose={() => {}}
        show={false}
        delay={3000}
        autohide
        style={{ position: 'fixed', top: 20, right: 20 }}
      />
    </div>
  );
}

UserForm.propTypes = {
  addUser: PropTypes.func,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  currentStep: PropTypes.number,
  onNextStep: PropTypes.func,
  onPreviousStep: PropTypes.func,
};

UserForm.defaultProps = {
  addUser: null,
  isLoading: false,
  className: '',
  currentStep: 1,
  onNextStep: null,
  onPreviousStep: null,
};

export default UserForm;

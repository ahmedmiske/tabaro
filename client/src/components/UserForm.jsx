// src/components/UserForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Toast, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaCheck, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { scrollToTop} from '../utils/scrollHelpers.js';
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

// ✅ شكل رقم الهاتف
const isPhoneFormatValid = (phone) => /^[0-9]{6,15}$/.test(phone);

// ✅ نفعّل الـ OTP بكود ثابت 3229
const USE_OTP = true;
const FIXED_OTP = '3229';

// خريطة الخطوات
const STEPS = {
  ACCOUNT_TYPE: 1,
  LOCATION: 2,
  CONTACT: 3,
  BASIC_INFO: 4,
  LOGIN: 5,
};

/**
 * قائمة الدول + المفاتيح
 */
const COUNTRY_OPTIONS = [
  { iso: 'MR', ar: 'موريتانيا', en: 'Mauritania', code: '+222' },
  { iso: 'ES', ar: 'إسبانيا', en: 'Spain', code: '+34' },
  { iso: 'FR', ar: 'فرنسا', en: 'France', code: '+33' },
  { iso: 'MA', ar: 'المغرب', en: 'Morocco', code: '+212' },
  { iso: 'DZ', ar: 'الجزائر', en: 'Algeria', code: '+213' },
  { iso: 'TN', ar: 'تونس', en: 'Tunisia', code: '+216' },
  { iso: 'EG', ar: 'مصر', en: 'Egypt', code: '+20' },
  { iso: 'SD', ar: 'السودان', en: 'Sudan', code: '+249' },
  { iso: 'LY', ar: 'ليبيا', en: 'Libya', code: '+218' },
  { iso: 'SN', ar: 'السنغال', en: 'Senegal', code: '+221' },
  { iso: 'GM', ar: 'غامبيا', en: 'Gambia', code: '+220' },
  { iso: 'ML', ar: 'مالي', en: 'Mali', code: '+223' },
  { iso: 'CI', ar: 'ساحل العاج', en: "Côte d'Ivoire", code: '+225' },

  { iso: 'PT', ar: 'البرتغال', en: 'Portugal', code: '+351' },
  { iso: 'IT', ar: 'إيطاليا', en: 'Italy', code: '+39' },
  { iso: 'DE', ar: 'ألمانيا', en: 'Germany', code: '+49' },
  { iso: 'BE', ar: 'بلجيكا', en: 'Belgium', code: '+32' },
  { iso: 'NL', ar: 'هولندا', en: 'Netherlands', code: '+31' },
  { iso: 'CH', ar: 'سويسرا', en: 'Switzerland', code: '+41' },
  { iso: 'AT', ar: 'النمسا', en: 'Austria', code: '+43' },
  { iso: 'SE', ar: 'السويد', en: 'Sweden', code: '+46' },
  { iso: 'NO', ar: 'النرويج', en: 'Norway', code: '+47' },
  { iso: 'DK', ar: 'الدنمارك', en: 'Denmark', code: '+45' },
  { iso: 'IE', ar: 'إيرلندا', en: 'Ireland', code: '+353' },
  { iso: 'FI', ar: 'فنلندا', en: 'Finland', code: '+358' },
  { iso: 'GB', ar: 'المملكة المتحدة', en: 'United Kingdom', code: '+44' },

  { iso: 'TR', ar: 'تركيا', en: 'Turkey', code: '+90' },
  { iso: 'SA', ar: 'السعودية', en: 'Saudi Arabia', code: '+966' },
  { iso: 'AE', ar: 'الإمارات', en: 'United Arab Emirates', code: '+971' },
  { iso: 'QA', ar: 'قطر', en: 'Qatar', code: '+974' },
  { iso: 'KW', ar: 'الكويت', en: 'Kuwait', code: '+965' },
  { iso: 'BH', ar: 'البحرين', en: 'Bahrain', code: '+973' },
  { iso: 'OM', ar: 'عُمان', en: 'Oman', code: '+968' },
  { iso: 'JO', ar: 'الأردن', en: 'Jordan', code: '+962' },
  { iso: 'LB', ar: 'لبنان', en: 'Lebanon', code: '+961' },
  { iso: 'SY', ar: 'سوريا', en: 'Syria', code: '+963' },
  { iso: 'IQ', ar: 'العراق', en: 'Iraq', code: '+964' },
  { iso: 'YE', ar: 'اليمن', en: 'Yemen', code: '+967' },

  { iso: 'US', ar: 'الولايات المتحدة الامريكية', en: 'United States', code: '+1' },
  { iso: 'CA', ar: 'كندا', en: 'Canada', code: '+1' },
  { iso: 'BR', ar: 'البرازيل', en: 'Brazil', code: '+55' },
  { iso: 'AR', ar: 'الأرجنتين', en: 'Argentina', code: '+54' },

  { iso: 'IN', ar: 'الهند', en: 'India', code: '+91' },
  { iso: 'PK', ar: 'باكستان', en: 'Pakistan', code: '+92' },
  { iso: 'BD', ar: 'بنغلاديش', en: 'Bangladesh', code: '+880' },
  { iso: 'ID', ar: 'إندونيسيا', en: 'Indonesia', code: '+62' },
  { iso: 'MY', ar: 'ماليزيا', en: 'Malaysia', code: '+60' },
  { iso: 'SG', ar: 'سنغافورة', en: 'Singapore', code: '+65' },
  { iso: 'PH', ar: 'الفلبين', en: 'Philippines', code: '+63' },
  { iso: 'CN', ar: 'الصين', en: 'China', code: '+86' },
  { iso: 'JP', ar: 'اليابان', en: 'Japan', code: '+81' },
  { iso: 'KR', ar: 'كوريا الجنوبية', en: 'South Korea', code: '+82' },
];

const findCountryByName = (name) => {
  if (!name) return null;
  const v = String(name).trim().toLowerCase();
  if (!v) return null;

  return (
    COUNTRY_OPTIONS.find(
      (c) =>
        c.iso.toLowerCase() === v ||
        c.ar.toLowerCase() === v ||
        c.en.toLowerCase() === v,
    ) ||
    COUNTRY_OPTIONS.find(
      (c) =>
        c.ar.toLowerCase().includes(v) || c.en.toLowerCase().includes(v),
    )
  );
};

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
    locationMode: 'mr',
    country: '',
    city: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  const [showCommuneSuggestions, setShowCommuneSuggestions] = useState(false);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

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

  const [phoneCountryCode, setPhoneCountryCode] = useState('+222');

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  /* ================= تحميل القوائم ================= */

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

  /* ================= داخل موريتانيا ================= */

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

  useEffect(() => {
    if (user.locationMode !== 'mr' || !selectedCommune) return;

    setUser((prev) => {
      const next = { ...prev };
      if (selectedMoughataa) next.moughataa = getOptionLabel(selectedMoughataa);
      if (selectedWilaya) next.wilaya = getOptionLabel(selectedWilaya);
      return next;
    });
  }, [selectedCommune, selectedMoughataa, selectedWilaya, user.locationMode]);

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

  /* ================= أوتوكومبليت الدولة ================= */

  const filteredCountrySuggestions = useMemo(() => {
    if (user.locationMode !== 'abroad') return [];
    const term = normalizeValue(user.country);
    if (!term) return COUNTRY_OPTIONS.slice(0, 10);
    const lower = term.toLowerCase();

    return COUNTRY_OPTIONS.filter(
      (c) =>
        c.ar.toLowerCase().includes(lower) ||
        c.en.toLowerCase().includes(lower) ||
        c.iso.toLowerCase().includes(lower),
    );
  }, [user.country, user.locationMode]);

  const handleSelectCountry = (countryObj) => {
    setUser((prev) => ({ ...prev, country: countryObj.ar }));
    setPhoneCountryCode(countryObj.code);
    setShowCountrySuggestions(false);
  };

  useEffect(() => {
    if (user.locationMode !== 'abroad') {
      setPhoneCountryCode('+222');
      return;
    }
    const found = findCountryByName(user.country);
    if (found) setPhoneCountryCode(found.code);
  }, [user.country, user.locationMode]);

  /* ================= التحقق من الهاتف ================= */

  const resetPhoneCheck = () => {
    setPhoneCheckStatus(null);
    setPhoneCheckMessage('');
  };

  const checkPhoneUnique = async (value) => {
    const phone = normalizeValue(value);
    if (!phone) {
      resetPhoneCheck();
      return;
    }

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
        resetPhoneCheck();
      }
    } catch {
      resetPhoneCheck();
    } finally {
      setIsCheckingPhone(false);
    }
  };

  /* ================= Handlers عامة ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userType') {
      if (value === 'institutional') {
        setInstitutionNotice(true);
        setUser((prev) => ({ ...prev, userType: '' }));
        return;
      }
      setInstitutionNotice(false);
    }

    if (name === 'locationMode' && value === 'abroad') {
      setUser((prev) => ({
        ...prev,
        locationMode: value,
        commune: '',
        wilaya: '',
        moughataa: '',
      }));
      return;
    }

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'commune') setShowCommuneSuggestions(true);
    if (name === 'country') setShowCountrySuggestions(true);

    if (name === 'phoneNumber') {
      resetPhoneCheck();
      setOtpSent(false);
      setOtpVerified(false);
      setOtpInput('');
      setOtpError('');
      setOtpInfo('');
    }
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

  /* ================= منطق OTP ================= */

  // 👉 لا نعتمد هنا على phoneCheckStatus حتى لا يمنع الـ OTP
  const canSendOtp =
    USE_OTP &&
    !!user.phoneNumber.trim() &&
    !isCheckingPhone &&
    isPhoneFormatValid(user.phoneNumber || '');

  const handleSendOtp = () => {
    if (!canSendOtp) return;

    const displayPhone = `${phoneCountryCode} ${normalizeValue(user.phoneNumber)}`;

    setOtpSent(true);
    setOtpVerified(false);
    setOtpInput('');
    setOtpError('');
    setOtpInfo(
      `تم إرسال رمز التحقق إلى الرقم ${displayPhone} (محاكاة). لاختبار التجربة أدخل الرمز 3229.`,
    );
  };

  const handleVerifyOtp = () => {
    if (!otpSent) {
      setOtpError('من فضلك اضغط على زر "إرسال رمز التحقق" أولاً.');
      return;
    }
    if (!otpInput.trim()) {
      setOtpError('أدخل رمز التحقق الذي وصلك.');
      return;
    }

    if (otpInput.trim() === FIXED_OTP) {
      setOtpVerified(true);
      setOtpError('');
      setOtpInfo('✅ تم تأكيد رقم الهاتف بنجاح.');
    } else {
      setOtpVerified(false);
      setOtpError('❌ رمز التحقق غير صحيح. حاول مرة أخرى.');
    }
  };

  /* ================= التحقق لكل خطوة ================= */

  const validateStep = () => {
    let valid = true;

    if (step === STEPS.ACCOUNT_TYPE && !user.userType) valid = false;

    if (step === STEPS.CONTACT) {
      if (!user.phoneNumber?.trim()) valid = false;
      if (phoneCheckStatus === 'exists' || phoneCheckStatus === 'invalid') valid = false;
      if (USE_OTP && !otpVerified) valid = false;
    }

    if (step === STEPS.BASIC_INFO) {
      if (user.userType === 'individual') {
        if (!user.firstName?.trim() || !user.lastName?.trim()) valid = false;
      } else if (user.userType === 'institutional') {
        if (
          !user.institutionName?.trim() ||
          !user.institutionLicenseNumber?.trim() ||
          !user.institutionAddress?.trim()
        ) {
          valid = false;
          scrollToTop();
        }
      } else {
        valid = false;
      }
    }

    if (step === STEPS.LOCATION) {
      if (user.locationMode === 'mr') {
        if (!user.commune?.trim() || !isCommuneValueValid(user.commune)) valid = false;
      } else if (user.locationMode === 'abroad') {
        if (!user.country?.trim() || !user.city?.trim()) valid = false;
      } else {
        valid = false;
      }
    }

    if (step === STEPS.LOGIN) {
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

  /* ================= الإرسال ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    let preparedUser = { ...user };

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

  /* ================= JSX ================= */

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
          {error && (
            <Alert variant="danger" className="text-center user-form-error-alert">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} className={`user-form ${className || ''}`}>
            {/* 1. نوع الحساب */}
            {step === STEPS.ACCOUNT_TYPE && (
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

            {/* 2. الموقع */}
            {step === STEPS.LOCATION && (
              <div className="info-section">
                <h4 className="step-title">2. تحديد موقعك الجغرافي</h4>

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
                  </>
                ) : (
                  <>
                    <div className="location-row">
                      <Form.Group className="flex-grow-1">
                        <Form.Label>الدولة (إجباري)</Form.Label>
                        <div className="autocomplete-wrapper">
                          <Form.Control
                            name="country"
                            value={user.country}
                            onChange={handleChange}
                            onFocus={() => setShowCountrySuggestions(true)}
                            onBlur={() => {
                              setTimeout(() => setShowCountrySuggestions(false), 150);
                            }}
                            placeholder="مثال: إسبانيا، France, Morocco..."
                            autoComplete="off"
                          />
                          {showCountrySuggestions &&
                            filteredCountrySuggestions.length > 0 && (
                              <div className="autocomplete-list">
                                {filteredCountrySuggestions.map((c) => (
                                  <button
                                    key={c.iso}
                                    type="button"
                                    className="autocomplete-item"
                                    onMouseDown={(ev) => {
                                      ev.preventDefault();
                                      handleSelectCountry(c);
                                    }}
                                  >
                                    {c.ar} ({c.en}) {c.code}
                                  </button>
                                ))}
                              </div>
                            )}
                        </div>
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
                  </>
                )}
              </div>
            )}

            {/* 3. بيانات التواصل + OTP */}
            {step === STEPS.CONTACT && (
              <div className="info-section">
                <h4 className="step-title">3. بيانات التواصل وتأكيد الهاتف</h4>

                {/* رقم الهاتف */}
                <Form.Group>
                  <Form.Label>رقم الهاتف</Form.Label>
                  <InputGroup>
                    {/* حقل الرقم */}
                    <Form.Control
                      type="text"
                      name="phoneNumber"
                      value={user.phoneNumber}
                      onChange={handleChange}
                      onBlur={() => checkPhoneUnique(user.phoneNumber)}
                      placeholder={
                        user.locationMode === 'mr'
                          ? 'مثال: 44112233'
                          : 'اكتب رقمك بدون رمز الدولة'
                      }
                      required
                    />

                    {/* أيقونة الهاتف */}
                    <InputGroup.Text>
                      <FaPhoneAlt />
                      {user.locationMode === 'mr' && <span className="ms-1">+222</span>}
                    </InputGroup.Text>

                    {/* قائمة المفاتيح – يسار */}
                    {user.locationMode === 'abroad' && (
                      <Form.Select
                        className="phone-country-select"
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        style={{ maxWidth: '140px' }}
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.iso} value={c.code}>
                            {c.iso} {c.code}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  </InputGroup>

                  <div className="phone-check-hint">
                    {isCheckingPhone && (
                      <span className="text-muted d-block mt-1">
                        <Spinner animation="border" size="sm" className="me-1" />
                        يتم التحقق من رقم الهاتف...
                      </span>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'ok' && (
                      <small className="text-success d-block mt-1">
                        {phoneCheckMessage}
                      </small>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'exists' && (
                      <small className="text-danger d-block mt-1">
                        {phoneCheckMessage}
                      </small>
                    )}
                    {!isCheckingPhone && phoneCheckStatus === 'invalid' && (
                      <small className="text-danger d-block mt-1">
                        {phoneCheckMessage}
                      </small>
                    )}
                  </div>

                  {USE_OTP && (
                    <small className="text-muted d-block mt-1">
                      قبل إكمال التسجيل سنقوم بتأكيد ملكية رقم هاتفك برمز تحقق بسيط.
                    </small>
                  )}
                </Form.Group>

                {/* OTP – الزر لا يظهر إلا بعد إدخال رقم */}
                {USE_OTP && user.phoneNumber.trim() && (
                  <div className="otp-box mt-3">
                    <Button
                      variant="outline-primary"
                      type="button"
                      className="otp-send-btn"
                      onClick={handleSendOtp}
                      disabled={!canSendOtp || otpSent}
                    >
                      {otpSent ? 'تم إرسال الرمز (محاكاة)' : 'إرسال رمز التحقق'}
                    </Button>

                    {otpInfo && (
                      <div className="otp-info mt-2">
                        {otpInfo}
                      </div>
                    )}

                    {otpSent && (
                      <Form.Group className="mt-3">
                        <Form.Label>رمز التحقق (OTP)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            placeholder="أدخل رمز التحقق هنا (3229 للتجربة)"
                          />
                          <Button
                            variant="success"
                            type="button"
                            className="otp-verify-btn"
                            onClick={handleVerifyOtp}
                          >
                            تأكيد الرمز
                          </Button>
                        </InputGroup>
                        {otpError && (
                          <div className="otp-error mt-1">
                            {otpError}
                          </div>
                        )}
                        {otpVerified && !otpError && (
                          <div className="otp-success mt-1">
                            ✅ تم تأكيد رقم الهاتف، يمكنك المتابعة للخطوة التالية.
                          </div>
                        )}
                      </Form.Group>
                    )}
                  </div>
                )}

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

            {/* 4. بيانات شخصية / مؤسسية */}
            {step === STEPS.BASIC_INFO && (
              <div className="info-section">
                {user.userType === 'individual' ? (
                  <>
                    <h4 className="step-title">4. تسجيل بياناتك الأساسية</h4>
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
                    <h4 className="step-title">4. بيانات المؤسسة</h4>
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

            {/* 5. بيانات الدخول */}
            {step === STEPS.LOGIN && (
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

              {step < STEPS.LOGIN && (
                <Button
                  className="button-next"
                  onClick={() => validateStep() && onNextStep && onNextStep()}
                  disabled={isLoading}
                >
                  التالي <FaArrowLeft className="me-2" />
                </Button>
              )}

              {step === STEPS.LOGIN && (
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

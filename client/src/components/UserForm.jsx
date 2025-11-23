// src/components/UserForm.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Toast, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './UserForm.css';

const ALLOWED_IMAGE_TYPES = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const MAX_IMAGE_MB = 5;
const isAllowedImage = (f) => f && ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_MB*1024*1024;

// فلاغ بسيط: لو أردت لاحقاً إعادة تفعيل OTP اجعله true
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
    firstName: '', lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    wilaya: '',
    moughataa: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    // حقول المؤسسات:
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  const step = currentStep;
  const [error, setError] = useState('');
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();

  const normalizeValue = (value) =>
    typeof value === 'string' ? value.trim() : '';
  const optionMatchesValue = (option, normalizedValue) => {
    if (!option || !normalizedValue) return false;
    return normalizeValue(option.name_ar) === normalizedValue;
  };
  const createFinder = (options) => (value) => {
    const normalized = normalizeValue(value);
    if (!normalized) return null;
    return options.find((option) => optionMatchesValue(option, normalized)) || null;
  };
  const getOptionLabel = (option) =>
    option?.name_ar || '';
  const findWilayaOption = createFinder(wilayaOptions);
  const findMoughataaOption = createFinder(moughataaOptions);
  const findCommuneOption = createFinder(communeOptions);

  // جلب الخيارات من الخادم عند التحميل الأولي 
  useEffect(() => {
    let ignore = false;
    const fetchOptions = async (endpoint, setter, label) => {
      try {
        const response = await fetchWithInterceptors(endpoint);
        if (!ignore && Array.isArray(response?.body)) {
          setter(response.body);
        }
      } catch (err) {
        if (!ignore) console.error(`Failed to fetch ${label}`, err);
      }
    };

    fetchOptions('/api/wilayas', setWilayaOptions, 'wilayas');
    fetchOptions('/api/moughataas', setMoughataaOptions, 'moughataas');
    fetchOptions('/api/communes', setCommuneOptions, 'communes');

    return () => {
      ignore = true;
    };
  }, []);

  const selectedWilaya = findWilayaOption(user.wilaya);
  const selectedMoughataa = findMoughataaOption(user.moughataa);
  const selectedCommune = findCommuneOption(user.commune);
  const filteredMoughataaOptions = useMemo(() => {
    if (!selectedWilaya?.code) return moughataaOptions;
    return moughataaOptions.filter((m) => (m?.code || '').startsWith(selectedWilaya.code));
  }, [selectedWilaya, moughataaOptions]);
  const filteredCommuneOptions = useMemo(() => {
    if (!selectedMoughataa?.code && !selectedWilaya?.code) return communeOptions;
    if (selectedMoughataa?.code) {
      return communeOptions.filter((c) => (c?.code || '').startsWith(selectedMoughataa.code));
    }
    return communeOptions.filter((c) => (c?.code || '').startsWith(selectedWilaya.code));
  }, [selectedWilaya, selectedMoughataa, communeOptions]);

  // مزامنة الحقول بناءً على اختيار المقاطعة (ضبط الولاية تلقائياً) 
  useEffect(() => {
    if (!selectedMoughataa?.code) return;
    const derivedCode = selectedMoughataa.code.slice(0, 2);
    if (!derivedCode) return;
    const matchingWilaya = wilayaOptions.find((w) => (w?.code || '').startsWith(derivedCode));
    if (!matchingWilaya) return;
    const desiredValue = getOptionLabel(matchingWilaya);
    if (normalizeValue(user.wilaya) !== normalizeValue(desiredValue)) {
      setUser((prev) => ({ ...prev, wilaya: desiredValue }));
    }
  }, [selectedMoughataa, wilayaOptions]);

  // مزامنة الحقول بناءً على التسلسل الهرمي (الولاية > المقاطعة > البلدية) 
  useEffect(() => {
    if (selectedWilaya?.code && selectedMoughataa?.code && !selectedMoughataa.code.startsWith(selectedWilaya.code)) {
      setUser((prev) => ({ ...prev, moughataa: '', commune: '' }));
    }
    if (selectedCommune?.code && selectedMoughataa?.code && !selectedCommune.code.startsWith(selectedMoughataa.code)) {
      setUser((prev) => ({ ...prev, commune: '' }));
    }
  }, [selectedWilaya, selectedMoughataa, selectedCommune]);

  // مزامنة الحقول بناءً على اختيار البلدية (ضبط المقاطعة والولاية تلقائياً) 
  useEffect(() => {
    if (!selectedCommune?.code) return;
    const derivedMoughataaCode = selectedCommune.code.slice(0, 4);
    if (derivedMoughataaCode) {
      const matchingMoughataa = moughataaOptions.find((m) => m?.code === derivedMoughataaCode);
      if (matchingMoughataa) {
        const desiredMoughataa = getOptionLabel(matchingMoughataa);
        if (normalizeValue(user.moughataa) !== normalizeValue(desiredMoughataa)) {
          setUser((prev) => ({ ...prev, moughataa: desiredMoughataa }));
        }
      }
    }

    const derivedWilayaCode = selectedCommune.code.slice(0, 2);
    if (derivedWilayaCode) {
      const matchingWilaya = wilayaOptions.find((w) => w?.code === derivedWilayaCode);
      if (matchingWilaya) {
        const desiredWilaya = getOptionLabel(matchingWilaya);
        if (normalizeValue(user.wilaya) !== normalizeValue(desiredWilaya)) {
          setUser((prev) => ({ ...prev, wilaya: desiredWilaya }));
        }
      }
    }
  }, [selectedCommune, moughataaOptions, wilayaOptions]);

  const isWilayaValueValid = (value) => {
    if (!value?.trim()) return true;
    if (!Array.isArray(wilayaOptions) || wilayaOptions.length === 0) return true;
    return Boolean(findWilayaOption(value));
  };
  const wilayaInputInvalid = Boolean(user.wilaya?.trim()) && !isWilayaValueValid(user.wilaya);
  const isMoughataaValueValid = (value) => {
    if (!value?.trim()) return true;
    if (!Array.isArray(moughataaOptions) || moughataaOptions.length === 0) return true;
    return Boolean(findMoughataaOption(value));
  };
  const moughataaInputInvalid = Boolean(user.moughataa?.trim()) && !isMoughataaValueValid(user.moughataa);
  const isCommuneValueValid = (value) => {
    if (!value?.trim()) return true;
    if (!Array.isArray(communeOptions) || communeOptions.length === 0) return true;
    return Boolean(findCommuneOption(value));
  };
  const communeInputInvalid = Boolean(user.commune?.trim()) && !isCommuneValueValid(user.commune);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setProfileImage(null); setFileError(''); return; }
    if (!isAllowedImage(f)) {
      setProfileImage(null);
      setFileError(`❌ ملف غير مسموح: يُقبل فقط ${ALLOWED_IMAGE_TYPES.map(t=>t.split('/')[1]).join(', ')} وبحجم ≤ ${MAX_IMAGE_MB}MB`);
      e.target.value = '';
      return;
    }
    setFileError('');
    setProfileImage(f);
  };

  const validateStep = () => {
    let valid = true;
    if (step === 1 && !user.userType) valid = false;

    if (step === 2) {
      if (!user.phoneNumber?.trim()) valid = false;
    }

    if (step === 3) {
      if (user.userType === 'individual') {
        if (
          !user.firstName?.trim() ||
          !user.lastName?.trim() ||
          !isWilayaValueValid(user.wilaya) ||
          !isMoughataaValueValid(user.moughataa) ||
          !isCommuneValueValid(user.commune)
        ) {
          valid = false;
        }
      } else if (user.userType === 'institutional') {
        if (!user.institutionName?.trim() || !user.institutionLicenseNumber?.trim() || !user.institutionAddress?.trim()) valid = false;
      } else {
        valid = false;
      }
    }

    if (step === 4) {
      if (!user.username?.trim() || !user.password || user.password !== user.confirmPassword) valid = false;
    }

    setShowValidationAlert(!valid);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // إن تم تمرير addUser من الأعلى (مثلاً في صفحة إدارية) نستخدمه
    if (addUser) {
      const userData = { ...user };
      if (profileImage) userData.profileImage = profileImage;
      await addUser(userData);
      return;
    }

    const fd = new FormData();
    // نرسل الحقول الأساسية
    Object.entries(user).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (profileImage) fd.append('profileImage', profileImage);

    try {
      const response = await fetchWithInterceptors('/api/users', { method: 'POST', body: fd });
      if (response.ok) {
        setShowSuccessMessage(true);
        setError('');
      } else {
        // رسائل من الخادم (duplicates/تحقق..)
        setError(response.body?.message || 'حدث خطأ أثناء إنشاء الحساب.');
      }
    } catch (err) {
      setError('تعذر الاتصال بالخادم. حاول لاحقاً.');
    }
  };

  return (
    <div className="user-form-container">
      {showValidationAlert && (
        <Alert variant="danger" className="text-center">
          ⚠️ يرجى ملء جميع الحقول المطلوبة بشكل صحيح قبل المتابعة.
        </Alert>
      )}
      {fileError && <Alert variant="warning" className="text-center">{fileError}</Alert>}
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {showSuccessMessage ? (
        <div className="success-message-box text-center">
          <h4>🎉 تم إنشاء الحساب بنجاح!</h4>
          <p>يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور.</p>
          <Button className="go-login-button" onClick={() => navigate('/login')}>
            الانتقال إلى صفحة تسجيل الدخول
          </Button>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className={`user-form ${className || ''}`}>

          {/* الخطوة 1: نوع الحساب */}
          {step === 1 && (
            <div className="info-section">
              <Form.Group>
                <Form.Label>نوع الحساب</Form.Label>
                <Form.Select name="userType" value={user.userType} onChange={handleChange} required>
                  <option value="">-- اختر --</option>
                  <option value="individual">فرد</option>
                  <option value="institutional">مؤسسة</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}

          {/* الخطوة 2: رقم الهاتف (بدون OTP) */}
          {step === 2 && (
            <div className="info-section">
              <Form.Group>
                <Form.Label>رقم الهاتف</Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={user.phoneNumber}
                  onChange={handleChange}
                  placeholder="مثال: 44112233"
                  required
                />
                {!USE_OTP && (
                  <small className="text-muted d-block mt-1">
                    * في وضع الاختبار — لا نستخدم رمز تحقق الآن.
                  </small>
                )}
              </Form.Group>
            </div>
          )}

          {/* الخطوة 3: بيانات شخصية/مؤسسية */}
          {step === 3 && (
            <div className="info-section">
              {user.userType === 'individual' ? (
                <>
                  <Form.Group>
                    <Form.Label>الاسم الشخصي</Form.Label>
                    <Form.Control name="firstName" value={user.firstName} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>الاسم العائلي</Form.Label>
                    <Form.Control name="lastName" value={user.lastName} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>البريد الإلكتروني (اختياري)</Form.Label>
                    <Form.Control name="email" value={user.email} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>الولاية</Form.Label>
                    <Form.Control
                      name="wilaya"
                      value={user.wilaya}
                      onChange={handleChange}
                      placeholder="اكتب جزءاً من اسم الولاية لاختيارها"
                      list="wilayas-options"
                      autoComplete="off"
                      isInvalid={wilayaInputInvalid}
                    />
                    <datalist id="wilayas-options">
                      {wilayaOptions.map((w) => {
                        const optionValue = getOptionLabel(w);
                        return (
                          <option key={w?.code || optionValue} value={optionValue} label={optionValue} />
                        );
                      })}
                    </datalist>
                    <Form.Control.Feedback type="invalid">
                      اختر ولاية من القائمة (أو اترك الحقل فارغاً).
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      سيتم اقتراح الولايات المتاحة تلقائياً، ويمكن ترك الحقل فارغاً.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>المقاطعة</Form.Label>
                    <Form.Control
                      name="moughataa"
                      value={user.moughataa}
                      onChange={handleChange}
                      placeholder="اكتب جزءاً من اسم المقاطعة لاختيارها"
                      list="moughataas-options"
                      autoComplete="off"
                      isInvalid={moughataaInputInvalid}
                    />
                    <datalist id="moughataas-options">
                      {filteredMoughataaOptions.map((m) => {
                        const optionValue = getOptionLabel(m);
                        return (
                          <option key={m?.code || optionValue} value={optionValue} label={optionValue} />
                        );
                      })}
                    </datalist>
                    <Form.Control.Feedback type="invalid">
                      اختر مقاطعة من القائمة (أو اترك الحقل فارغاً).
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      اختيار المقاطعة يساعدنا على تقريب المتبرعين منك، ويمكن ترك الحقل فارغاً.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>البلدية</Form.Label>
                    <Form.Control
                      name="commune"
                      value={user.commune}
                      onChange={handleChange}
                      placeholder="اكتب جزءاً من اسم البلدية لاختيارها"
                      list="communes-options"
                      autoComplete="off"
                      isInvalid={communeInputInvalid}
                    />
                    <datalist id="communes-options">
                      {filteredCommuneOptions.map((c) => (
                        <option key={c?.code} value={getOptionLabel(c)} label={getOptionLabel(c)} />
                      ))}
                    </datalist>
                    <Form.Control.Feedback type="invalid">
                      اختر بلدية من القائمة (أو اترك الحقل فارغاً).
                    </Form.Control.Feedback>
                    <Form.Text className="text-muted">
                      عند اختيار بلدية سنحاول ضبط المقاطعة والولاية المرتبطتين بها تلقائياً.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>العنوان</Form.Label>
                    <Form.Control name="address" value={user.address} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>الصورة الشخصية (اختياري)</Form.Label>
                    <Form.Control type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleFileChange} />
                    {profileImage && <small className="text-success">✅ {profileImage.name}</small>}
                  </Form.Group>
                </>
              ) : (
                <>
                  <Form.Group>
                    <Form.Label>اسم المؤسسة</Form.Label>
                    <Form.Control name="institutionName" value={user.institutionName} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>رقم الترخيص</Form.Label>
                    <Form.Control name="institutionLicenseNumber" value={user.institutionLicenseNumber} onChange={handleChange} required />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>عنوان المؤسسة</Form.Label>
                    <Form.Control name="institutionAddress" value={user.institutionAddress} onChange={handleChange} required />
                  </Form.Group>
                </>
              )}
            </div>
          )}

          {/* الخطوة 4: حساب الدخول */}
          {step === 4 && (
            <div className="info-section">
              <Form.Group>
                <Form.Label>اسم المستخدم</Form.Label>
                <Form.Control name="username" value={user.username} onChange={handleChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>كلمة المرور</Form.Label>
                <Form.Control type="password" name="password" value={user.password} onChange={handleChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>تأكيد كلمة المرور</Form.Label>
                <Form.Control type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} required />
              </Form.Group>
              {user.password !== user.confirmPassword && (
                <p className="text-danger">كلمتا المرور غير متطابقتين</p>
              )}
            </div>
          )}

          {/* أزرار التنقّل */}
          <div className="mt-4 d-flex align-items-center gap-3">
            {step > 1 && step < 6 && (
              <Button className="button-prev" onClick={() => onPreviousStep && onPreviousStep()}>
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
              <Button className="button-submit" type="submit" disabled={isLoading || user.password !== user.confirmPassword}>
                <FaCheck className="ms-2" /> {isLoading ? 'جاري التسجيل...' : 'تسجيل'}
              </Button>
            )}
          </div>
        </Form>
      )}

      {/* مجرد Toast للإكمال */}
      <Toast onClose={() => {}} show={false} delay={3000} autohide style={{ position: 'fixed', top: 20, right: 20 }} />
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

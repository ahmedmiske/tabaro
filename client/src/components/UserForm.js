// src/components/UserForm.jsx
import React, { useState } from 'react';
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

  const step = currentStep;
  const [error, setError] = useState('');
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();

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
        if (!user.firstName?.trim() || !user.lastName?.trim()) valid = false;
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

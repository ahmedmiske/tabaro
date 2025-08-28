// src/components/UserForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Toast, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ProgressStep from './ProgressStep';
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './UserForm.css';

const ALLOWED_IMAGE_TYPES = ['image/jpeg','image/jpg','image/png','image/webp','image/gif'];
const MAX_IMAGE_MB = 5;
const isAllowedImage = (f) => f && ALLOWED_IMAGE_TYPES.includes(f.type) && f.size <= MAX_IMAGE_MB*1024*1024;

function UserForm() {
  const [user, setUser] = useState({
    firstName: '', lastName: '',
    phoneNumber: '',
    email: '',
    address: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: ''
  });
  const [profileImage, setProfileImage] = useState(null);

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [fileError, setFileError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) { setProfileImage(null); setFileError(''); return; }
    if (!isAllowedImage(f)) {
      setProfileImage(null);
      setFileError(`❌ ملف غير مسموح: يُقبل فقط صور ${ALLOWED_IMAGE_TYPES.map(t=>t.split('/')[1]).join(', ')} وبحجم ≤ ${MAX_IMAGE_MB}MB`);
      e.target.value = '';
      return;
    }
    setFileError('');
    setProfileImage(f);
  };

  const sendOtp = async () => {
    try {
      await fetchWithInterceptors('/api/otp/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: user.phoneNumber })
      });
      setSentCode(true);
      setError('');
    } catch (err) {
      console.error('OTP Error:', err);
      setError('تعذّر إرسال رمز التحقق');
    }
  };

  // تحقق تجريبي
  const verifyOtp = async () => {
    if ((verificationCode || '').trim() !== '3229') {
      setError('رمز التحقق غير صحيح');
      return;
    }
    try {
      await fetchWithInterceptors('/api/otp/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: user.phoneNumber, otp: verificationCode })
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setStep((s) => s + 1);
      setError('');
    } catch {
      setError('فشل التحقق، حاول لاحقًا');
    }
  };

  const validateStep = () => {
    let valid = true;
    if (step === 1 && !user.userType) valid = false;
    if (step === 2 && !user.phoneNumber) valid = false;
    if (step === 3) {
      if (user.userType === 'individual' && (!user.firstName || !user.lastName)) valid = false;
      if (user.userType === 'institutional' && (!user.institutionName || !user.institutionLicenseNumber || !user.institutionAddress)) valid = false;
    }
    if (step === 4 && (!user.username || !user.password || user.password !== user.confirmPassword)) valid = false;
    setShowValidationAlert(!valid);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(user).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (profileImage) fd.append('profileImage', profileImage);

    try {
      const response = await fetchWithInterceptors('/api/users', { method: 'POST', body: fd });
      if (response.ok) {
        setShowSuccessMessage(true);
        setError('');
      } else {
        setError(response.body?.message || 'حدث خطأ أثناء إرسال البيانات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إرسال البيانات');
    }
  };

  return (
    <>
      <ProgressStep step={step} total={5} />

      {showValidationAlert && (
        <Alert variant="danger" className="text-center">⚠️ يرجى ملء جميع الحقول المطلوبة بشكل صحيح قبل المتابعة.</Alert>
      )}
      {fileError && <Alert variant="warning" className="text-center">{fileError}</Alert>}

      {showSuccessMessage ? (
        <div className="success-message-box text-center">
          <h4>🎉 تم إنشاء الحساب بنجاح!</h4>
          <p>يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور الخاصة بك.</p>
          <Button className="go-login-button" onClick={() => navigate('/login')}>الانتقال إلى صفحة تسجيل الدخول</Button>
        </div>
      ) : (
        <Form onSubmit={handleSubmit} className="user-form">
          {step === 1 && (
            <div className="info-section">
              <h4>اختيار نوع الحساب</h4>
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

          {step === 2 && (
            <div className="info-section">
              <h4>التحقق من رقم الهاتف</h4>
              <Form.Group>
                <Form.Label>رقم الهاتف</Form.Label>
                <Form.Control type="text" name="phoneNumber" value={user.phoneNumber} onChange={handleChange} required />
              </Form.Group>
              {sentCode ? (
                <>
                  <Form.Group className="mt-2">
                    <Form.Label>رمز التحقق</Form.Label>
                    <Form.Control type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                  </Form.Group>
                  {error && <p className="text-danger">{error}</p>}
                  <Button onClick={verifyOtp}>تحقق</Button>
                </>
              ) : (
                <Button onClick={sendOtp}>إرسال رمز التحقق</Button>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="info-section">
              {user.userType === 'individual' ? (
                <>
                  <h4>المعلومات الشخصية</h4>
                  <Form.Group><Form.Label>الاسم الشخصي</Form.Label><Form.Control name="firstName" value={user.firstName} onChange={handleChange} required /></Form.Group>
                  <Form.Group><Form.Label>الاسم العائلي</Form.Label><Form.Control name="lastName" value={user.lastName} onChange={handleChange} required /></Form.Group>
                  <Form.Group><Form.Label>البريد الإلكتروني (اختياري)</Form.Label><Form.Control name="email" value={user.email} onChange={handleChange} /></Form.Group>
                  <Form.Group><Form.Label>العنوان</Form.Label><Form.Control name="address" value={user.address} onChange={handleChange} /></Form.Group>
                  <Form.Group>
                    <Form.Label>الصورة الشخصية (اختياري)</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    {profileImage && <small className="text-success">✅ {profileImage.name}</small>}
                  </Form.Group>
                </>
              ) : (
                <>
                  <h4>بيانات المؤسسة</h4>
                  <Form.Group><Form.Label>اسم المؤسسة</Form.Label><Form.Control name="institutionName" value={user.institutionName} onChange={handleChange} required /></Form.Group>
                  <Form.Group><Form.Label>رقم الترخيص</Form.Label><Form.Control name="institutionLicenseNumber" value={user.institutionLicenseNumber} onChange={handleChange} required /></Form.Group>
                  <Form.Group><Form.Label>عنوان المؤسسة</Form.Label><Form.Control name="institutionAddress" value={user.institutionAddress} onChange={handleChange} required /></Form.Group>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="info-section">
              <h4>معلومات الحساب</h4>
              <Form.Group><Form.Label>اسم المستخدم</Form.Label><Form.Control name="username" value={user.username} onChange={handleChange} required /></Form.Group>
              <Form.Group><Form.Label>كلمة المرور</Form.Label><Form.Control type="password" name="password" value={user.password} onChange={handleChange} required /></Form.Group>
              <Form.Group><Form.Label>تأكيد كلمة المرور</Form.Label><Form.Control type="password" name="confirmPassword" value={user.confirmPassword} onChange={handleChange} required /></Form.Group>
              {user.password !== user.confirmPassword && <p className="text-danger">كلمتا المرور غير متطابقتين</p>}
            </div>
          )}

          <div className="action-buttons mt-4 d-flex flex-column align-items-center gap-3">
            {step === 5 && !confirmed && (
              <>
                <Alert variant="info" className="confirmation-alert w-100 text-center">
                  ✅ <strong>أنت على وشك إرسال البيانات.</strong> يرجى التأكد من صحتها قبل المتابعة.
                </Alert>
                <Button className="button-next" onClick={() => setConfirmed(true)}>
                  التالي <FaArrowLeft className="me-2" />
                </Button>
              </>
            )}

            {step === 5 && confirmed && (
              <Button className="button-submit" type="submit">
                <FaCheck className="ms-2" /> تسجيل
              </Button>
            )}

            {step > 1 && step < 6 && (
              <Button className="button-prev" onClick={() => setStep(step - 1)}>
                <FaArrowRight className="ms-2" /> السابق
              </Button>
            )}

            {step < 5 && (
              <Button className="button-next" onClick={() => validateStep() && setStep(step + 1)}>
                التالي <FaArrowLeft className="me-2" />
              </Button>
            )}
          </div>
        </Form>
      )}

      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide style={{ position: 'fixed', top: 20, right: 20 }}>
        <Toast.Header><strong className="me-auto">تم التحقق</strong></Toast.Header>
        <Toast.Body>✅ تم التحقق من رقم الهاتف بنجاح.</Toast.Body>
      </Toast>
    </>
  );
}

export default UserForm;

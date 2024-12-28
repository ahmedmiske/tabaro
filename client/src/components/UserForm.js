import React, { useState } from 'react';
import { Form, Button, Toast, Modal } from 'react-bootstrap';
import './UserForm.css';

function UserForm({ addUser, editingUser, updateUser }) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: '',
    institutionEstablishmentDate: '',
    institutionWebsite: '',
  });

  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const sendVerificationCode = () => {
    setShowToast(true);
    setSentCode(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const verifyCode = () => {
    if (verificationCode === '3229') {
      setIsPhoneVerified(true);
      setStep(3);
    } else {
      setError('رمز التحقق غير صحيح');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (!isPhoneVerified) {
      setError('يرجى التحقق من الهاتف قبل المتابعة');
      return;
    }
    if (editingUser) {
      updateUser(user);
    } else {
      addUser(user);
      setShowModal(true);
    }
    resetForm();
  };

  const resetForm = () => {
    setUser({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      userType: '',
      username: '',
      password: '',
      confirmPassword: '',
      institutionName: '',
      institutionLicenseNumber: '',
      institutionAddress: '',
      institutionEstablishmentDate: '',
      institutionWebsite: '',
    });
    setStep(1);
  };

  const handleNext = () => {
    if (step === 2 && !isPhoneVerified) {
      sendVerificationCode();
    } else {
      setStep(step + 1);
    }
  };

  const handlePrev = () => setStep(step - 1);

  return (
    <>
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{ position: 'fixed', top: 20, right: 20 }}
      >
        <Toast.Header>
          <strong className="me-auto">إشعار</strong>
        </Toast.Header>
        <Toast.Body>تم إرسال رمز التحقق إلى رقم الهاتف: {user.phone}</Toast.Body>
      </Toast>

      <Form onSubmit={handleSubmit} className="user-form">
        {/* الخطوة 1: اختيار نوع الحساب */}
        {step === 1 && (
          <div className="info-section">
            <h3>اختر نوع الحساب</h3>
            <Form.Group controlId="userType">
              <Form.Label>نوع الحساب</Form.Label>
              <Form.Control
                as="select"
                name="userType"
                value={user.userType}
                onChange={handleChange}
                required
              >
                <option value="">اختر نوع الحساب</option>
                <option value="individual">حساب فردي</option>
                <option value="institutional">حساب مؤسسي</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary sendButton" onClick={handleNext}>
              التالي
            </Button>
          </div>
        )}

        {/* الخطوة 2: التحقق من رقم الهاتف */}
        {step === 2 && (
          <div className="info-section">
            <h3>التحقق من رقم الهاتف</h3>
            <Form.Group controlId="phone">
              <Form.Label>رقم الهاتف</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {sentCode && (
              <>
                <Form.Group controlId="verificationCode">
                  <Form.Label>رمز التحقق</Form.Label>
                  <Form.Control
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </Form.Group>
                {error && <p className="text-danger">{error}</p>}
                <Button variant="primary sendButton" onClick={verifyCode}>
                  تحقق
                </Button>
              </>
            )}
            {!sentCode && (
              <Button variant="primary sendButton" onClick={sendVerificationCode}>
                أرسل رمز التحقق
              </Button>
            )}
            <Button variant="secondary backButton" onClick={handlePrev}>
              السابق
            </Button>
          </div>
        )}

        {/* الخطوة 3: تسجيل المعلومات الشخصية أو المؤسسية */}
        {step === 3 && user.userType === 'individual' && (
          <div className="info-section">
            <h3>المعلومات الشخصية</h3>
            <Form.Group controlId="firstName">
              <Form.Label>الاسم الشخصي</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="lastName">
              <Form.Label>الاسم العائلي</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="email">
              <Form.Label>البريد الالكتروني </Form.Label>
              <Form.Control
                type="mail"
                name="email"
                value={user.email}
                onChange={handleChange}
                
              />
            </Form.Group>

            <Form.Group controlId="address">
              <Form.Label>العنوان </Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={user.address}
                onChange={handleChange}
                
              />
            </Form.Group>

            <Button variant="secondary backButton" onClick={handlePrev}>
              السابق
            </Button>
            <Button variant="primary sendButton" onClick={handleNext}>
              التالي
            </Button>
          </div>
        )}

        {step === 3 && user.userType === 'institutional' && (
          <div className="info-section">
            <h3>معلومات المؤسسة</h3>
            <Form.Group controlId="institutionName">
              <Form.Label>اسم المؤسسة</Form.Label>
              <Form.Control
                type="text"
                name="institutionName"
                value={user.institutionName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="institutionLicenseNumber">
              <Form.Label>الرقم التعريفي للمؤسسة</Form.Label>
              <Form.Control
                type="text"
                name="institutionLicenseNumber"
                value={user.institutionLicenseNumber}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="institutionAddress">
              <Form.Label> العنوان</Form.Label>
              <Form.Control
                type="text"
                name="institutionAddress"
                value={user.institutionAddress}
                onChange={handleChange}
                required
              />
            </Form.Group>
 
            <Form.Group controlId="institutionEmail">
              <Form.Label> البريد الالكتروني</Form.Label>
              <Form.Control
                type="mail"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Button variant="secondary backButton" onClick={handlePrev}>
              السابق
            </Button>
            <Button variant="primary sendButton" onClick={handleNext}>
              التالي
            </Button>
          </div>
        )}

        {/* الخطوة 4: تسجيل معلومات الحساب */}
        {step === 4 && (
          <div className="info-section">
            <h3>معلومات الحساب</h3>
            <Form.Group controlId="username">
              <Form.Label>اسم المستخدم</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={user.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="confirmPassword">
              <Form.Label>تأكيد كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                required
              />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
            <Button variant="secondary backButton" onClick={handlePrev}>
              السابق
            </Button>
            <Button variant="primary sendButton" type="submit">
              تسجيل
            </Button>
          </div>
        )}
      </Form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تم التسجيل بنجاح</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <p>اسم المستخدم: {user.username}</p>
          <p>كلمة المرور: {user.password}</p> */}
          <p>{user.name}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserForm;

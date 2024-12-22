import React, { useState, useEffect } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import './UserForm.css';

function UserForm({ addUser, editingUser, updateUser }) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    address: '',
    email: '',
    userType: '',
    username: '',
    password: '',
    confirmPassword: '',
    institutionName: '',
    institutionAddress: '',
    institutionLicenseNumber: '',
    institutionEstablishmentDate: ''
  });

  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setUser({ ...editingUser, confirmPassword: editingUser.password });
    }
  }, [editingUser]);
  

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // esnding code for verifying the number of mobile

  const sendVerificationCode = async () => {
    try {
      await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: user.phone }),
      });
      setSentCode(true);
      setShowVerificationModal(true);
    } catch (error) {
      setError('فشل في إرسال رمز التحقق');
    }
  };

// verify that the code is correct for the current
  const verifyCode = async () => {
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: user.phone, code: verificationCode }),
      });

      const result = await response.json();
      if (result.success) {
        setIsPhoneVerified(true);
        setShowVerificationModal(false);
        setStep(3); // Proceed to the next step after verification
      } else {
        setError('رمز التحقق غير صحيح');
      }
    } catch (error) {
      setError('فشل في التحقق من الرمز');
    }
  };
  
  // handle Submitted form user

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
    setUser({
      firstName: '',
      lastName: '',
      phone: '',
      whatsapp: '',
      address: '',
      email: '',
      userType: '',
      username: '',
      password: '',
      confirmPassword: '',
      institutionName: '',
      institutionAddress: '',
      institutionLicenseNumber: '',
      institutionEstablishmentDate: ''
    });
    setStep(1); // إعادة تعيين الخطوة إلى الأولى
  };

  // btn next 

  const handleNext = () => {
    if (step === 2 && !isPhoneVerified) {
      sendVerificationCode();
    } else {
      setStep(step + 1);
    }
  };
   
  // btn prev
  const handlePrev = () => {
    setStep(step - 1);
  };
 // show Modal
  const handleClose = () => setShowModal(false);

  return (
    <>
        {/* Form User */}
        <Form onSubmit={handleSubmit} className="user-form">
              {step === 1 && (
                <div className='info-section'>
                  <h3>اختر نوع الحساب</h3>
                  <Form.Group controlId="userType">
                    <Form.Control
                      as="select"
                      name="userType"
                      value={user.userType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">اختر نوع الحساب</option>
                      <option value="individual">حساب فردي (متبرع أو متعفف)</option>
                      <option value="institutional">حساب مؤسسي (جمعية خيرية أو مؤسسة اجتماعية)</option>
                    </Form.Control>
                  </Form.Group>
                  <Button variant="primary btn-userType" onClick={handleNext}>
                    التالي
                  </Button>
                </div>
              )}

              {step === 2 && user.userType === 'individual' && (
                <div className='info-section'>
                  <h3>المعلومات الشخصية</h3>
                  <div className='input-group'>
                    <Form.Group controlId="firstName" className="form-group-half">
                      <Form.Label>الاسم</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="lastName" className="form-group-half">
                      <Form.Label>الاسم العائلي</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className='input-group'>
                    <Form.Group controlId="phone" className="form-group-half">
                      <Form.Label>الهاتف</Form.Label>
                      <Form.Control
                        type="text"
                        name="phone"
                        value={user.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                    <Form.Group controlId="whatsapp" className="form-group-half">
                      <Form.Label>الواتساب</Form.Label>
                      <Form.Control
                        type="text"
                        name="whatsapp"
                        value={user.whatsapp}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="input-group">
                    <Form.Group className="form-group-half">
                      <Form.Group controlId="email">
                        <Form.Label>البريد الإلكتروني</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                      <Form.Group controlId="address">
                        <Form.Label>العنوان</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={user.address}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Form.Group>
                  </div>
                  <div className="action-btn-stp2">
                    <Button variant="secondary" onClick={handlePrev}>
                      السابق
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                      التالي
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && user.userType === 'institutional' && (
                <div className='info-section'>
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
                  <Form.Group controlId="institutionAddress">
                    <Form.Label>عنوان المؤسسة</Form.Label>
                    <Form.Control
                      type="text"
                      name="institutionAddress"
                      value={user.institutionAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="institutionLicenseNumber">
                    <Form.Label>رقم الترخيص</Form.Label>
                    <Form.Control
                      type="text"
                      name="institutionLicenseNumber"
                      value={user.institutionLicenseNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="institutionEstablishmentDate">
                    <Form.Label>تاريخ التأسيس</Form.Label>
                    <Form.Control
                      type="date"
                      name="institutionEstablishmentDate"
                      value={user.institutionEstablishmentDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handlePrev}>
                    السابق
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    التالي
                  </Button>
                </div>
              )}
      {/* step 3  */}
              {step === 3 && (
                <div className='info-section'>
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
      //                 onIt seems that the previous message was cut off. Here is the continuation and completion of the code:

      // ```jsx
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
              <Button variant="secondary" onClick={handlePrev}>
                السابق
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          )}
        </Form>

        {/* Registration Success Modal */}
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>تم التسجيل بنجاح</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>اسم المستخدم: {user.username}</p>
            <p>كلمة المرور: {user.password}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              إغلاق
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Phone Verification Modal */}
        <Modal show={showVerificationModal} onHide={() => setShowVerificationModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>تحقق من رقم الهاتف</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>تم إرسال رمز التحقق إلى رقم الهاتف: {user.phone}</p>
            <Form.Group controlId="verificationCode">
              <Form.Label>أدخل رمز التحقق</Form.Label>
              <Form.Control
                type="text"
                name="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </Form.Group>
            {error && <p className="text-danger">{error}</p>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowVerificationModal(false)}>
              إغلاق
            </Button>
            <Button variant="primary" onClick={verifyCode}>
              تحقق
            </Button>
          </Modal.Footer>
        </Modal>
   </>
  );
}

export default UserForm;


import React, { useState } from 'react';
import { Form, Button, Toast, Modal } from 'react-bootstrap';
import './UserForm.css';

function UserForm({ addUser, editingUser, updateUser }) {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
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

  const verifyOtp = (phoneNumber,otp) => {
    fetch('/api/otp/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phoneNumber, otp})
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      sessionStorage.setItem('token', data.token);
      setShowToast(true);
      // setSentCode(true);
      setTimeout(() => setShowToast(false), 6000);
      handleNext();
    })
    .catch((error) => {
      setError('رمز التحقق غير صحيح');
      console.error('Error:', error);
    });
  };

  const sendOtp = () => {
    
    fetch('/api/otp/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({phoneNumber: user.phoneNumber})
    }).then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }).then(data => {
      console.log('Success:', data);
      // setIsPhoneVerified(true);
      setSentCode(true);
      // setStep(step + 1);
    }).catch((error) => {
      console.error('Error:', error);
    });
    
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    // if (!isPhoneVerified) {
    //   setError('يرجى التحقق من الهاتف قبل المتابعة');
    //   return;
    // }

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify(user)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Success:', data);
      setShowModal(true);
      resetForm();
    })
    .catch((error) => {
      console.error('Error:', error);
      setError('حدث خطأ أثناء إرسال البيانات');
    });
    

    if (editingUser) {
      updateUser(user);
    } else {
      addUser(user);
    }
  };

  const resetForm = () => {
    setUser({
      firstName: '',
      lastName: '',
      phoneNumber: '',
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
    setStep(step + 1);
  };

  const handlePrev = () => setStep(step - 1);

  return (
    <>
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide style={{ position: 'fixed', top: 20, right: 20 }}>
        <Toast.Header>
          <strong className="me-auto">إشعار</strong>
        </Toast.Header>
        <Toast.Body>تم إرسال رمز التحقق إلى رقم الهاتف: {user.phoneNumber}</Toast.Body>
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
            <Form.Group controlId="phoneNumber">
              <Form.Label>رقم الهاتف</Form.Label>
              <Form.Control
                type="tel"
                name="phoneNumber"
                value={user.phoneNumber}
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
                 <Button variant="primary sendButton" onClick={()=>{verifyOtp(user.phoneNumber,verificationCode)}}>
                   تحقق
                 </Button>
               </>
             )}
             {!sentCode && (
              <Button variant="primary sendButton" onClick={sendOtp}>
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
        <Modal.Body>تم تسجيل بياناتك بنجاح في النظام.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>إغلاق</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserForm;

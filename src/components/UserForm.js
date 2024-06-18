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
    confirmPassword: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingUser) {
      setUser({ ...editingUser, confirmPassword: editingUser.password });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
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
      confirmPassword: ''
    });
  };

  const handleClose = () => setShowModal(false);

  return (
    <>
      <Form onSubmit={handleSubmit} className="user-form">
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
        </div>
        <div className='info-section'>
          <h3>معلومات الحساب</h3>
          <Form.Group controlId="userType">
            <Form.Label>نوع المستخدم</Form.Label>
            <Form.Control
              as="select"
              name="userType"
              value={user.userType}
              onChange={handleChange}
              required
            >
              <option value="">اختر نوع المستخدم</option>
              <option value="donor">متبرع</option>
              <option value="needy">متعفف</option>
              <option value="charity">جمعية خيرية</option>
              <option value="publicInstitution">مؤسسة عمومية</option>
            </Form.Control>
          </Form.Group>
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
        </div>
        <Button variant="primary" type="submit">
          {editingUser ? 'تحديث' : 'إضافة'}
        </Button>
      </Form>

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
    </>
  );
}

export default UserForm;

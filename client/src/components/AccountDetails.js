// src/components/AccountDetails.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Alert, Form, InputGroup } from './ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './AccountDetails.css';

function AccountDetails({
  userDetails = { username: '' },
  setUserDetails = () => {},
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }
    try {
      const response = await fetchWithInterceptors('/api/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: oldPassword, newPassword: password }),
      });
      if (!response.ok) throw new Error(response.body?.message || `HTTP ${response.status}`);

      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 10000);
      window.location.reload();
    } catch (err) {
      setError('حدث خطأ أثناء تحديث كلمة المرور. حاول مرة أخرى.');
      setSuccess(false);
    }
  };

  return (
    <div className="container-account-details">
      <Form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
        <div className="account-details-header">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fas fa-user-cog ml-2"></i>تحديث معلومات الحساب
          </h5>
        </div>

        {success && <Alert variant="success">تم تحديث كلمة المرور بنجاح.</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group>
          <Form.Label>اسم المستخدم</Form.Label>
          <Form.Control 
            type="text" 
            value={userDetails?.username || ''} 
            disabled
            className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
          />
        </Form.Group>

        <Form.Group>
          <Form.Label required>كلمة المرور القديمة</Form.Label>
          <Form.Control
            type="password"
            placeholder="أدخل كلمة المرور القديمة"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label required>كلمة المرور الجديدة</Form.Label>
          <Form.Control
            type="password"
            placeholder="أدخل كلمة المرور الجديدة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group>
          <Form.Label required>تأكيد كلمة المرور الجديدة</Form.Label>
          <Form.Control
            type="password"
            placeholder="أعد إدخال كلمة المرور الجديدة"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <div className="flex justify-end">
          <Button variant="primary" type="submit">حفظ التغييرات</Button>
        </div>
      </Form>
    </div>
  );
}

AccountDetails.propTypes = {
  userDetails: PropTypes.shape({
    username: PropTypes.string,
  }),
  setUserDetails: PropTypes.func,
};

export default AccountDetails;

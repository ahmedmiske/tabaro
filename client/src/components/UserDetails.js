// src/components/UserDetails.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Alert } from './ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserDetails.css';

function UserDetails({
  userDetails = {
    firstName: '',
    lastName: '',
    address: '',
    institutionName: '',
    institutionLicenseNumber: '',
    institutionAddress: '',
    userType: 'individual',
  },
  setUserDetails = () => {},
}) {
  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    address: userDetails?.address || '',
    institutionName: userDetails?.institutionName || '',
    institutionLicenseNumber: userDetails?.institutionLicenseNumber || '',
    institutionAddress: userDetails?.institutionAddress || '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const resp = await fetchWithInterceptors('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (!resp.ok) throw new Error(resp.body?.message || `HTTP ${resp.status}`);

      setSuccessMessage('تم تحديث المعلومات الشخصية بنجاح.');
      setUserDetails({ ...userDetails, ...formData });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setErrorMessage('فشل في تحديث المعلومات. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className="container-user-details">
      <div className="user-details-header">
        <h5><i className="fas fa-id-card me-2"></i>تحديث المعلومات الشخصية</h5>
      </div>

      <Form onSubmit={handleSubmit} dir="rtl">
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form.Group>
          <Form.Label>الاسم الشخصي</Form.Label>
          <Form.Control name="firstName" type="text" value={formData.firstName} onChange={handleChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>الاسم العائلي</Form.Label>
          <Form.Control name="lastName" type="text" value={formData.lastName} onChange={handleChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>العنوان</Form.Label>
          <Form.Control name="address" type="text" value={formData.address} onChange={handleChange} />
        </Form.Group>

        {userDetails?.userType === 'institutional' && (
          <>
            <Form.Group>
              <Form.Label>اسم المؤسسة</Form.Label>
              <Form.Control name="institutionName" type="text" value={formData.institutionName} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>رقم ترخيص المؤسسة</Form.Label>
              <Form.Control name="institutionLicenseNumber" type="text" value={formData.institutionLicenseNumber} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>عنوان المؤسسة</Form.Label>
              <Form.Control name="institutionAddress" type="text" value={formData.institutionAddress} onChange={handleChange} />
            </Form.Group>
          </>
        )}
        <br />
        <Button variant="primary" type="submit">حفظ التعديلات</Button>
      </Form>
    </div>
  );
}

UserDetails.propTypes = {
  userDetails: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    address: PropTypes.string,
    institutionName: PropTypes.string,
    institutionLicenseNumber: PropTypes.string,
    institutionAddress: PropTypes.string,
    userType: PropTypes.oneOf(['individual', 'institutional']),
  }),
  setUserDetails: PropTypes.func,
};

export default UserDetails;

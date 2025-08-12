import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors'; // Make sure this is correctly imported
import './UserDetails.css';
function UserDetails({ userDetails, setUserDetails }) {
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetchWithInterceptors('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log('Personal details updated successfully.');
        setSuccessMessage('تم تحديث المعلومات الشخصية بنجاح.');
        setUserDetails({ ...userDetails, ...formData }); // Update local state with new user details
        setTimeout(() => {
          window.location.reload(); // Refresh the page to reflect the changes
        }, 3000); // Delay the refresh for 3 seconds to allow the user to read the message
      } else {
        throw new Error(`Failed to update details: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
      setErrorMessage('فشل في تحديث المعلومات. يرجى المحاولة لاحقاً.');
    }
  };

  return (
    <div className='container-user-details'>
   
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
      {userDetails?.userType === 'organization' && (
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

export default UserDetails;

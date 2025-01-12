import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function UserDetails({ userDetails, setUserDetails }) {
  const [formData, setFormData] = useState({
    firstName: userDetails?.firstName || '',
    lastName: userDetails?.lastName || '',
    address: userDetails?.address || '',
    institutionName: userDetails?.institutionName || '',
    institutionLicenseNumber: userDetails?.institutionLicenseNumber || '',
    institutionAddress: userDetails?.institutionAddress || '',
  });

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
        setUserDetails({ ...userDetails, ...formData });
      } else {
        throw new Error(`Failed to update details: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>First Name</Form.Label>
        <Form.Control name="firstName" type="text" value={formData.firstName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Last Name</Form.Label>
        <Form.Control name="lastName" type="text" value={formData.lastName} onChange={handleChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Address</Form.Label>
        <Form.Control name="address" type="text" value={formData.address} onChange={handleChange} />
      </Form.Group>
      <Button variant="primary" type="submit">Save Changes</Button>
    </Form>
  );
}

export default UserDetails;

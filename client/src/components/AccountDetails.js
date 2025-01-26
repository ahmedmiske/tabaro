import React, { useState } from 'react';
import { Form, Button, InputGroup, FormControl, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors'; // Make sure to import your fetch service

function AccountDetails({ userDetails, setUserDetails }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    console.log('Attempting to update password...');
    try {
      const response = await fetchWithInterceptors(`/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword: password })
      });

      if (response.ok) {
        console.log('Password updated successfully.');
        setSuccess(true);
        setError('');
        setTimeout(() => setSuccess(false), 10000); // Hide the success message after 5 seconds
        window.location.reload(); // Refresh the page to reflect the changes
      } else {
        throw new Error(`Failed to update password: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating password:', error.message);
      setError('Error updating password. Please try again.');
      setSuccess(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {success && <Alert variant="success">Password updated successfully.</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group>
        <Form.Label>Username</Form.Label>
        <InputGroup>
          <FormControl type="text" value={userDetails?.username} readOnly />
        </InputGroup>
      </Form.Group>
      <Form.Group>
        <Form.Label>Old Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter old password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Confirm New Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit">Save Changes</Button>
    </Form>
  );
}

export default AccountDetails;

import React, { useState } from 'react';
import { Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors'; // Make sure to import your fetch service

function PasswordReset() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    try {
      const response = await fetchWithInterceptors(`/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, checkExists: true })
      });

      if (response.ok) {
        setStep(2);
        setError('');
        setSuccess('OTP sent successfully. Please check your phone.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
};

  const handleVerifyOtp = () => {
    setStep(3);
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetchWithInterceptors(`/api/users/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, otp, newPassword: password })
      });

      if (response.ok) {
        setSuccess('Password reset successfully. You can now login with your new password.');
        setError('');
      } else {
        throw new Error(`Failed to reset password: ${response.status}`);
      }
    } catch (error) {
      setError(error.message || 'Error updating password. Please try again.');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="password-reset">
      <h2>تجديد كلمة</h2>
      <ProgressBar now={(step / 3) * 100} label={`Step ${step} of 3`} />
      {step > 1 && <Button onClick={handleBack} variant="secondary" className="mb-3">العودة</Button>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {step === 1 && (
        <Form>
          <Form.Group>
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
            <Button onClick={handleSendOtp} variant="primary">Send OTP</Button>
          </Form.Group>
        </Form>
      )}

      {step === 2 && (
        <Form>
          <Form.Group>
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
            <Button onClick={handleVerifyOtp} variant="primary">تاكيد الكود</Button>
          </Form.Group>
        </Form>
      )}

      {step === 3 && (
        <Form onSubmit={handleResetPassword}>
          <Form.Group>
            <Form.Label>كلمة السر الجديدة</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>تأكيد كلمة السر</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">تجديد كلمة السر</Button>
        </Form>
      )}
    </div>
  );
}

export default PasswordReset;

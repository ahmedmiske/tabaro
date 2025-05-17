import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './DonationRequestForm';

const BloodDonationForm = () => {
  const [bloodDonation, setBloodDonation] = useState({
    bloodType: '',
    location: '',
    deadline: '',
    description: '',
    isUrgent: false,
    contactMethods: [],
  });

  const [errors, setErrors] = useState({});
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const contactOptions = ["phone", "whatsapp"];

  const validatePhoneNumber = (value) => /^\d{8}$/.test(value);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBloodDonation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactChange = (method, value) => {
    setBloodDonation(prev => {
      const existing = prev.contactMethods.find(m => m.method === method);
      const updatedMethods = existing
        ? prev.contactMethods.map(m => m.method === method ? { ...m, number: value } : m)
        : [...prev.contactMethods, { method, number: value }];
      return { ...prev, contactMethods: updatedMethods };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    bloodDonation.contactMethods.forEach(({ method, number }) => {
      if (!validatePhoneNumber(number)) {
        newErrors[method] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    Object.entries(bloodDonation).forEach(([key, value]) => {
      if (key === "contactMethods") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    fetchWithInterceptors('/api/bloodDonations', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => console.log("Blood donation request submitted:", data))
      .catch(err => console.error("Submission error:", err));
  };

  return (
   <div className="donation-form-container blood-form">
    <div className='section-title'>
       <h2>طلب تبرع بالدم</h2>
    </div>

      
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>فصيلة الدم</Form.Label>
          <Form.Control as="select" name="bloodType" value={bloodDonation.bloodType} onChange={handleChange} required>
            <option value="">-- اختر الفصيلة --</option>
            {bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Control>
        </Form.Group>

       <Form.Group>
  <Form.Label>الموقع</Form.Label>
  <Form.Control
    type="text"
    name="location"
    value={bloodDonation.location}
    onChange={handleChange}
    placeholder="أدخل المدينة أو المستشفى"
  />
</Form.Group>


<Form.Group>
  <Form.Label>وصف الحالة</Form.Label>
  <Form.Control
    as="textarea"
    name="description"
    value={bloodDonation.description}
    onChange={handleChange}
    placeholder="أدخل وصفًا مختصرًا للحالة أو الاحتياج"
  />
</Form.Group>



        <Form.Group>
          <Form.Label>الموعد النهائي</Form.Label>
          <Form.Control type="date" name="deadline" value={bloodDonation.deadline} onChange={handleChange} />
        </Form.Group>

        <Form.Group>
          <Form.Check type="checkbox" label="طلب مستعجل" name="isUrgent" checked={bloodDonation.isUrgent} onChange={handleChange} />
        </Form.Group>

        <Form.Group>
          <Form.Label>وسائل التواصل</Form.Label>
          {contactOptions.map(method => (
            <div key={method}>
              <Form.Label>{method === 'phone' ? 'الهاتف' : 'واتساب'}</Form.Label>
              <Form.Control
                type="text"
                placeholder={`رقم ${method}`}
                isInvalid={errors[method]}
                onChange={(e) => handleContactChange(method, e.target.value)}
              />
              {errors[method] && <Form.Control.Feedback type="invalid">يجب أن يكون الرقم 8 أرقام</Form.Control.Feedback>}
            </div>
          ))}
        </Form.Group>

        <Button type="submit" variant="primary">إرسال</Button>
      </Form>
    </div>
  );
};

export default BloodDonationForm;

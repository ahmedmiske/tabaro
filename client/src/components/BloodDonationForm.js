import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './DonationRequestForm.css';

const BloodDonationForm = () => {
  const [bloodDonation, setBloodDonation] = useState({
    bloodType: '',
    location: '',
    deadline: '',
    description: '',
    isUrgent: false,
    contactMethods: [],
  });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "غير معروف"];
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
      const updated = [...prev.contactMethods];
      const index = updated.findIndex(m => m.method === method);
      if (index !== -1) {
        updated[index].number = value;
      } else {
        updated.push({ method, number: value });
      }
      return { ...prev, contactMethods: updated };
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

  fetchWithInterceptors('/api/blood-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bloodDonation)
  })
    .then(res => {
      console.log("Blood donation request submitted:", res.body);
       setSuccessMessage("تم إرسال طلب التبرع بالدم بنجاح!");
       setFormSubmitted(true);
    })
    .catch(err => console.error("Submission error:", err));
};
return (
  <div className="donation-form-container blood-form">

    {formSubmitted ? (
      // ✅ عند إرسال الطلب بنجاح
      <div className="text-center">
        <div className="alert alert-success mt-3">
          ✅ تم إرسال طلب التبرع بالدم بنجاح!
        </div>
        <Button variant="primary" onClick={() => navigate('/donations')}>
          عرض طلبات التبرع بالدم
        </Button>
      </div>
    ) : (
      // 📝 استمارة طلب التبرع بالدم
      <>
        <div className="section-title">
          <h2>طلب تبرع بالدم</h2>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* فصيلة الدم */}
          <Form.Group>
            <Form.Label>فصيلة الدم</Form.Label>
            <Form.Control
              as="select"
              name="bloodType"
              value={bloodDonation.bloodType}
              onChange={handleChange}
              required
            >
              <option value="">-- اختر الفصيلة --</option>
              {bloodTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Form.Control>
          </Form.Group>

          {/* الموقع */}
          <Form.Group>
            <Form.Label>الموقع</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={bloodDonation.location}
              onChange={handleChange}
              placeholder="أدخل المدينة أو المستشفى"
              required
            />
          </Form.Group>

          {/* وصف الحالة */}
          <Form.Group>
            <Form.Label>وصف الحالة</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={bloodDonation.description}
              onChange={handleChange}
              placeholder="أدخل وصفًا مختصرًا للحالة أو الاحتياج"
              required
            />
          </Form.Group>

          {/* الموعد النهائي */}
          <Form.Group>
            <Form.Label>الموعد النهائي</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={bloodDonation.deadline}
              onChange={handleChange}
              required
              onBlur={(e) => {
                const selectedDate = new Date(e.target.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // تصفير الوقت
                if (selectedDate < today) {
                  alert("لا يمكن اختيار تاريخ في الماضي!");
                  setBloodDonation(prev => ({ ...prev, deadline: '' }));
                }
              }}
            />
          </Form.Group>

          {/* خيار الاستعجال */}
          <Form.Group>
            <Form.Check
              type="checkbox"
              label="طلب مستعجل"
              name="isUrgent"
              checked={bloodDonation.isUrgent}
              onChange={handleChange}
            />
          </Form.Group>

          {/* وسائل التواصل */}
          <Form.Group className="contact-methods">
            <Form.Label>وسائل التواصل</Form.Label>
            {contactOptions.map(method => (
              <div key={method} className="form-group">
                <Form.Label>{method === 'phone' ? 'الهاتف' : 'واتساب'}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={`رقم ${method}`}
                  isInvalid={errors[method]}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (!validatePhoneNumber(value)) {
                      setErrors(prev => ({ ...prev, [method]: true }));
                    } else {
                      setErrors(prev => ({ ...prev, [method]: false }));
                    }
                    handleContactChange(method, value);
                  }}
                />
                {errors[method] && (
                  <Form.Control.Feedback type="invalid">
                    يجب أن يكون الرقم 8 أرقام
                  </Form.Control.Feedback>
                )}
              </div>
            ))}
          </Form.Group>

          {/* زر الإرسال */}
          <Button type="submit" variant="danger">إرسال</Button>
        </Form>
      </>
    )}
  </div>
);
};

export default BloodDonationForm;

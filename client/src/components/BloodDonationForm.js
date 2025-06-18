import React, { useState } from 'react';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './DonationRequestForm.css';

const BloodDonationMultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [supportDocs, setSupportDocs] = useState(null);

  const [bloodDonation, setBloodDonation] = useState({
    bloodType: '',
    location: '',
    deadline: '',
    description: '',
    isUrgent: false,
    contactMethods: [],
  });

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

  const handleFileChange = (e) => {
    setSupportDocs(e.target.files[0]);
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
    formData.append('data', JSON.stringify(bloodDonation));
    if (supportDocs) {
      formData.append('file', supportDocs);
    }

    fetchWithInterceptors('/api/blood-requests', {
      method: 'POST',
      body: formData
    })
      .then(res => {
        console.log("Submitted:", res.body);
        setSuccessMessage("✅ تم إرسال طلب التبرع بنجاح!");
        setFormSubmitted(true);
      })
      .catch(err => console.error("Submission error:", err));
  };

  // التنقل بين الخطوات
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="donation-form-container">

      <ProgressBar now={(step / 5) * 100} label={`خطوة ${step} من 5`} className="mb-3" />

      {formSubmitted ? (
        <Alert variant="success">{successMessage}</Alert>
      ) : (
        <Form onSubmit={handleSubmit}>

          {/* الخطوة 1 */}
          {step === 1 && (
            <>
              <Form.Group>
                <Form.Label>فصيلة الدم</Form.Label>
                <Form.Control as="select" name="bloodType" value={bloodDonation.bloodType} onChange={handleChange} required>
                  <option value="">-- اختر الفصيلة --</option>
                  {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </Form.Control>
              </Form.Group>

              <Form.Group>
                <Form.Label>الموقع</Form.Label>
                <Form.Control type="text" name="location" value={bloodDonation.location} onChange={handleChange} placeholder="المدينة أو المستشفى" required />
              </Form.Group>
            </>
          )}

          {/* الخطوة 2 */}
          {step === 2 && (
            <>
              <Form.Group>
                <Form.Label>وصف الحالة</Form.Label>
                <Form.Control as="textarea" name="description" value={bloodDonation.description} onChange={handleChange} placeholder="وصف مختصر للحالة" required />
              </Form.Group>

              <Form.Group>
                <Form.Label>الموعد النهائي</Form.Label>
                <Form.Control type="date" name="deadline" value={bloodDonation.deadline} onChange={handleChange} required />
              </Form.Group>

              <Form.Group>
                <Form.Check type="checkbox" label="طلب مستعجل" name="isUrgent" checked={bloodDonation.isUrgent} onChange={handleChange} />
              </Form.Group>
            </>
          )}

          {/* الخطوة 3 */}
          {step === 3 && (
            <>
              <Form.Group>
                <Form.Label>وسائل التواصل</Form.Label>
                {contactOptions.map(method => (
                  <div key={method}>
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
            </>
          )}

          {/* الخطوة 4 */}
          {step === 4 && (
            <>
              <Form.Group>
                <Form.Label>رفع الوثائق الداعمة (اختياري)</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
                {supportDocs && <p>تم اختيار: {supportDocs.name}</p>}
              </Form.Group>
            </>
          )}

          {/* الخطوة 5 - التأكيد */}
          {step === 5 && (
            <>
              <Alert variant="info">
                ✅ أنت على وشك إرسال الطلب بعد مراجعة جميع المعلومات.
              </Alert>
            </>
          )}

          {/* أزرار التنقل بين الخطوات */}
          <div className="d-flex justify-content-between mt-3">
            {step > 1 && <Button variant="secondary" onClick={prevStep}>السابق</Button>}
            {step < 5 && <Button variant="primary" onClick={nextStep}>التالي</Button>}
            {step === 5 && <Button variant="success" type="submit">إرسال الطلب</Button>}
          </div>

        </Form>
      )}
    </div>
  );
};

export default BloodDonationMultiStepForm;

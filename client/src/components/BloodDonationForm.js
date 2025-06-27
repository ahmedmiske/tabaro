import React, { useState } from 'react';
import { Form, Button, ProgressBar, Alert } from 'react-bootstrap';
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
// import './DonationRequestForm.css';
 import './BloodDonationForm.css';
import TitleMain from './TitleMain';
import ProgressStep from './ProgressStep';

const BloodDonationMultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [supportDocs, setSupportDocs] = useState([]);
 const [showValidationAlert, setShowValidationAlert] = useState(false);
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
    setSupportDocs([...supportDocs, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    const newFiles = [...supportDocs];
    newFiles.splice(index, 1);
    setSupportDocs(newFiles);
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
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          if (typeof item === 'object') {
            formData.append(`contactMethods[${idx}][method]`, item.method);
            formData.append(`contactMethods[${idx}][number]`, item.number);
          } else {
            formData.append(key, item);
          }
        });
      } else {
        formData.append(key, value);
      }
    });

    // Append files
    supportDocs.forEach((file) => {
      formData.append('files', file);
    });

    fetchWithInterceptors('/api/blood-requests', {
      method: 'POST',
      body: formData
    })
      .then(res => {
        setSuccessMessage("✅ تم إرسال طلب التبرع بنجاح!");
        setFormSubmitted(true);
      })
      .catch(err => console.error("Submission error:", err));
  };
 

  const validateStep = () => {
  const newErrors = {};
  let valid = true;

  if (step === 1) {
    if (!bloodDonation.bloodType) {
      newErrors.bloodType = true;
      valid = false;
    }
    if (!bloodDonation.location.trim()) {
      newErrors.location = true;
      valid = false;
    }
  }

  if (step === 2) {
    if (!bloodDonation.description.trim()) {
      newErrors.description = true;
      valid = false;
    }
    if (!bloodDonation.deadline) {
      newErrors.deadline = true;
      valid = false;
    }
  }

 if (step === 3) {
  contactOptions.forEach((method) => {
    const current = bloodDonation.contactMethods.find(m => m.method === method);
    const number = current?.number || '';
    if (!validatePhoneNumber(number)) {
      newErrors[method] = true;
      valid = false;
    }
  });
}


  setErrors(newErrors);
  setShowValidationAlert(!valid);
  return valid;
};


  return (
    <>
       <TitleMain text1="التبرع بالدم" text2="اعلان طلب" />
     <div className="donation-form-container">
      
     <div className="form-title-box">
       <ProgressStep step={step} total={5} />
       </div>
       {showValidationAlert && (
  <Alert variant="danger" onClose={() => setShowValidationAlert(false)} dismissible>
    ⚠️ يرجى ملء جميع الحقول الإلزامية قبل المتابعة.
  </Alert>
)}
      {formSubmitted ? (
        <Alert variant="success">{successMessage}</Alert>
      ) : (
        
<Form onSubmit={handleSubmit}>

  {/* ✅ الخطوة 1 */}
  {step === 1 && (
    <>
      <Form.Group>
        <Form.Label>فصيلة الدم</Form.Label>
        <Form.Control
          as="select"
          name="bloodType"
          value={bloodDonation.bloodType}
          onChange={handleChange}
          isInvalid={errors.bloodType}
        >
          <option value="">-- اختر الفصيلة --</option>
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Form.Control>
        {errors.bloodType && (
          <Form.Control.Feedback type="invalid">
            الرجاء اختيار فصيلة الدم
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group>
        <Form.Label>الموقع</Form.Label>
        <Form.Control
          type="text"
          name="location"
          value={bloodDonation.location}
          onChange={handleChange}
          placeholder="المدينة أو المستشفى"
          isInvalid={errors.location}
        />
        {errors.location && (
          <Form.Control.Feedback type="invalid">
            هذا الحقل مطلوب
          </Form.Control.Feedback>
        )}
      </Form.Group>
    </>
  )}

  {/* ✅ الخطوة 2 */}
  {step === 2 && (
    <>
      <Form.Group>
        <Form.Label>وصف الحالة</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={bloodDonation.description}
          onChange={handleChange}
          isInvalid={errors.description}
        />
        {errors.description && (
          <Form.Control.Feedback type="invalid">
            يرجى إدخال وصف الحالة
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group>
        <Form.Label>الموعد النهائي</Form.Label>
        <Form.Control
          type="date"
          name="deadline"
          value={bloodDonation.deadline}
          onChange={handleChange}
          isInvalid={errors.deadline}
        />
        {errors.deadline && (
          <Form.Control.Feedback type="invalid">
            حدد موعدًا نهائيًا صالحًا
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mt-2">
        <Form.Check
          type="checkbox"
          label="طلب مستعجل"
          name="isUrgent"
          checked={bloodDonation.isUrgent}
          onChange={handleChange}
        />
      </Form.Group>
    </>
  )}

 {/* ✅ الخطوة 3 */}
{step === 3 && (
  <Form.Group>
    <Form.Label>وسائل التواصل</Form.Label>
    {contactOptions.map(method => {
  const current = bloodDonation.contactMethods.find(m => m.method === method);
  const numberValue = current ? current.number : '';

  return (
    <div key={method} className="mb-3">
      <Form.Label>{method === 'phone' ? 'الهاتف' : 'واتساب'}</Form.Label>
      <Form.Control
        type="text"
        placeholder={` ${method}`}
        required
        value={numberValue}
        onChange={(e) => {
          const value = e.target.value;
          handleContactChange(method, value);

          if (!validatePhoneNumber(value)) {
            setErrors(prev => ({ ...prev, [method]: true }));
          } else {
            setErrors(prev => ({ ...prev, [method]: false }));
          }
        }}
        isInvalid={errors[method]}
      />
      <Form.Control.Feedback type="invalid">
        يجب إدخال رقم صالح مكوّن من 8 أرقام
      </Form.Control.Feedback>
    </div>
  );
})}

  </Form.Group>
)}


  {/* ✅ الخطوة 4 */}
  {step === 4 && (
    <Form.Group>
      <Form.Label>الوثائق الداعمة (يمكنك رفع أكثر من ملف)</Form.Label>
      <Form.Control type="file" multiple onChange={handleFileChange} />
      <ul className="mt-2 list-unstyled">
        {supportDocs.map((file, idx) => (
          <li key={idx}>
            📎 {file.name}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => removeFile(idx)}
              className="ms-2"
            >
              حذف
            </Button>
          </li>
        ))}
      </ul>
    </Form.Group>
  )}

  {/* ✅ الخطوة 5 */}
  {step === 5 && (
    <Alert variant="info" className="text-center">
      ✅ أنت على وشك إرسال الطلب بعد مراجعة جميع المعلومات.
    </Alert>
  )}

  {/* ✅ أزرار التنقل */}
<div className="action-buttons">
  {step > 1 && (
    <Button className="button-prev" onClick={() => setStep(step - 1)}>
      
      السابق
   <FaArrowRight className="ms-2"  size={25} />
    </Button>
  )}
  {step < 5 && (
    <Button className="button-next" onClick={() => {if (validateStep()) setStep(step + 1);}}>
      <FaArrowLeft className="me-2"  size={25} />
      التالي
      
    </Button>
  )}
  {step === 5 && (
    <Button className="button-submit" type="submit">
      <FaCheck className="ms-2"  size={25} />
      إرسال الطلب
    </Button>
  )}
</div>


</Form>

      )}
    </div>
    </>
  );
};

export default BloodDonationMultiStepForm;

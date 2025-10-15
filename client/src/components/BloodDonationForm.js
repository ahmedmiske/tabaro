// src/components/BloodDonationForm.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
import TitleMain from './TitleMain';

import './BloodDonationForm.css';

const BloodDonationForm = () => {
  const [bloodDonation, setBloodDonation] = useState({
    bloodType: '',
    location: '',
    description: '',
    deadline: '',
    isUrgent: false,
    contactMethods: []
  });

  // تحديث عنوان الصفحة
  React.useEffect(() => {
    document.title = 'طلب تبرع بالدم - تبارو';
    return () => {
      document.title = 'تبارو - منصة التبرعات';
    };
  }, []);

  const [step, setStep] = useState(1);
  const [supportDocs, setSupportDocs] = useState([]);
  const [errors, setErrors] = useState({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [fileError, setFileError] = useState('');

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "غير معروف"];
  const contactOptions = ['phone', 'whatsapp'];
  
  const placesList = [
    'اترارزة',
    'أدرار',
    'آسابا',
    'أكجوجت',
    'ألاك',
    'أم التونسي',
    'أمورج',
    'أوجفت',
    'بئر أم اݕرين',
    'بوتلميت',
    'بنشاب',
    'تيجكة',
    'تيشيت',
    'تمبدغة',
    'جعوار',
    'حاسي الشيخ',
    'رأس البئر',
    'الرشيد',
    'روصو',
    'زمال',
    'سيليبابي',
    'صنقرقة',
    'طارة',
    'فم لعبرة',
    'قيدي مقة',
    'كوبني',
    'كرار',
    'كنكوصة',
    'كيفة',
    'لبديا',
    'لعصابة',
    'لكصر',
    'نواكشوط',
    'نواذيبو',
    'وألة',
    'ولاتة',
    'واد الناگة',
    'وسو',
    'يورلي'
  ];

  const validateStep = (stepNumber) => {
    const newErrors = {};
    
    switch(stepNumber) {
      case 1:
        if (!bloodDonation.bloodType) newErrors.bloodType = 'نوع الدم مطلوب';
        if (!bloodDonation.location) newErrors.location = 'المكان مطلوب';
        break;
      case 2:
        if (!bloodDonation.description) newErrors.description = 'الوصف مطلوب';
        break;
      case 3:
        if (!bloodDonation.deadline) newErrors.deadline = 'الموعد النهائي مطلوب';
        break;
      case 4:
        if (bloodDonation.contactMethods.length === 0) {
          newErrors.contactMethods = 'يجب اختيار طريقة اتصال واحدة على الأقل';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setBloodDonation({ ...bloodDonation, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleContactMethodChange = (method) => {
    const updatedMethods = bloodDonation.contactMethods.includes(method)
      ? bloodDonation.contactMethods.filter(m => m !== method)
      : [...bloodDonation.contactMethods, method];
    
    setBloodDonation({ ...bloodDonation, contactMethods: updatedMethods });
    if (errors.contactMethods) {
      setErrors({ ...errors, contactMethods: '' });
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setShowValidationAlert(false);
    } else {
      setShowValidationAlert(true);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setShowValidationAlert(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setFileError('لا يمكن رفع أكثر من 5 ملفات');
      return;
    }
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    
    if (validFiles.length !== files.length) {
      setFileError('بعض الملفات غير صالحة. يُسمح بملفات JPG، PNG، PDF فقط بحجم أقصى 5MB');
    } else {
      setFileError('');
    }
    
    setSupportDocs(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      setShowValidationAlert(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bloodType', bloodDonation.bloodType);
      formData.append('location', bloodDonation.location);
      formData.append('description', bloodDonation.description);
      formData.append('deadline', bloodDonation.deadline);
      formData.append('isUrgent', bloodDonation.isUrgent);
      formData.append('contactMethods', JSON.stringify(bloodDonation.contactMethods));

      supportDocs.forEach((file) => {
        formData.append('supportDocs', file);
      });

      const response = await fetchWithInterceptors('/api/blood-request', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage('تم إرسال طلب التبرع بالدم بنجاح!');
        setFormSubmitted(true);
        
        // Reset form after successful submission
        setTimeout(() => {
          setBloodDonation({
            bloodType: '',
            location: '',
            description: '',
            deadline: '',
            isUrgent: false,
            contactMethods: []
          });
          setSupportDocs([]);
          setStep(1);
          setFormSubmitted(false);
          setSuccessMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting blood donation request:', error);
      setErrors({ general: 'حدث خطأ أثناء إرسال الطلب' });
    }
  };

  const resetForm = () => {
    setBloodDonation({
      bloodType: '',
      location: '',
      description: '',
      deadline: '',
      isUrgent: false,
      contactMethods: []
    });
    setSupportDocs([]);
    setStep(1);
    setErrors({});
    setShowValidationAlert(false);
    setSuccessMessage('');
    setFormSubmitted(false);
  };

  // معلومات الخطوات للتنقل (4 خطوات)
  const stepInfo = {
    1: { 
      title: 'نوع الدم والمكان', 
      description: 'اختر نوع الدم المطلوب وحدد المكان',
      icon: '🩸'
    },
    2: { 
      title: 'وصف الحالة', 
      description: 'اكتب وصفاً مفصلاً وارفق الملفات الداعمة',
      icon: '📝'
    },
    3: { 
      title: 'الموعد والإعدادات', 
      description: 'حدد الموعد النهائي وإعداد الطوارئ',
      icon: '⏰'
    },
    4: { 
      title: 'معلومات الاتصال', 
      description: 'اختر طرق التواصل وراجع الطلب',
      icon: '📞'
    }
  };

  const totalSteps = 4;

  if (formSubmitted && successMessage) {
    return (
      <div className="donation-form-container">
        <TitleMain title="طلب تبرع بالدم" />
        <Alert variant="success" className="text-center">
          <FaCheck className="me-2" />
          {successMessage}
        </Alert>
        <div className="text-center">
          <Button variant="primary" onClick={resetForm}>
            إنشاء طلب جديد
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="donation-form-container">
      {/* رأس النموذج الأنيق */}
      <header className="form-header">
        <TitleMain title="طلب تبرع بالدم 🩸" />
        
        {/* شريط التقدم متعدد الخطوات */}
        <div className="steps-progress-container" role="progressbar" aria-valuenow={step} aria-valuemin="1" aria-valuemax={totalSteps}>
          <div className="steps-info">
            <div className="current-step-info">
              <span className="step-icon">{stepInfo[step]?.icon}</span>
              <div className="step-details">
                <h3 className="step-title">{stepInfo[step]?.title}</h3>
                <p className="step-description">{stepInfo[step]?.description}</p>
              </div>
            </div>
            
            {/* نقاط الخطوات بدلاً من العداد النصي */}
            <div className="steps-dots-header">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index + 1}
                  className={`step-dot-header ${step >= index + 1 ? 'completed' : ''} ${step === index + 1 ? 'active' : ''}`}
                  aria-label={`الخطوة ${index + 1}: ${stepInfo[index + 1]?.title}`}
                >
                  {step > index + 1 ? '✓' : index + 1}
                </div>
              ))}
            </div>
          </div>
          
          {/* شريط التقدم البصري */}
          <div className="progress-indicator">
            <div 
              className={`progress-bar ${formSubmitted ? 'complete' : ''}`}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {showValidationAlert && (
        <Alert variant="danger" className="text-center">
          يرجى ملء جميع الحقول المطلوبة قبل المتابعة
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Step 1: Blood Type & Location */}
        {step === 1 && (
          <div className="step-content">
            <Form.Group className="mb-3">
              <Form.Label>نوع الدم المطلوب *</Form.Label>
              <Form.Select
                value={bloodDonation.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                isInvalid={!!errors.bloodType}
              >
                <option value="">اختر نوع الدم</option>
                {bloodTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Form.Select>
              {errors.bloodType && (
                <Form.Control.Feedback type="invalid">
                  {errors.bloodType}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>المكان *</Form.Label>
              <Form.Select
                value={bloodDonation.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                isInvalid={!!errors.location}
              >
                <option value="">اختر المكان</option>
                {placesList.map((place) => (
                  <option key={place} value={place}>{place}</option>
                ))}
              </Form.Select>
              {errors.location && (
                <Form.Control.Feedback type="invalid">
                  {errors.location}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="step-content">
            <h4 className="step-title">وصف الحالة</h4>
            <Form.Group className="mb-3">
              <Form.Label>وصف الحالة *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={bloodDonation.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="اكتب وصفاً مفصلاً عن الحالة والحاجة للتبرع..."
                isInvalid={!!errors.description}
              />
              {errors.description && (
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>الملفات الداعمة (اختياري)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                يمكنك رفع حتى 5 ملفات (صور أو PDF، حجم أقصى 5MB لكل ملف)
              </Form.Text>
              {fileError && <div className="text-danger mt-2">{fileError}</div>}
              {supportDocs.length > 0 && (
                <div className="mt-2">
                  <small className="text-success">تم اختيار {supportDocs.length} ملف(ات)</small>
                </div>
              )}
            </Form.Group>
          </div>
        )}

        {/* Step 3: Deadline */}
        {step === 3 && (
          <div className="step-content">
            <h4 className="step-title">الموعد النهائي</h4>
            <Form.Group className="mb-3">
              <Form.Label>الموعد النهائي للتبرع *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={bloodDonation.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                isInvalid={!!errors.deadline}
              />
              {errors.deadline && (
                <Form.Control.Feedback type="invalid">
                  {errors.deadline}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="حالة طارئة"
                checked={bloodDonation.isUrgent}
                onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
              />
            </Form.Group>
          </div>
        )}

        {/* Step 4: Contact Methods */}
        {step === 4 && (
          <div className="step-content">
            <h4 className="step-title">طرق التواصل</h4>
            <Form.Group className="mb-3">
              <Form.Label>اختر طرق التواصل المفضلة *</Form.Label>
              <div>
                {contactOptions.map((method) => (
                  <Form.Check
                    key={method}
                    type="checkbox"
                    label={method === 'phone' ? 'هاتف' : 'واتساب'}
                    checked={bloodDonation.contactMethods.includes(method)}
                    onChange={() => handleContactMethodChange(method)}
                  />
                ))}
              </div>
              {errors.contactMethods && (
                <div className="text-danger mt-2">{errors.contactMethods}</div>
              )}
            </Form.Group>

            {/* Summary */}
            <div className="summary-section">
              <h5>ملخص الطلب:</h5>
              <ul>
                <li><strong>نوع الدم:</strong> {bloodDonation.bloodType}</li>
                <li><strong>المكان:</strong> {bloodDonation.location}</li>
                <li><strong>الموعد النهائي:</strong> {new Date(bloodDonation.deadline).toLocaleString('ar-MR')}</li>
                <li><strong>طرق التواصل:</strong> {bloodDonation.contactMethods.map(method => method === 'phone' ? 'هاتف' : 'واتساب').join(', ')}</li>
                {bloodDonation.isUrgent && <li><strong>حالة طارئة</strong></li>}
                {supportDocs.length > 0 && <li><strong>الملفات الداعمة:</strong> {supportDocs.length} ملف(ات)</li>}
              </ul>
            </div>
          </div>
        )}

        {errors.general && (
          <Alert variant="danger" className="mt-3">
            {errors.general}
          </Alert>
        )}

        {/* Navigation Buttons */}
        <div className="action-buttons mt-3 d-flex gap-2">
          {step > 1 && (
            <Button 
              variant="secondary" 
              onClick={prevStep}
              size="md"
              className="px-4 py-2"
            >
              السابق
            </Button>
          )}
          
          {step < 4 && (
            <Button 
              variant="primary" 
              onClick={nextStep}
              size="md"
              className="px-4 py-2"
            >
              التالي
            </Button>
          )}
          
          {step === 4 && (
            <Button 
              type="submit" 
              variant="success"
              size="md"
              className="px-4 py-2"
            >
              <FaCheck className="me-2" />
              إرسال الطلب
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default BloodDonationForm;
import React, { useState } from 'react';
import { Form, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import './DonationRequestForm.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const DonationRequestForm = () => {
  const [donation, setDonation] = useState({
    category: '',
    type: '',
    description: '',
    amount: '',
    deadline: '',
    isUrgent: false,
    bloodType: '',
    proofDocuments: [],
    date: new Date().toISOString(),
    paymentMethods: [],
    contactMethods: []
  });

  const [step, setStep] = useState(1);

  const [errors, setErrors] = useState({
    paymentPhones: {},
    contactNumbers: {}
  });

  const categories = {
    "الصحة": [ "أدوية", "معدات طبية"],
    "التعليم": ["لوازم مدرسية", "منح دراسية", "دروس خصوصية"],
    "السكن": ["إيجار عاجل", "إعادة بناء", "أثاث"],
    "الكوارث الطبيعية": ["إغاثة عاجلة", "مساعدة متضررين"],
    "الإعلانات الاجتماعية": ["البحث عن مفقود", "إيجاد ممتلكات ضائعة", "إعلانات تبادل المساعدات"]
  };

  
  const paymentOptions = ["Bankily", "Masrifi", "Sadad", "bim-bank"];
  // const contactOptions = ["phone", "whatsapp"];
  // const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const socialAds = categories["الإعلانات الاجتماعية"];
  
  const validatePhoneNumber = (value) => /^\d{8}$/.test(value);
  
  const canDonateFinancially = () => {
    return donation.type &&  !socialAds.includes(donation.type);
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleCategoryChange = (e) => {
    setDonation(prev => ({
      ...prev,
      category: e.target.value,
      type: ''
    }));
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setDonation(prev => ({
      ...prev,
      proofDocuments: [...prev.proofDocuments, ...files]
    }));
  };
  
  const handleRemoveFile = (index) => {
    setDonation(prev => ({
      ...prev,
      proofDocuments: prev.proofDocuments.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // تحقق من أرقام الهاتف
    let hasError = false;
    const newPaymentErrors = {};
    const newContactErrors = {};
  
    donation.paymentMethods.forEach(({ method, phone }) => {
      if (!validatePhoneNumber(phone)) {
        newPaymentErrors[method] = true;
        hasError = true;
      }
    });
  
    donation.contactMethods.forEach(({ method, number }) => {
      if (!validatePhoneNumber(number)) {
        newContactErrors[method] = true;
        hasError = true;
      }
    });
  
    setErrors({
      paymentPhones: newPaymentErrors,
      contactNumbers: newContactErrors
    });
  
    if (hasError) return;
  
    const formData = new FormData();
    Object.entries(donation).forEach(([key, value]) => {
      if (key === "proofDocuments") {
        value.forEach((file, index) => {
          formData.append(`proofDocuments[${index}]`, file);
        });
      } else if (["paymentMethods", "contactMethods"].includes(key)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
  
    fetchWithInterceptors('/api/donationRequests', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => console.log("Success:", data))
      .catch(err => console.error("Error:", err));
  };
  

  return (
    <div className="donation-form-container">

      <h2>طلب تبرع جديد</h2>
      <div className="progress-container">
         <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}>
         </div>
         <span className="progress-text">{`الخطوة ${step} من 3`}</span>
      </div>

   <Form onSubmit={handleSubmit}>
  {step === 1 && (
    <>
      <Form.Group>
        <Form.Label>اختر المجال</Form.Label>
        <Form.Control as="select" name="category" value={donation.category} onChange={handleCategoryChange} required>
          <option value="">-- اختر --</option>
          {Object.keys(categories).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Form.Control>
      </Form.Group>

      {donation.category && (
        <Form.Group>
          <Form.Label>اختر نوع التبرع</Form.Label>
          <Form.Control as="select" name="type" value={donation.type} onChange={handleChange} required>
            <option value="">-- اختر النوع --</option>
            {categories[donation.category].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Form.Control>
        </Form.Group>
      )}
      <Form.Group>
        <Form.Label>وصف الحالة</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={donation.description}
          onChange={handleChange}
          placeholder="أدخل وصفًا مختصرًا للحالة أو الاحتياج"
        />
      </Form.Group>
      
    </>
  )}

  {step === 2 && canDonateFinancially() && (
    <>
      <Form.Group>
        <Form.Label>المبلغ المطلوب</Form.Label>
        <Form.Control type="number" name="amount" value={donation.amount} onChange={handleChange} />
      </Form.Group>

      <Form.Group>
        <Form.Label>اختر وسائل الدفع</Form.Label>
        {paymentOptions.map(method => {
          const selected = donation.paymentMethods.find(m => m.method === method);
          return (
            <div key={method}>
              <Form.Check
                type="checkbox"
                label={method}
                checked={!!selected}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDonation(prev => {
                    const current = [...prev.paymentMethods];
                    if (checked) {
                      current.push({ method, phone: '' });
                    } else {
                      return { ...prev, paymentMethods: current.filter(m => m.method !== method) };
                    }
                    return { ...prev, paymentMethods: current };
                  });
                }}
              />
              {selected && (
                <Form.Control
                  type="text"
                  placeholder={`رقم هاتف ${method}`}
                  value={selected.phone}
                  onChange={(e) => {
                    const phone = e.target.value;
                    setDonation(prev => ({
                      ...prev,
                      paymentMethods: prev.paymentMethods.map(m => m.method === method ? { ...m, phone } : m)
                    }));
                  }}
                />
              )}
            </div>
          );
        })}
      </Form.Group>
    </>
  )}

  {step === 3 && (
    <>
      <Form.Group>
        <Form.Label>وثائق داعمة</Form.Label>
        <Form.Control type="file" multiple onChange={handleFileUpload} />
        <ListGroup>
          {donation.proofDocuments.map((file, idx) => (
            <ListGroupItem key={idx}>
              {file.name}
              <Button variant="danger" size="sm" onClick={() => handleRemoveFile(idx)}>حذف</Button>
            </ListGroupItem>
          ))}
        </ListGroup>
      </Form.Group>

      <Form.Group>
        <Form.Check type="checkbox" label="طلب مستعجل" name="isUrgent" checked={donation.isUrgent} onChange={handleChange} />
      </Form.Group>
    </>
  )}

  {/* أزرار التنقل */}
  <div className="action-buttons">
    {step > 1 && (
      <Button variant="secondary" onClick={() => setStep(prev => prev - 1)}>السابق</Button>
    )}
    {step < 3 && (
      <Button variant="primary" onClick={() => setStep(prev => prev + 1)}>التالي</Button>
    )}
    {step === 3 && (
      <Button type="submit" variant="success">إرسال</Button>
    )}
  </div>
</Form>

    </div>
  );
};

export default DonationRequestForm;

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

  const categories = {
    "الصحة": ["تبرع بالدم", "أدوية", "معدات طبية"],
    "التعليم": ["لوازم مدرسية", "منح دراسية", "دروس خصوصية"],
    "السكن": ["إيجار عاجل", "إعادة بناء", "أثاث"],
    "الكوارث الطبيعية": ["إغاثة عاجلة", "مساعدة متضررين"],
    "الإعلانات الاجتماعية": ["البحث عن مفقود", "إيجاد ممتلكات ضائعة", "إعلانات تبادل المساعدات"]
  };

  const paymentOptions = ["Bankily", "Masrifi", "Sadad", "Cash"];
  const contactOptions = ["phone", "whatsapp"];
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const socialAds = ["البحث عن مفقود", "إيجاد ممتلكات ضائعة", "إعلانات تبادل المساعدات"];

  const canDonateFinancially = () => {
    return donation.type && donation.type !== "تبرع بالدم" && !socialAds.includes(donation.type);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonation({
      ...donation,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (e) => {
    setDonation({
      ...donation,
      category: e.target.value,
      type: ''
    });
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
    const formData = new FormData();

    Object.entries(donation).forEach(([key, value]) => {
      if (key === "proofDocuments") {
        value.forEach((file, index) => {
          formData.append(`proofDocuments[${index}]`, file);
        });
      } else if (key === "paymentMethods" || key === "contactMethods") {
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
      <Form onSubmit={handleSubmit}>
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
          <Form.Label>الوصف</Form.Label>
          <Form.Control as="textarea" name="description" value={donation.description} onChange={handleChange} required />
        </Form.Group>

        {canDonateFinancially() && (
          <>
            <Form.Group>
              <Form.Label>المبلغ المطلوب</Form.Label>
              <Form.Control type="number" name="amount" value={donation.amount} onChange={handleChange} />
            </Form.Group>

            <Form.Group>
              <Form.Label>اختر وسائل الدفع</Form.Label>
              {paymentOptions.map((method) => {
                const selected = donation.paymentMethods.find((m) => m.method === method);
                return (
                  <div key={method} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      label={method}
                      checked={!!selected}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDonation((prev) => {
                          const current = [...prev.paymentMethods];
                          if (checked) {
                            current.push({ method, phone: '' });
                          } else {
                            return {
                              ...prev,
                              paymentMethods: current.filter((m) => m.method !== method)
                            };
                          }
                          return { ...prev, paymentMethods: current };
                        });
                      }}
                    />
                    {selected && (
                      <Form.Control
                        className="mt-1"
                        type="text"
                        placeholder={`رقم هاتف ${method}`}
                        value={selected.phone}
                        onChange={(e) => {
                          const phone = e.target.value;
                          setDonation((prev) => ({
                            ...prev,
                            paymentMethods: prev.paymentMethods.map((m) =>
                              m.method === method ? { ...m, phone } : m
                            )
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

        {donation.type === "تبرع بالدم" && (
          <Form.Group>
            <Form.Label>فصيلة الدم</Form.Label>
            <Form.Control as="select" name="bloodType" value={donation.bloodType} onChange={handleChange}>
              <option value="">اختر الفصيلة</option>
              {bloodTypes.map(b => <option key={b} value={b}>{b}</option>)}
            </Form.Control>
          </Form.Group>
        )}

        {/* وسائل التواصل */}
        <Form.Group className='contact-donation' >
          <Form.Label>وسائل التواصل</Form.Label>
          {contactOptions.map((method) => {
            const selected = donation.contactMethods.find((m) => m.method === method);
            return (
              <div key={method} className="mb-2 ">
                <Form.Check
                  type="checkbox"
                  label={method === "phone" ? "هاتف" : "واتساب"}
                  checked={!!selected}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setDonation((prev) => {
                      const current = [...prev.contactMethods];
                      if (checked) {
                        current.push({ method, number: '' });
                      } else {
                        return {
                          ...prev,
                          contactMethods: current.filter((m) => m.method !== method)
                        };
                      }
                      return { ...prev, contactMethods: current };
                    });
                  }}
                />
                {selected && (
                  <Form.Control
                    className="mt-1"
                    type="text"
                    placeholder={`رقم ${method === "phone" ? "الهاتف" : "الواتساب"}`}
                    value={selected.number}
                    onChange={(e) => {
                      const number = e.target.value;
                      setDonation((prev) => ({
                        ...prev,
                        contactMethods: prev.contactMethods.map((m) =>
                          m.method === method ? { ...m, number } : m
                        )
                      }));
                    }}
                  />
                )}
              </div>
            );
          })}
        </Form.Group>

        <Form.Group>
          <Form.Label>الموعد النهائي</Form.Label>
          <Form.Control type="date" name="deadline" value={donation.deadline} onChange={handleChange} />
        </Form.Group>

        <Form.Group>
          <Form.Check type="checkbox" label="طلب مستعجل" name="isUrgent" checked={donation.isUrgent} onChange={handleChange} />
        </Form.Group>

        <Form.Group>
          <Form.Label>وثائق داعمة</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileUpload} />
          <ListGroup>
            {donation.proofDocuments.map((file, idx) => (
              <ListGroupItem key={idx}>
                {file.name} <Button variant="danger" size="sm" onClick={() => handleRemoveFile(idx)}>حذف</Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Form.Group>

        <Button type="submit" variant="primary">إرسال</Button>
      </Form>
    </div>
  );
};

export default DonationRequestForm;

import React, { useState } from 'react';
import { Form, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import './DonationRequestForm.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const DonationRequestForm = () => {
  const [donation, setDonation] = useState({
    category: '',
    types: [],
    description: '',
    isRequester: true,
    requesterName: '',
    requesterContact: '',
    proofDocuments: []
  });

  const categories = {
    "الصحة": ["تبرع بالدم", "أدوية", "معدات طبية"],
    "التعليم": ["لوازم مدرسية", "منح دراسية", "دروس خصوصية"],
    "السكن": ["إيجار عاجل", "إعادة بناء", "أثاث"],
    "الكوارث الطبيعية": ["إغاثة عاجلة", "مساعدة متضررين"],
    "الإعلانات الاجتماعية": ["البحث عن مفقود", "إيجاد ممتلكات ضائعة", "إعلانات تبادل المساعدات"]
  };

  const handleChange = (e) => {
    setDonation({ ...donation, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setDonation({ ...donation, category: e.target.value, types: [] });
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setDonation((prevState) => ({
      ...prevState,
      types: prevState.types.includes(selectedType)
        ? prevState.types.filter((type) => type !== selectedType)
        : [...prevState.types, selectedType],
    }));
  };

  const handleFileUpload = (e) => {
    // استخراج الملفات من الحدث الناتج عن اختيار الملفات
    const newFiles = Array.from(e.target.files);
  
    // تحديث الحالة بإضافة الملفات الجديدة إلى القائمة الحالية
    setDonation((prevState) => ({
      ...prevState,
      proofDocuments: [...prevState.proofDocuments, ...newFiles]
    }));
  };

  const handleRemoveFile = (index) => {
    setDonation((prevState) => ({
      ...prevState,
      proofDocuments: prevState.proofDocuments.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تحويل البيانات والملفات إلى FormData إذا كان الأمر يتطلب إرسال ملفات
    const formData = new FormData();
    formData.append('category', donation.category);
    formData.append('types', JSON.stringify(donation.types)); // حيث أنها array
    formData.append('description', donation.description);
    formData.append('isRequester', donation.isRequester);
    formData.append('requesterName', donation.requesterName);
    formData.append('requesterContact', donation.requesterContact);
  
    // إضافة الملفات
    donation.proofDocuments.forEach((file, index) => {
      formData.append(`proofDocuments[${index}]`, file);
    });
  
    // 
    fetchWithInterceptors('/api/donationRequests', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData)) //   
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
  

  return (
    <div className="donation-form-container">
      <h2>طلب تبرع جديد</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>اختر المجال</Form.Label>
          <Form.Control as="select" name="category" value={donation.category} onChange={handleCategoryChange} required>
            <option value="">-- اختر المجال --</option>
            {Object.keys(categories).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Control>
        </Form.Group>

        {donation.category && (
          <Form.Group className="donation-type-form">
            <Form.Label>اختر نوع التبرع</Form.Label>
            <div className="type-options-container">
              {categories[donation.category].map((type, index) => (
                <div key={type} className="type-check-group">
                  <Form.Check
                    className="type-check"
                    type="checkbox"
                    label={type}
                    value={type}
                    checked={donation.types.includes(type)}
                    onChange={handleTypeChange}
                  />
                </div>
              ))}
            </div>
          </Form.Group>
        )}

        <Form.Group>
          <Form.Label>وصف الحالة</Form.Label>
          <Form.Control as="textarea" name="description" value={donation.description} onChange={handleChange} required />
        </Form.Group>

        <Form.Group>
          <Form.Check
            type="checkbox"
            label="أنا صاحب الطلب"
            checked={donation.isRequester}
            onChange={() => setDonation({ ...donation, isRequester: !donation.isRequester })}
          />
        </Form.Group>

        {!donation.isRequester && (
          <>
            <Form.Group>
              <Form.Label>اسم صاحب الطلب</Form.Label>
              <Form.Control type="text" name="requesterName" value={donation.requesterName} onChange={handleChange} required={!donation.isRequester} />
            </Form.Group>
            <Form.Group>
              <Form.Label>وسيلة التواصل</Form.Label>
              <Form.Control type="text" name="requesterContact" value={donation.requesterContact} onChange={handleChange} required={!donation.isRequester} />
            </Form.Group>
          </>
        )}

        <Form.Group className='file-upload'>
          <Form.Label>تحميل الوثائق الداعمة (اختياري)</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileUpload} />
          <ListGroup>
            {donation.proofDocuments.map((file, index) => (
              <ListGroupItem key={index}>
                {file.name} <Button variant="danger" size="sm" onClick={() => handleRemoveFile(index)}>حذف</Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        </Form.Group>

        <Button type="submit" variant="primary">إرسال الطلب</Button>
      </Form>
    </div>
  );
};

export default DonationRequestForm;

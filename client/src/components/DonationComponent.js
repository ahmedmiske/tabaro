import React, { useState, useEffect } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './DonationComponent.css';

function DonationComponent() {
  const [donations, setDonations] = useState([]);
  const [newDonation, setNewDonation] = useState({
    title: '',
    description: '',
    type: 'request', // الطلب أو العرض
  });

  useEffect(() => {
    fetchWithInterceptors('/api/donations')
      .then(response => response.json())
      .then(data => setDonations(data))
      .catch(error => console.error('Error fetching donations:', error));
  }, []);

  const handleChange = (e) => {
    setNewDonation({ ...newDonation, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWithInterceptors('/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDonation),
    })
      .then(response => response.json())
      .then(data => setDonations([...donations, data]))
      .catch(error => console.error('Error adding donation:', error));
  };

  const handleDonate = (donationId, recipientId) => {
    fetchWithInterceptors(`/api/donations/${donationId}/donate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId }),
    })
      .then(response => response.json())
      .then(() => alert('تم إرسال إشعار للمستفيد'))
      .catch(error => console.error('Error sending donation notification:', error));
  };

  return (
    <div className="donation-container">
      <h2>منصة التبرع</h2>

      {/* نموذج لإضافة إعلان تبرع */}
      <Form onSubmit={handleSubmit} className="donation-form">
        <Form.Group>
          <Form.Label>عنوان الحالة</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={newDonation.title}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>وصف الحالة</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={newDonation.description}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>نوع التبرع</Form.Label>
          <Form.Control as="select" name="type" value={newDonation.type} onChange={handleChange}>
            <option value="request">طلب تبرع</option>
            <option value="offer">عرض تبرع</option>
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" className="sendButton">نشر الإعلان</Button>
      </Form>

      {/* قائمة الإعلانات */}
      <div className="donation-list">
        <h3>الإعلانات المتاحة</h3>
        {donations.length > 0 ? (
          donations.map(donation => (
            <Card key={donation.id} className="donation-card">
              <Card.Body>
                <Card.Title>{donation.title}</Card.Title>
                <Card.Text>{donation.description}</Card.Text>
                <Card.Text>
                  <strong>النوع:</strong> {donation.type === 'request' ? 'طلب تبرع' : 'عرض تبرع'}
                </Card.Text>
                {donation.type === 'request' ? (
                  <Button
                    variant="success"
                    className="sendButton"
                    onClick={() => handleDonate(donation.id, donation.userId)}
                  >
                    التبرع لهذه الحالة
                  </Button>
                ) : (
                  <Button variant="info" className="backButton">جاهز للتبرع</Button>
                )}
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>لا توجد إعلانات تبرع متاحة حاليًا.</p>
        )}
      </div>
    </div>
  );
}

export default DonationComponent;

import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

function DonationForm({ addDonation }) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [headerImage, setHeaderImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('headerImage', headerImage);

    try {
      const response = await fetch('http://localhost:5000/donations', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      addDonation(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (e) => {
    setHeaderImage(e.target.files[0]);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="type">
        <Form.Label>نوع التبرع</Form.Label>
        <Form.Control
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="description">
        <Form.Label>الوصف</Form.Label>
        <Form.Control
          as="textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="date">
        <Form.Label>تاريخ التبرع</Form.Label>
        <Form.Control
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </Form.Group>
      <Form.Group controlId="headerImage">
        <Form.Label>صورة الرأس</Form.Label>
        <Form.Control
          type="file"
          onChange={handleFileChange}
          required
        />
      </Form.Group>
      <Button variant="primary" type="submit">
        إضافة التبرع
      </Button>
    </Form>
  );
}

export default DonationForm;

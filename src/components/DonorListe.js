import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Row, Col, Container } from 'react-bootstrap';
import './DonorList.css'; // تأكد من أن ملف CSS تم استيراده بشكل صحيح

function DonorListe() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('http://localhost:5000/donations');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setDonations(data);
        setLoading(false);
      } catch (error) {
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return <p>جاري التحميل...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="donation-container">
      <h2>التبرعات</h2>
      <Container>
        <Row className="donation-grid">
          {donations.map((donation) => (
            <Col key={donation.id} xs={12} sm={6} md={4} lg={2} className="donation-card">
              <Card style={{ height: '100%' ,maxHeight:'100%'}}>
                <Card.Header
                  style={{
                    backgroundImage: `url(${donation.headerImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '150px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    border:'1px solid #cccc',
                    justifyContent: 'center',
                    color: 'red'
                  }}
                >
                  <Card.Title>{donation.type}</Card.Title>
                </Card.Header>
                <Card.Body style={{ direction: 'rtl' }}>
                  <Card.Text>{donation.description}</Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                  <ListGroup.Item>تاريخ الإضافة: {donation.date}</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default DonorListe;

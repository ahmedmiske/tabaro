import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, ListGroup, Button, Container, Row, Col, Carousel } from 'react-bootstrap';
import TitleMain from './TitleMain';
import './DonationDetails.css';
import BackButton from './BackButton';

function DonationDetails() {
  let { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState(null);
  //get the user needed information

  useEffect(() => {
    fetch(`http://localhost:5000/donations/${id}`)
      .then((res) => res.json())
      .then((data) => setDonation(data))
      .catch((error) => {
        console.error('Error fetching donation:', error);
        setError(error);
      });
  }, [id]);

  if (error) {
    return <p>حدث خطأ أثناء تحميل بيانات التبرع: {error.message}</p>;
  }

  if (!donation) {
    return <p>جاري تحميل بيانات التبرع...</p>;
  }

  return (
    <>
     <BackButton />
     <Container className='container-needed'>
           <TitleMain text1='التبرع' text2='تفاصيل' />
      <Row className="justify-content-center container-Details-donor col-10">
        <Col md={8}>
          <Card>
            <Card.Header
              style={{
                backgroundImage: `url(${donation.headerImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '150px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Card.Title>{donation.type}</Card.Title>
            </Card.Header>
            <Card.Body style={{ direction: 'rtl' }}>
              <Card.Text>{donation.description}</Card.Text>
              <Card.Text>تم النشر بواسطة: {donation.publisher}</Card.Text>
              {donation.imageUrls && (
                <Carousel className="carousel">
                  {donation.imageUrls.map((url, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={url}
                        alt={`slide ${index}`}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              )}
            </Card.Body>
            <ListGroup className="list-group-flush">
              <ListGroup.Item>تاريخ الإضافة: {donation.date}</ListGroup.Item>
            </ListGroup>
            <Card.Footer className="text-center">
              <Button variant="primary" className="mx-2">تبرع الآن</Button>
              <Button variant="secondary" className="mx-2">حفظ للتبرع لاحقًا</Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
    
  );
}

export default DonationDetails;


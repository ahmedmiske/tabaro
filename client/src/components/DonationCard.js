import React from 'react';
import { Card, ListGroup, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './DonationCard.css';

const DonationCard = ({ donation }) => {
  return (
    <Col className="donation-card">
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
            justifyContent: 'center'
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
        <Card.Footer className="d-flex justify-content-between">
          <Link to={`/donation-details/${donation.id}`} >
          <button className="btn-donate">تبرع الآن</button>
          </Link>
          <Link to={`/donation-details/${donation.id}`}>
            <button className="btn-details">تفاصيل</button>
          </Link>
        </Card.Footer>
      </Card>
    </Col>
  );
};

export default DonationCard;

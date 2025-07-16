import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './DonationCard.css';

const DonationCard = ({ donation }) => {
  return (
    <div className="donation-card">
      <Card className="h-100 shadow-sm border-0 donation-card-box">
        {/* رأس البطاقة مع نوع الدم + شارة المستعجل */}
        <Card.Header
          className="text-white position-relative"
          style={{
            backgroundImage: `url(${donation.headerImageUrl || '/images/blood-request-fundo.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.4rem'
          }}
        >
          {donation.bloodType || 'نوع غير معروف'}

          {/* شارة المستعجل */}
          {donation.isUrgent && (
            <span className="urgent-badge position-absolute top-0 end-0 m-2">
              <i className="fas fa-exclamation-triangle me-1"></i> مستعجل
            </span>
          )}
        </Card.Header>

        {/* محتوى البطاقة */}
        <Card.Body style={{ direction: 'rtl', padding: '15px' }}>
          <Card.Text className="fw-bold">
            {donation.description || 'لا يوجد وصف للحالة.'}
          </Card.Text>
          <Card.Text>
            <i className="fas fa-calendar-day text-danger me-2"></i>
            <strong>آخر أجل:</strong> {donation.deadline ? new Date(donation.deadline).toLocaleDateString() : 'غير متوفر'}
          </Card.Text>
          <Card.Text>
            <i className="fas fa-map-marker-alt text-primary me-2"></i>
            <strong>الموقع:</strong> {donation.location || 'غير متوفر'}
          </Card.Text>
        </Card.Body>

        {/* تاريخ الإضافة */}
        <ListGroup className="list-group-flush">
          <ListGroup.Item className="text-muted" style={{ direction: 'rtl' }}>
            <i className="fas fa-clock me-2"></i>
            <strong>تاريخ الإضافة:</strong> {donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'غير متوفر'}
          </ListGroup.Item>
        </ListGroup>

        {/* الأزرار */}
        <Card.Footer className="d-flex justify-content-between">
          <Link to={`/blood-donation-details/${donation._id}`}>
            <button className="btn-details">
              <i className="fas fa-eye me-1"></i> تفاصيل
            </button>
          </Link>
          <Link to={`/bloodDonation-details/${donation._id}`}>
            <button className="btn-donate">
              <i className="fas fa-hand-holding-heart me-1"></i> ساهم بإنقاذ حياة
            </button>
          </Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default DonationCard;

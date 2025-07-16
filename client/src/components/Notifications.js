import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Notifications.css';

function Notifications() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { body, ok } = await fetchWithInterceptors('/api/donation-confirmations/mine');
        if (ok) setOffers(body);
      } catch (error) {
        console.error('فشل في جلب إشعارات التبرع:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <Spinner animation="border" className="d-block mx-auto mt-4" />;
  }

  return (
    <div className="notifications-container">
      <h2 className="title-liste-notification mb-4"><i className="fas fa-bell me-2"></i>إشعارات التبرع المستلمة</h2>
      {offers.length === 0 ? (
        <p className="text-muted">لا توجد عروض تبرع بعد.</p>
      ) : (
        <Row xs={1} md={2} className="row-notifications g-4">
          {offers.map((offer, idx) => (
            <Col key={idx}>
              <Card className="notification-card shadow-sm border-0">
                
                <Card.Body >
                  <div className="d-flex  flex-column mb-2">
                    <div className='notificacion-title'>
                      <strong>💌 عرض تبرع من:</strong>{''}
                      <div>
                          <span className="donor-name">{offer.donor?.firstName} {offer.donor?.lastName}</span>
                      </div> 
                    </div>
                    <div className='notification-status'>
                      <span className={`status-badge status-${offer.status}`}>
                      {offer.status === 'initiated' && '⏳ قيد الانتظار'}
                      {offer.status === 'accepted' && '✅ تم القبول'}
                      {offer.status === 'fulfilled' && '🎉 تم التبرع'}
                      {offer.status === 'rated' && '⭐ تم التقييم'}
                    </span>
                    </div>
                 
                  </div>

                  <div className="mb-2"><i className="far fa-comment-dots me-2 text-muted"></i>الرسالة: {offer.message}</div>
                  <div className="mb-2"><i className="far fa-calendar-alt me-2 text-muted"></i>التاريخ: {new Date(offer.proposedTime).toLocaleDateString()}</div>
                  <Button
                    size="sm"
                    variant="outline-success"
                    href={`/blood-donation-details/${offer.requestId}`}
                    className="mt-2"
                  >
                    <i className="fas fa-eye me-1"></i>عرض تفاصيل الطلب
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default Notifications;
// This component fetches and displays donation offers sent to the user.
// It shows the donor's name, message, proposed time, and status of each offer.
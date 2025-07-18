import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { body, ok } = await fetchWithInterceptors('/api/notifications');
        if (ok) setNotifications(body);
      } catch (error) {
        console.error('فشل في جلب الإشعارات:', error.message);
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
      <h2 className="title-liste-notification mb-4">
        <i className="fas fa-bell me-2"></i>جميع الإشعارات
      </h2>
      {notifications.length === 0 ? (
        <p className="text-muted">لا توجد إشعارات بعد.</p>
      ) : (
        <Row xs={1} md={2} className="row-notifications g-4">
          {notifications.map((notification, idx) => (
            <Col key={idx}>
              <Card className={`notification-card shadow-sm border-0 ${notification.read ? '' : 'unread'}`}>
                <Card.Body>
                  <div className="d-flex flex-column mb-2">
                    <div className="notificacion-title">
                      <strong>{notification.title}</strong>
                    </div>
                    <div className="notification-message text-muted">
                      {notification.message}
                    </div>
                  </div>

                  <div className="mb-2">
                    <i className="far fa-calendar-alt me-2 text-muted"></i>
                    {new Date(notification.date).toLocaleDateString()}
                  </div>

                  {notification.referenceId && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      href={`/blood-donation-details/${notification.referenceId}`}
                      className="mt-2"
                    >
                      <i className="fas fa-eye me-1"></i>تفاصيل الطلب
                    </Button>
                  )}
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
// This component displays a list of notifications for the user.
// It fetches notifications from the server and displays them in a card format.
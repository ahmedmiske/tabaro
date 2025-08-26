// src/pages/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Row, Col, Image, Badge } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Notifications.css';

const API_BASE = process.env.REACT_APP_API_ORIGIN || process.env.REACT_APP_API_URL || 'http://localhost:5000';
const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { body, ok } = await fetchWithInterceptors('/api/notifications');
      if (ok) setNotifications(body?.data || body || []);
    } catch (error) {
      console.error('فشل في جلب الإشعارات:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
          {notifications.map((n) => {
            const sender = n.sender;
            const when = n.createdAt ? new Date(n.createdAt).toLocaleString('ar-MA') : '';
            const goHref =
              n?.meta?.route ||
              (n.type === 'offer'
                ? `/blood-donation-details/${n.referenceId}`
                : `/donations/${n.referenceId || ''}`);

            return (
              <Col key={n._id}>
                <Card className={`notification-card shadow-sm border-0 ${n.read ? '' : 'unread'}`}>
                  <Card.Body>
                    <div className="d-flex align-items-start gap-3 mb-2">
                      <Image
                        src={resolveAvatar(sender?.profileImage)}
                        onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                        roundedCircle
                        width={44}
                        height={44}
                        alt="sender"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2">
                          <strong>{n.title || 'إشعار'}</strong>
                          <Badge bg={n.type === 'offer' ? 'success' : n.type === 'message' ? 'primary' : 'secondary'}>
                            {n.type || 'system'}
                          </Badge>
                        </div>
                        <div className="text-muted small">
                          {sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : 'النظام'}
                        </div>
                      </div>
                    </div>

                    <div className="notification-message text-muted">{n.message}</div>

                    <div className="mt-2 small text-secondary">
                      <i className="far fa-calendar-alt me-2"></i>
                      {when}
                    </div>

                    {n.referenceId && (
                      <Button size="sm" variant="outline-primary" href={goHref} className="mt-3">
                        <i className="fas fa-eye me-1"></i>تفاصيل
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}

export default Notifications;

// src/pages/NotificationsPage.jsx
import React, { useEffect, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { ListGroup, Dropdown, Button, Image, Badge } from 'react-bootstrap';
import './NotificationsPage.css';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_ORIGIN || process.env.REACT_APP_API_URL || 'http://localhost:5000';
const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const res = await fetchWithInterceptors('/api/notifications');
    if (res.ok) setNotifications(res.body?.data || res.body || []);
  };

  const markAsRead = async (id) => {
    await fetchWithInterceptors(`/api/notifications/${id}/read`, { method: 'PATCH' });
  };

  const handleClick = async (id, read) => {
    setExpandedId(expandedId === id ? null : id);
    if (!read) {
      await markAsRead(id);
      fetchNotifications();
    }
  };

  const formatDateTime = (s) =>
    s
      ? new Date(s).toLocaleString('ar-MA', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, []);

  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => (n.type || 'system') === filter);

  return (
    <div className="container-notifications">
      <h3 className="text-center mb-4 fw-bold text-secondary">🔔 جميع الإشعارات</h3>

      <div className="filter-notifications d-flex justify-content-end mb-3">
        <Dropdown className="filter-notifications-dropdown">
          <Dropdown.Toggle className="dropdown" variant="outline-secondary" id="filter-dropdown">
            {filter === 'all' ? 'تصفية: الكل' : `تصفية: ${filter}`}
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu">
            <Dropdown.Item onClick={() => setFilter('all')}>الكل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('message')}>رسائل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('offer')}>عروض</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('system')}>نظام</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <ListGroup className="notification-list">
        {filtered.map((n) => {
          const sender = n.sender;
          const when = formatDateTime(n.createdAt);
          const route =
            n?.meta?.route ||
            (n.type === 'offer'
              ? `/blood-donation-details/${n.referenceId}`
              : `/donations/${n.referenceId || ''}`);

          return (
            <ListGroup.Item
              key={n._id}
              onClick={() => handleClick(n._id, n.read)}
              className={`notification-item shadow-sm p-3 mb-3 rounded ${!n.read ? 'unread' : ''}`}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex align-items-start gap-3">
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
                    <div className={`fw-bold notification-title ${n.type || 'system'}`}>
                      {n.type === 'message' && '💬 '}
                      {n.type === 'offer' && '🩸 '}
                      {n.type === 'system' && '⚙️ '}
                      {n.title || 'إشعار'}
                    </div>
                    <Badge bg={n.type === 'offer' ? 'success' : n.type === 'message' ? 'primary' : 'secondary'}>
                      {n.type || 'system'}
                    </Badge>
                  </div>

                  <div className={expandedId === n._id ? 'message-full mt-2' : 'message-truncated'}>
                    {sender && (
                      <div className="text-muted sender small mb-2">
                        <strong>👤 من طرف:</strong> {sender.firstName} {sender.lastName}
                      </div>
                    )}
                    <div className="msg">{n.message}</div>

                    {sender?._id && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-3 me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/chat/${sender._id}`);
                        }}
                      >
                        💬 فتح المحادثة
                      </Button>
                    )}

                    {n.referenceId && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="btn-details mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(route);
                        }}
                      >
                        👁️ تفاصيل
                      </Button>
                    )}
                  </div>

                  <div className="text-success small mt-2">{when}</div>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default NotificationsPage;

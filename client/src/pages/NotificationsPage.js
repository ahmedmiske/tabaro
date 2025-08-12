import React, { useEffect, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { ListGroup, Dropdown, Button } from 'react-bootstrap';
import './NotificationsPage.css';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchNotifications = async () => {
    const res = await fetchWithInterceptors('/api/notifications');
    if (res.ok) setNotifications(res.body);
  };

  const markAsRead = async (id) => {
    await fetchWithInterceptors(`/api/notifications/${id}/read`, { method: 'PATCH' });
    fetchNotifications();
  };

  const handleClick = async (id, read) => {
    setExpandedId(expandedId === id ? null : id);
    if (!read) await markAsRead(id);
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div className="container-notifications">
      <h3 className="text-center mb-4 fw-bold text-secondary">🔔 جميع الإشعارات</h3>

      <div className="filter-notifications d-flex justify-content-end mb-3">
        <Dropdown className="filter-notifications-dropdown">
          <Dropdown.Toggle className='dropdown' variant="outline-secondary" id="filter-dropdown">
            {filter === 'all' ? 'تصفية: الكل' : `تصفية: ${filter}`}
          </Dropdown.Toggle>
          <Dropdown.Menu className='dropdown-menu'>
            <Dropdown.Item onClick={() => setFilter('all')}>الكل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('message')}>رسائل</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('offer')}>عروض</Dropdown.Item>
            <Dropdown.Item onClick={() => setFilter('system')}>نظام</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <ListGroup className='notification-list'>
        {filtered.map(n => (
          <ListGroup.Item
            key={n._id}
            onClick={() => handleClick(n._id, n.read)}
            className={`notification-item shadow-sm p-3 mb-3 rounded ${!n.read ? 'unread' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className={`fw-bold notification-title ${n.type}`}>
              {n.type === 'message' && '💬 '}
              {n.type === 'offer' && '🩸 '}
              {n.type === 'system' && '⚙️ '}
              {n.title}
            </div>

            <div className={expandedId === n._id ? 'message-full mt-2' : 'message-truncated'}>
              {n.sender && (
                <div className="text-muted sender small mb-2">
                  <strong>👤من طرف: </strong>
                   {n.sender.firstName} {n.sender.lastName}
                </div>
              )}
              <div className='msg'>{n.message}</div>
        
              {/* زر فتح المحادثة */}
              {n.sender?._id && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-3 me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chat/${n.sender._id}`);
                  }}
                >
                  💬 فتح المحادثة
                </Button>
              )}

              {/* زر تفاصيل الطلب إذا كان type = offer */}
              {n.type === 'offer' && n.referenceId && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="btn-details mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/blood-donation-details/${n.referenceId}`);
                  }}
                >
                  👁️ تفاصيل الطلب
                </Button>
              )}
            </div>

            <div className="text-success small mt-2">{formatDateTime(n.date)}</div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default NotificationsPage;

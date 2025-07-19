import React, { useEffect, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { ListGroup, Dropdown } from 'react-bootstrap';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

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
  }, []);

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  return (
    <div className="container container-notifications mt-4">
      <h3 className="text-center mb-4 fw-bold text-secondary">🔔 جميع الإشعارات</h3>

     <div className="d-flex justify-content-end mb-3">
  <Dropdown>
    <Dropdown.Toggle variant="outline-secondary" id="filter-dropdown">
      {filter === 'all' ? 'تصفية: الكل' : `تصفية: ${filter}`}
    </Dropdown.Toggle>
    <Dropdown.Menu>
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

            <div className={expandedId === n._id ? 'message-full' : 'message-truncated'}>
              {n.message}
            </div>

            <div className="text-success small mt-2">{formatDateTime(n.date)}</div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default NotificationsPage;

import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors'; // Ensure this is correctly imported

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { body, ok, status } = await fetchWithInterceptors('/api/users/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!ok) {
        console.error('Fetching notifications failed, status:', status);
        setError(`Failed to fetch notifications: ${status}`);
        return;
      }

      setNotifications(body.notifications); // Assuming 'body.notifications' contains the notifications array
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
      setError('Error fetching notifications. Please try again later.');
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Message</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{notification.title}</td>
              <td>{notification.message}</td>
              <td>{new Date(notification.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default Notifications;

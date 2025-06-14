import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors'; // Ensure this is correctly imported
import socket from '../socket'; // Import the socket instance

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();

    // Listen for real-time notifications
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on('notification', handleNotification);

    // Cleanup on unmount
    return () => {
      socket.off('notification', handleNotification);
    };
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
      {/* add button to call /api/users/notifications_test api to test real time notification */}
      <button
        onClick={async () => {
          try {
            const response = await fetchWithInterceptors('/api/users/notifications_test');
            if (!response.ok) {
              throw new Error('Failed to send test notification');
            }
            console.log('Test notification sent successfully');
          } catch (error) {
            console.error('Error sending test notification:', error.message);
          }
        }}
      >Test Notification
      </button>
    </>
  );
}

export default Notifications;

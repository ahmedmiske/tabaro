import React, { useState, useEffect, useRef } from 'react';
import { Overlay, Popover, Badge } from 'react-bootstrap';
import { FaBell } from 'react-icons/fa';
import './Notifications.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    fetchWithInterceptors('/notifications')
      .then(response => response.json())
      .then(data => setNotifications(data))
      .catch(error => console.error('Error fetching notifications:', error));
  }, []);

  const handleClick = (e) => {
    setShow(!show);
    setTarget(e.target);
  };

  return (
    <div ref={ref} className='notifications'>
      <FaBell className="notification-icon" onClick={handleClick} />
      <div>
      <Badge pill bg="danger" className="notification-count">{notifications.length}</Badge>
      </div>
 
      <Overlay
        show={show}
        target={target}
        placement="bottom"
        container={ref}
        containerPadding={20}
      >
        <Popover id="popover-contained" className='popover'>
          <Popover.Header as="h3">الإشعارات</Popover.Header>
          <Popover.Body>
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div key={index} className="notification-item">
                <h6> {notif.title}</h6>
                 <p>{notif.message}</p> 
                </div>
              ))
            ) : (
              <div>لا توجد إشعارات</div>
            )}
          </Popover.Body>
        </Popover>
      </Overlay>
      
    </div>
  );
};

export default Notifications;

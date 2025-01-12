import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import UserDetails from '../components/UserDetails';
import AccountDetails from '../components/AccountDetails';
import Notifications from '../components/Notifications';
import './UserProfile.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function UserProfile() {
  const [view, setView] = useState('personal');
  const [userType, setUserType] = useState('individual'); // 
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // 
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetchWithInterceptors('/api/users/profile', { // 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        console.log('Fetching user data failed, token is :',token);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setUserDetails(data);
      setUserType(data.userType || 'individual'); //  
    } catch (error) {
      console.error('Error fetching user data:', error.message);

    }
  };
  

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <Container>
      <Row>
        <Col className='filter'>
          <Button onClick={() => handleViewChange('personal')}>معلومات شخصية</Button>
          <Button onClick={() => handleViewChange('account')}>معلومات الحساب</Button>
          <Button onClick={() => handleViewChange('notifications')}>الإشعارات</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          {view === 'personal' && <UserDetails userDetails={userDetails} />}
          {view === 'account' && <AccountDetails userDetails={userDetails} />}
          {view === 'notifications' && <Notifications />}
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;

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
      const { body, ok, status } = await fetchWithInterceptors('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Check if the fetch was successful
      if (!ok) {
        console.log('Fetching user data failed, status:', status);
        throw new Error(`HTTP error! Status: ${status}`);
      }
  
      // Assuming 'body' contains the actual user data returned from the API
      setUserDetails(body);
      setUserType(body.userType || 'individual'); // Adjust according to your user type handling logic
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

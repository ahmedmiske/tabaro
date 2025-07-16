import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Container } from 'react-bootstrap';
import UserDetails from '../components/UserDetails';
import AccountDetails from '../components/AccountDetails';
import Notifications from '../components/Notifications';
import DonationOffers from '../components/DonationOffers';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserProfile.css';

function UserProfile() {
  const [view, setView] = useState('personal');
  const [userType, setUserType] = useState('individual');
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { body, ok } = await fetchWithInterceptors('/api/users/profile');
      if (!ok) throw new Error('فشل في جلب بيانات المستخدم');
      setUserDetails(body);
      setUserType(body.userType || 'individual');
    } catch (err) {
      console.error('Error fetching user data:', err.message);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
  <Container className="user-profile-container mt-4">
  <Row className="user-profile-layout">
    {/* ✅ القائمة الجانبية على اليمين */}
     <Col md={3} className="sidebar order-md-1"> 
      <div className="menu d-grid gap-2">
      <Button
  className={`menu-button ${view === 'personal' ? 'active' : ''}`}
  onClick={() => handleViewChange('personal')}
>
  معلومات شخصية
</Button>

<Button
  className={`menu-button ${view === 'account' ? 'active' : ''}`}
  onClick={() => handleViewChange('account')}
>
  معلومات الحساب
</Button>

<Button
  className={`menu-button ${view === 'notifications' ? 'active' : ''}`}
  onClick={() => handleViewChange('notifications')}
>
  الإشعارات
</Button>
      </div>
    </Col>

    {/* ✅ محتوى الصفحة على اليسار */}
    <Col md={8} className="main-content order-md-2">
      {view === 'personal' && <UserDetails userDetails={userDetails} setUserDetails={setUserDetails} />}
      {view === 'account' && <AccountDetails userDetails={userDetails} />}
      {view === 'notifications' && <Notifications />}
      <div className='donation-offers'>
           <DonationOffers />
      </div>
    
    </Col>
  </Row>
</Container>

  );
}

export default UserProfile;
// This component serves as the user profile page, allowing users to view and edit their personal information, account details, and notifications.
// It uses a sidebar for navigation and fetches user data from the server to display relevant information
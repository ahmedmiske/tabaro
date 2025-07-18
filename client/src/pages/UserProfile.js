import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Container, Badge } from 'react-bootstrap';
import UserDetails from '../components/UserDetails';
import AccountDetails from '../components/AccountDetails';
import Notifications from '../components/Notifications';
import DonationOffers from '../components/DonationOffers';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import MyDonationOffers from '../components/MyDonationOffers';
import './UserProfile.css';

function UserProfile() {
  const [view, setView] = useState('personal');
  const [userType, setUserType] = useState('individual');
  const [userDetails, setUserDetails] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUserData();
    fetchUnreadNotifications();
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

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetchWithInterceptors('/api/notifications/unread-count');
      if (res.ok) setUnreadCount(res.body.count || 0);
    } catch (err) {
      console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', err.message);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    if (newView === 'notifications') setUnreadCount(0); // تصفير العداد عند الدخول لعرضها
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
              className={`menu-button ${view === 'offers' ? 'active' : ''}`}
              onClick={() => handleViewChange('offers')}
            >
            عروضي للتبرع
           </Button>


            <Button
              className={`menu-button ${view === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
            >
              الإشعارات{' '}
              {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
            </Button>
          </div>
        </Col>

        {/* ✅ محتوى الصفحة على اليسار */}
        <Col md={8} className="main-content order-md-2">
          {view === 'personal' && (
            <UserDetails userDetails={userDetails} setUserDetails={setUserDetails} />
          )}
          {view === 'account' && <AccountDetails userDetails={userDetails} />}
          {view === 'offers' && <MyDonationOffers />}
          {view === 'notifications' && <Notifications />}

       

        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;
// This component represents the user profile page.
// It allows users to view and edit their personal information, account details, and notifications.
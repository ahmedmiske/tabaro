import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Container, Badge } from 'react-bootstrap';
import UserDetails from '../components/UserDetails';
import AccountDetails from '../components/AccountDetails';
import NotificationsPage from './NotificationsPage';
import MyDonationOffers from '../components/MyDonationOffers';
import MyRequestsWithOffers from '../components/MyRequestsWithOffers';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserProfile.css';

function UserProfile() {
  const [view, setView] = useState('personal');
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
    if (newView === 'notifications') setUnreadCount(0);
  };

  return (
    <Container className="user-profile-container mt-4">
      <Row className="user-profile-layout">
        <Col md={3} className="sidebar order-md-1">
          <div className=" mb-4">
            <h4>الملف الشخصي</h4>
            {userDetails && (
              <div className="user-profile-imag">
                <img
                  src={userDetails.profileImage ? `/uploads/profileImages/${userDetails.profileImage}` : '/default-avatar.png'}
                  alt="الصورة الشخصية"
                  className="user-avatar rounded-circle"
                />
                <div className="mt-2 fw-bold">
                  {userDetails.firstName} {userDetails.lastName}
                </div>
              </div>
            )}
          </div>

          <div className="menu d-grid gap-2">
            <Button className={`menu-button ${view === 'personal' ? 'active' : ''}`} onClick={() => handleViewChange('personal')}>
              معلومات شخصية
            </Button>
            <Button className={`menu-button ${view === 'account' ? 'active' : ''}`} onClick={() => handleViewChange('account')}>
              معلومات الحساب
            </Button>
            <Button className={`menu-button ${view === 'offers' ? 'active' : ''}`} onClick={() => handleViewChange('offers')}>
              عروضي للتبرع
            </Button>
            <Button className={`menu-button ${view === 'myrequests' ? 'active' : ''}`} onClick={() => handleViewChange('myrequests')}>
              طلباتي مع العروض
            </Button>
            <Button className={`menu-button ${view === 'notifications' ? 'active' : ''}`} onClick={() => handleViewChange('notifications')}>
              الإشعارات {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
            </Button>
          </div>
        </Col>

        <Col md={9} className="main-content order-md-2">
          {view === 'personal' && <UserDetails userDetails={userDetails} setUserDetails={setUserDetails} />}
          {view === 'account' && <AccountDetails userDetails={userDetails} />}
          {view === 'offers' && <MyDonationOffers />}
          {view === 'myrequests' && <MyRequestsWithOffers />}
          {view === 'notifications' && <NotificationsPage />}
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;

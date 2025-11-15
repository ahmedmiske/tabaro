// src/pages/UserProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Row, Col, Container, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

import UserDetails from '../components/UserDetails';
import AccountDetails from '../components/AccountDetails';
import NotificationsPage from './NotificationsPage';

import MyDonationOffersBlood from '../components/MyDonationOffersBlood';
import MyDonationOffersGeneral from '../components/MyDonationOffersGeneral';

import MyRequestsWithOffersBlood from '../components/MyRequestsWithOffersBlood';
import MyRequestsWithOffersGeneral from '../components/MyRequestsWithOffersGeneral';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserProfile.css';

function UserProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ استرجاع التبويب من الرابط ?tab=
  const initialTab = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return q.get('tab') || 'offers-blood';
  }, [location.search]);

  const [view, setView] = useState(initialTab);
  const [userDetails, setUserDetails] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ إظهار القائمة الفرعية لعروضي مفتوحة افتراضيًا
  const [expandOffers, setExpandOffers] = useState(true);
  const [expandRequests, setExpandRequests] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchUnreadNotifications();
  }, []);

  // ✅ كلما تغيّر الرابط (العودة من التفاصيل)، حدّث التبويب من ?tab=
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const tab = q.get('tab');
    if (tab && tab !== view) setView(tab);
    // خزّن آخر مسار لصفحة اللائحة للرجوع منه
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const pushTabToUrl = (tab, replace = true) => {
    const q = new URLSearchParams(location.search);
    q.set('tab', tab);
    navigate({ pathname: location.pathname, search: q.toString() }, { replace });
  };

  const handleViewChange = (newView) => {
    setView(newView);
    pushTabToUrl(newView);
    if (newView === 'notifications') setUnreadCount(0);
    // افتح/أغلق القوائم بحسب الاختيار
    if (newView.startsWith('offers-')) {
      setExpandOffers(true);
      setExpandRequests(false);
    } else if (newView.startsWith('req-')) {
      setExpandRequests(true);
      setExpandOffers(false);
    }
  };

  const isOffersActive = view === 'offers-blood' || view === 'offers-general';
  const isRequestsActive = view === 'req-blood' || view === 'req-general';

  // ✅ دالة قياسية لفتح صفحة التفاصيل مع تمرير مسار العودة
  const openDetails = (requestId) => {
    // (اختياري) حفظ موضع التمرير
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search; // /profile?tab=offers-general مثلا
    navigate(`/donations/${requestId}`, { state: { from } });
  };

  return (
    <Container className="user-profile-container mt-4">
      <Row className="user-profile-layout">
        <Col md={3} className="sidebar order-md-1">
          <div className="mb-4">
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

            {/* عروضي للتبرع */}
            <Button
              className={`menu-button ${isOffersActive ? 'active' : ''}`}
              onClick={() => setExpandOffers(v => !v)}
            >
              عروضي للتبرع {expandOffers ? '▴' : '▾'}
            </Button>
            {expandOffers && (
              <div className="submenu">
                <Button
                  variant="light"
                  className={`submenu-button ${view === 'offers-blood' ? 'active' : ''}`}
                  onClick={() => handleViewChange('offers-blood')}
                >
                  تبرع بالدم
                </Button>
                <Button
                  variant="light"
                  className={`submenu-button ${view === 'offers-general' ? 'active' : ''}`}
                  onClick={() => handleViewChange('offers-general')}
                >
                  تبرع عام
                </Button>
              </div>
            )}

            {/* طلباتي مع العروض */}
            <Button
              className={`menu-button ${isRequestsActive ? 'active' : ''}`}
              onClick={() => setExpandRequests(v => !v)}
            >
              طلباتي مع العروض {expandRequests ? '▴' : '▾'}
            </Button>
            {expandRequests && (
              <div className="submenu">
                <Button
                  variant="light"
                  className={`submenu-button ${view === 'req-blood' ? 'active' : ''}`}
                  onClick={() => handleViewChange('req-blood')}
                >
                  تبرع بالدم
                </Button>
                <Button
                  variant="light"
                  className={`submenu-button ${view === 'req-general' ? 'active' : ''}`}
                  onClick={() => handleViewChange('req-general')}
                >
                  تبرع عام
                </Button>
              </div>
            )}

            <Button
              className={`menu-button ${view === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
            >
              الإشعارات {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
            </Button>
          </div>
        </Col>

        <Col md={9} className="main-content order-md-2">
          {view === 'personal' && (
            <UserDetails userDetails={userDetails} setUserDetails={setUserDetails} />
          )}
          {view === 'account' && <AccountDetails userDetails={userDetails} />}

          {/* عروضي — نمرر openDetails ليستعملها المكوّن للذهاب للتفاصيل مع from */}
          {view === 'offers-blood' && <MyDonationOffersBlood onOpenDetails={openDetails} />}
          {view === 'offers-general' && <MyDonationOffersGeneral onOpenDetails={openDetails} />}

          {/* طلباتي مع العروض */}
          {view === 'req-blood' && <MyRequestsWithOffersBlood onOpenDetails={openDetails} />}
          {view === 'req-general' && <MyRequestsWithOffersGeneral onOpenDetails={openDetails} />}

          {view === 'notifications' && <NotificationsPage onOpenDetails={openDetails} />}
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;

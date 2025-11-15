// src/pages/UserProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import UserDetails from '../components/UserDetails.jsx';
import AccountDetails from '../components/AccountDetails.jsx';
import NotificationsPage from './NotificationsPage.jsx';

import MyDonationOffersBlood from '../components/MyDonationOffersBlood.jsx';
import MyDonationOffersGeneral from '../components/MyDonationOffersGeneral.jsx';

import MyRequestsWithOffersBlood from '../components/MyRequestsWithOffersBlood.jsx';
import MyRequestsWithOffersGeneral from '../components/MyRequestsWithOffersGeneral.jsx';

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
    <div className="user-profile-container">
      <div className="user-profile-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            <h4>الملف الشخصي</h4>
            {userDetails && (
              <div className="user-profile-imag">
                <img
                  src={userDetails.profileImage ? `/uploads/profileImages/${userDetails.profileImage}` : '/default-avatar.png'}
                  alt="الصورة الشخصية"
                  className="user-avatar"
                />
                <div className="user-name">
                  {userDetails.firstName} {userDetails.lastName}
                </div>
              </div>
            )}
          </div>

          <div className="menu">
            <button
              className={`menu-button ${view === 'personal' ? 'active' : ''}`}
              onClick={() => handleViewChange('personal')}
            >
              معلومات شخصية
            </button>

            <button
              className={`menu-button ${view === 'account' ? 'active' : ''}`}
              onClick={() => handleViewChange('account')}
            >
              معلومات الحساب
            </button>

            {/* عروضي للتبرع */}
            <button
              className={`menu-button ${isOffersActive ? 'active' : ''}`}
              onClick={() => setExpandOffers(v => !v)}
            >
              عروضي للتبرع {expandOffers ? '▴' : '▾'}
            </button>
            {expandOffers && (
              <div className="submenu">
                <button
                  className={`submenu-button ${view === 'offers-blood' ? 'active' : ''}`}
                  onClick={() => handleViewChange('offers-blood')}
                >
                  تبرع بالدم
                </button>
                <button
                  className={`submenu-button ${view === 'offers-general' ? 'active' : ''}`}
                  onClick={() => handleViewChange('offers-general')}
                >
                  تبرع عام
                </button>
              </div>
            )}

            {/* طلباتي مع العروض */}
            <button
              className={`menu-button ${isRequestsActive ? 'active' : ''}`}
              onClick={() => setExpandRequests(v => !v)}
            >
              طلباتي مع العروض {expandRequests ? '▴' : '▾'}
            </button>
            {expandRequests && (
              <div className="submenu">
                <button
                  className={`submenu-button ${view === 'req-blood' ? 'active' : ''}`}
                  onClick={() => handleViewChange('req-blood')}
                >
                  تبرع بالدم
                </button>
                <button
                  className={`submenu-button ${view === 'req-general' ? 'active' : ''}`}
                  onClick={() => handleViewChange('req-general')}
                >
                  تبرع عام
                </button>
              </div>
            )}

            <button
              className={`menu-button ${view === 'notifications' ? 'active' : ''}`}
              onClick={() => handleViewChange('notifications')}
            >
              الإشعارات {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          </div>
        </div>

        <div className="main-content">
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
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

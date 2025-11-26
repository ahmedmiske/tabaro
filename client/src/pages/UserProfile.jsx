// src/pages/UserProfile.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

import UserDetails from '../components/UserDetails.jsx';
import AccountDetails from '../components/AccountDetails.jsx';
import NotificationsPage from './NotificationsPage.jsx';

import MyDonationOffersBlood from '../components/MyDonationOffersBlood.jsx';
import MyDonationOffersGeneral from '../components/MyDonationOffersGeneral.jsx';

import MyRequestsWithOffersBlood from '../components/MyRequestsWithOffersBlood.jsx';
import MyRequestsWithOffersGeneral from '../components/MyRequestsWithOffersGeneral.jsx';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './UserProfile.css';

import Drawer from '../components/Drawer.jsx'; // Importing Drawer for mobile functionality


function UserProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useParams(); // لو موجود → زيارة مستخدم آخر

  // 👈 true إذا كانت صفحة مستخدم آخر (زائر)
  const isVisitorProfile = Boolean(userId);

  // ✅ استرجاع التبويب من الرابط ?tab=
  const initialTab = useMemo(() => {
    const q = new URLSearchParams(location.search);
    const fromUrl = q.get('tab');

    // لو زائر نجبر التبويب على personal فقط
    if (isVisitorProfile) return 'personal';

    return fromUrl || 'offers-blood';
  }, [location.search, isVisitorProfile]);

  const [view, setView] = useState(initialTab);
  const [userDetails, setUserDetails] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ إظهار قائمة العروض مفتوحة افتراضيًا لصاحب الحساب فقط
  const [expandOffers, setExpandOffers] = useState(!isVisitorProfile);
  const [expandRequests, setExpandRequests] = useState(false);

  // 🔢 حساب ملخص التقييم من ratingAsDonor + ratingAsRecipient
  const getRatingSummary = (user) => {
    if (!user) {
      return {
        avgRating: 0,
        totalRatings: 0,
        donor: { avg: 0, count: 0 },
        recipient: { avg: 0, count: 0 },
      };
    }

    const donor = user.ratingAsDonor || { avg: 0, count: 0 };
    const recipient = user.ratingAsRecipient || { avg: 0, count: 0 };

    const totalCount = (donor.count || 0) + (recipient.count || 0);
    let avgRating = 0;

    if (totalCount > 0) {
      avgRating =
        ((donor.avg || 0) * (donor.count || 0) +
          (recipient.avg || 0) * (recipient.count || 0)) /
        totalCount;
    }

    return {
      avgRating,
      totalRatings: totalCount,
      donor,
      recipient,
    };
  };

  // ⭐ دالة رسم النجوم
  const renderStars = (avg = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      if (avg >= i) {
        stars.push(<FaStar key={i} className="star full" />);
      } else if (avg >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const ratingSummary = useMemo(
    () => getRatingSummary(userDetails),
    [userDetails]
  );

  useEffect(() => {
    fetchUserData();
    if (!isVisitorProfile) {
      fetchUnreadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isVisitorProfile]);

  // ✅ تحديث التبويب عند تغيير الـ URL + حفظ مسار العودة
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const tab = q.get('tab');

    if (isVisitorProfile) {
      // الزائر دائمًا على personal
      if (view !== 'personal') setView('personal');
    } else if (tab && tab !== view) {
      setView(tab);
    }

    sessionStorage.setItem('lastListPath', location.pathname + location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, isVisitorProfile]);

  const fetchUserData = async () => {
    try {
      let url;
      if (isVisitorProfile) {
        // بروفايل عام لمستخدم آخر
        url = `/api/users/${userId}/public-profile`;
      } else {
        // بروفايلي أنا
        url = '/api/users/profile';
      }

      const { body, ok } = await fetchWithInterceptors(url);
      if (!ok) throw new Error('فشل في جلب بيانات المستخدم');
      setUserDetails(body);
    } catch (err) {
      console.error('Error fetching user data:', err.message);
    }
  };

  const fetchUnreadNotifications = async () => {
    if (isVisitorProfile) return; // لا إشعارات للزائر
    try {
      const res = await fetchWithInterceptors('/api/notifications/unread-count');
      if (res.ok) setUnreadCount(res.body.count || 0);
    } catch (err) {
      console.error('خطأ في جلب عدد الإشعارات غير المقروءة:', err.message);
    }
  };

  const pushTabToUrl = (tab, replace = true) => {
    if (isVisitorProfile) return; // الزائر لا نغير له ?tab
    const q = new URLSearchParams(location.search);
    q.set('tab', tab);
    navigate({ pathname: location.pathname, search: q.toString() }, { replace });
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleViewChange = (newView) => {
    if (isVisitorProfile && newView !== 'personal') return;
    setView(newView);
    pushTabToUrl(newView);
    // Drawer يظهر عند الضغط على أي زر جانبي في الهاتف/تابلت
    if (isMobile) setDrawerOpen(true);
    if (!isVisitorProfile && newView === 'notifications') {
      setUnreadCount(0);
    }
    if (!isVisitorProfile) {
      if (newView.startsWith('offers-')) {
        setExpandOffers(true);
        setExpandRequests(false);
      } else if (newView.startsWith('req-')) {
        setExpandRequests(true);
        setExpandOffers(false);
      }
    }
  };

  const isOffersActive =
    !isVisitorProfile && (view === 'offers-blood' || view === 'offers-general');
  const isRequestsActive =
    !isVisitorProfile && (view === 'req-blood' || view === 'req-general');

  // ✅ فتح صفحة تفاصيل الطلب مع حفظ مسار العودة
  const openDetails = (requestId) => {
    if (!requestId) return;
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search;
    navigate(`/donations/${requestId}`, { state: { from } });
  };

  return (
    <div className="user-profile-container">
      <div className="user-profile-layout">
        {/* الشريط الجانبي */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h4>{isVisitorProfile ? 'بطاقة تعريف المستخدم ' : 'ملفي الشخصي'}</h4>
            {userDetails && (
              <div className="user-profile-imag">
                <img
                  src={
                    userDetails.profileImage
                      ? `/uploads/profileImages/${userDetails.profileImage}`
                      : '/default-avatar.png'
                  }
                  alt="الصورة الشخصية"
                  className="user-avatar"
                />
                <div className="user-name">
                  {userDetails.firstName} {userDetails.lastName}
                </div>

                {/* التقييم أسفل الصورة */}
                {ratingSummary.totalRatings > 0 && (
                  <div className="user-rating-summary">
                    <div className="user-rating-stars">
                      {renderStars(ratingSummary.avgRating)}
                    </div>
                    <div className="user-rating-text">
                      {ratingSummary.avgRating.toFixed(1)} / 5{' '}
                      <span>({ratingSummary.totalRatings} تقييم)</span>
                    </div>
                    <div className="user-rating-roles">
                      <div>
                        كمتبرِّع: {ratingSummary.donor.avg.toFixed(1)} / 5 (
                        {ratingSummary.donor.count} تقييم)
                      </div>
                      <div>
                        كصاحب طلب: {ratingSummary.recipient.avg.toFixed(1)} / 5 (
                        {ratingSummary.recipient.count} تقييم)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="menu">
            {/* هذا التبويب يظهر للجميع */}
            <button
              className={`menu-button ${view === 'personal' ? 'active' : ''}`}
              onClick={() => handleViewChange('personal')}
            >
              {isVisitorProfile ? 'بيانات  المستخدم' : 'معلوماتي الشخصية '}
            </button>

            {/* باقي التبويبات لصاحب الحساب فقط */}
            {!isVisitorProfile && (
              <>
                <button
                  className={`menu-button ${view === 'account' ? 'active' : ''}`}
                  onClick={() => handleViewChange('account')}
                >
                  معلومات الحساب
                </button>
              </>
            )}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        {!isMobile ? (
          <div className="main-content">
            {view === 'personal' && (
              <UserDetails
                userDetails={userDetails}
                // في وضع الزائر لا نمرر setUserDetails لكي لا يستطيع الحفظ
                setUserDetails={isVisitorProfile ? undefined : setUserDetails}
                isVisitor={isVisitorProfile}
              />
            )}

            {/* باقي التبويبات لصاحب الحساب فقط */}
            {!isVisitorProfile && (
              <>
                {view === 'account' && (
                  <AccountDetails userDetails={userDetails} />
                )}

                {view === 'offers-blood' && (
                  <MyDonationOffersBlood onOpenDetails={openDetails} />
                )}
                {view === 'offers-general' && (
                  <MyDonationOffersGeneral onOpenDetails={openDetails} />
                )}

                {view === 'req-blood' && (
                  <MyRequestsWithOffersBlood onOpenDetails={openDetails} />
                )}
                {view === 'req-general' && (
                  <MyRequestsWithOffersGeneral onOpenDetails={openDetails} />
                )}

                {view === 'notifications' && (
                  <NotificationsPage onOpenDetails={openDetails} />
                )}
              </>
            )}
          </div>
        ) : (
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            {view === 'personal' && (
              <UserDetails
                userDetails={userDetails}
                setUserDetails={isVisitorProfile ? undefined : setUserDetails}
                isVisitor={isVisitorProfile}
              />
            )}
            {!isVisitorProfile && (
              <>
                {view === 'account' && <AccountDetails userDetails={userDetails} />}
                {view === 'offers-blood' && <MyDonationOffersBlood onOpenDetails={openDetails} />}
                {view === 'offers-general' && <MyDonationOffersGeneral onOpenDetails={openDetails} />}
                {view === 'req-blood' && <MyRequestsWithOffersBlood onOpenDetails={openDetails} />}
                {view === 'req-general' && <MyRequestsWithOffersGeneral onOpenDetails={openDetails} />}
                {view === 'notifications' && <NotificationsPage onOpenDetails={openDetails} />}
              </>
            )}
          </Drawer>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ManageQuickCards from '../components/ManageQuickCards.jsx';
import './DashboardPage.css';

export default function DashboardPage({
  userName,
  stats,
  latestBloodRequests,
  latestDonationRequests,
}) {
  const [loadingMine, setLoadingMine] = useState(true);
  const [myBloodRequests, setMyBloodRequests] = useState([]);
  const [myGeneralRequests, setMyGeneralRequests] = useState([]);
  const [myBloodOffers, setMyBloodOffers] = useState([]);
  const [myGeneralOffers, setMyGeneralOffers] = useState([]);

  // -------- Helpers لتطبيع البيانات من الباكند --------
  const normReqBlood = (r) => ({
    id: r._id,
    kind: 'blood',
    title: r.title || r.description || '—',
    isUrgent: !!r.isUrgent,
    bloodType: r.bloodType || '',
    location: r.location || '—',
    place: r.location || '—',
    deadline: r.deadline || null,
    status: r.status || (r.isActive ? 'active' : 'inactive'),
    createdAt: r.createdAt || null,
  });

  const normReqGeneral = (r) => ({
    id: r._id,
    kind: 'general',
    title: r.title || r.description || '—',
    isUrgent: !!r.isUrgent,
    bloodType: null,
    category: r.category || 'طلب',
    location: r.place || r.location || '—',
    place: r.place || r.location || '—',
    deadline: r.deadline || null,
    status: r.status || (r.isActive ? 'active' : 'inactive'),
    createdAt: r.createdAt || null,
  });

  const normOfferBlood = (o) => {
    const req = o.request || o.requestId || {};
    return {
      id: o._id,
      kind: 'blood',
      title: req.title || req.description || '—',
      toWhom:
        (req.user && [req.user.firstName, req.user.lastName].filter(Boolean).join(' ')) ||
        '—',
      status: o.status || 'pending',
      createdAt: o.createdAt || null,
      reqId: req._id || o.requestId?._id || o.requestId,
      bloodType: req.bloodType || '',
      isUrgent: !!req.isUrgent,
    };
  };

  const normOfferGeneral = (o) => {
    const req = o.request || o.requestId || {};
    return {
      id: o._id,
      kind: 'general',
      title: req.title || req.description || '—',
      toWhom:
        (req.user && [req.user.firstName, req.user.lastName].filter(Boolean).join(' ')) ||
        '—',
      status: o.status || 'pending',
      createdAt: o.createdAt || null,
      reqId: req._id || o.requestId?._id || o.requestId,
      category: req.category || 'طلب',
      type: req.type || null,
      isUrgent: !!req.isUrgent,
    };
  };

  // -------- الجلب من الباكند --------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingMine(true);

        const [mineBlood, mineGeneral] = await Promise.all([
          fetchWithInterceptors('/api/blood-requests/mine-with-offers'),
          fetchWithInterceptors('/api/donationRequests/mine-with-offers'),
        ]);

        const bloodReqs = (mineBlood?.ok && Array.isArray(mineBlood.body)
          ? mineBlood.body.map(normReqBlood)
          : []
        ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const generalReqs = (mineGeneral?.ok && Array.isArray(mineGeneral.body)
          ? mineGeneral.body.map(normReqGeneral)
          : []
        ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const [sentBlood, sentGeneral] = await Promise.all([
          fetchWithInterceptors('/api/donation-confirmations/sent'),
          fetchWithInterceptors('/api/donation-request-confirmations/sent'),
        ]);

        const bloodOffers = (sentBlood?.ok && Array.isArray(sentBlood.body)
          ? sentBlood.body.map(normOfferBlood)
          : []
        ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        const generalOffers = (sentGeneral?.ok && Array.isArray(sentGeneral.body)
          ? sentGeneral.body.map(normOfferGeneral)
          : []
        ).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (!isMounted) return;
        setMyBloodRequests(bloodReqs);
        setMyGeneralRequests(generalReqs);
        setMyBloodOffers(bloodOffers);
        setMyGeneralOffers(generalOffers);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
        if (!isMounted) return;
        setMyBloodRequests([]);
        setMyGeneralRequests([]);
        setMyBloodOffers([]);
        setMyGeneralOffers([]);
      } finally {
        if (isMounted) setLoadingMine(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // -------- إحصائيات أعلى الصفحة --------
  const derivedStats = useMemo(() => {
    if (stats) return stats;

    const activeBlood = myBloodRequests.filter(
      (r) => r.status === 'active' || r.status === 'pending',
    ).length;

    const urgentBlood = myBloodRequests.filter((r) => r.isUrgent).length;

    const activeDonations = myGeneralRequests.filter(
      (r) => r.status === 'active' || r.status === 'pending',
    ).length;

    const pendingReviews = [...myBloodOffers, ...myGeneralOffers].filter(
      (o) => o.status === 'fulfilled',
    ).length;

    return { activeBlood, urgentBlood, activeDonations, pendingReviews };
  }, [stats, myBloodRequests, myGeneralRequests, myBloodOffers, myGeneralOffers]);

  const safeStats = derivedStats || {
    activeBlood: 0,
    urgentBlood: 0,
    activeDonations: 0,
    pendingReviews: 0,
  };

  // -------- عدّادات للكروت السريعة --------
  const quickCounts = useMemo(
    () => ({
      blood: myBloodRequests.length + myBloodOffers.length,
      general: myGeneralRequests.length + myGeneralOffers.length,
      community: 0,
    }),
    [
      myBloodRequests.length,
      myBloodOffers.length,
      myGeneralRequests.length,
      myGeneralOffers.length,
    ],
  );

  return (
    <main className="dash-shell" dir="rtl">
      {/* ===== رأس الترحيب + ملخص النشاط ===== */}
      <header className="dash-header">
        {/* ترحيب */}
        <div className="dash-header-left">
          <h1 className="dash-hello">
            أهلاً <span className="dash-hello-name">{userName || 'صديقنا'}</span> 👋
          </h1>
          <p className="dash-sub">
            من هنا يمكنك نشر طلب مساعدة، طلب تبرع بالدم، عرض مساعدتك للآخرين،
            ومتابعة ما يحدث في المجتمع ❤️
          </p>
          <Link to="/profile" className="dash-profile-link">
            الانتقال إلى صفحتي الشخصية
          </Link>
        </div>

        {/* ملخص النشاط + الإحصائيات */}
        <section className="dash-summary">
          <div className="dash-summary-header">
            <span className="dash-summary-title">ملخص نشاطك</span>
            {/* ✅ هنا غيّرنا النص من "اليوم" إلى "إجمالي نشاطك" */}
            <span className="dash-chip">إجمالي نشاطك</span>
          </div>

          <div className="dash-stats-grid">
            <div className="dash-stat-card dash-stat-card--blood">
              <div className="dash-stat-label">طلبات دم نشطة</div>
              <div className="dash-stat-value">{safeStats.activeBlood}</div>
              <div className="dash-stat-hint">
                {safeStats.urgentBlood} حالة مستعجلة
                <span className="dash-stat-urgent"> 🚨</span>
              </div>
            </div>

            <div className="dash-stat-card dash-stat-card--general">
              <div className="dash-stat-label">طلبات مساعدة عامة</div>
              <div className="dash-stat-value">{safeStats.activeDonations}</div>
              <div className="dash-stat-hint">قيد النشر والمتابعة</div>
            </div>

            <div className="dash-stat-card dash-stat-card--follow">
              <div className="dash-stat-label">بانتظار متابعتك</div>
              <div className="dash-stat-value">{safeStats.pendingReviews}</div>
              <div className="dash-stat-hint">تحتاج تأكيد / تقييم منك</div>
            </div>
          </div>
        </section>
      </header>

      {/* ===== كروت الوصول السريع ===== */}
      <ManageQuickCards
        bloodCount={quickCounts.blood}
        generalCount={quickCounts.general}
        communityCount={quickCounts.community}
      />
    </main>
  );
}

DashboardPage.propTypes = {
  userName: PropTypes.string,
  stats: PropTypes.object,
  latestBloodRequests: PropTypes.arrayOf(PropTypes.object),
  latestDonationRequests: PropTypes.arrayOf(PropTypes.object),
};

DashboardPage.defaultProps = {
  userName: '',
  stats: null,
  latestBloodRequests: [],
  latestDonationRequests: [],
};

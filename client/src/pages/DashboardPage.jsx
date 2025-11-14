// src/pages/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ManageQuickCards from '../components/ManageQuickCards.jsx'; // ✅ الكروت السريعة
import './DashboardPage.css';

/* ========= PropTypes مشتركة ========= */
const requestShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  kind: PropTypes.oneOf(['blood', 'general']).isRequired,
  title: PropTypes.string,
  isUrgent: PropTypes.bool,
  bloodType: PropTypes.string,
  category: PropTypes.string,
  location: PropTypes.string,
  place: PropTypes.string,
  deadline: PropTypes.any,
  status: PropTypes.string,
  createdAt: PropTypes.any,
});

const offerShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  kind: PropTypes.oneOf(['blood', 'general']).isRequired,
  title: PropTypes.string,
  toWhom: PropTypes.string,
  status: PropTypes.string,
  createdAt: PropTypes.any,
  reqId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  bloodType: PropTypes.string,
  category: PropTypes.string,
  type: PropTypes.string,
  isUrgent: PropTypes.bool,
});

/* ========= عناصر عرض صغيرة ========= */
const MiniEmpty = ({ text }) => <li className="dash-empty">{text}</li>;
MiniEmpty.propTypes = { text: PropTypes.string.isRequired };

const MyReqItem = ({ r }) => (
  <li className="mini-card">
    <div className="mini-card-top">
      {r.kind === 'blood' ? (
        <>
          {r.isUrgent && <span className="mini-badge urgent">مستعجل ⚡</span>}
          <span className="mini-badge blood">{r.bloodType || '—'}</span>
        </>
      ) : (
        <>
          {r.isUrgent && <span className="mini-badge urgent">مستعجل ⚡</span>}
          <span className="mini-badge category">{r.category || 'طلب'}</span>
        </>
      )}
    </div>

    <div className="mini-main">
      <div className="mini-title">{r.title}</div>
      <div className="mini-row">
        <span className="mini-label">المكان:</span>
        <span>{r.place || r.location || '—'}</span>
      </div>
      <div className="mini-row">
        <span className="mini-label">الحالة:</span>
        <span>{r.status || '—'}</span>
      </div>
    </div>

    <div className="mini-footer">
      <Link
        to={r.kind === 'blood' ? `/blood-donation-details/${r.id}` : `/donations/${r.id}`}
        className="mini-link"
      >
        التفاصيل
      </Link>
    </div>
  </li>
);
MyReqItem.propTypes = { r: requestShape.isRequired };

const MyOfferItem = ({ o }) => (
  <li className="mini-card">
    <div className="mini-card-top">
      <span className="mini-badge offer">عرض مساعدة</span>
      {o.status === 'accepted' && <span className="mini-badge success">تم القبول ✅</span>}
    </div>

    <div className="mini-main">
      <div className="mini-title">{o.title}</div>
      <div className="mini-row">
        <span className="mini-label">المستفيد:</span>
        <span>{o.toWhom || '—'}</span>
      </div>
      <div className="mini-row">
        <span className="mini-label">الحالة:</span>
        <span>{o.status || '—'}</span>
      </div>
    </div>

    <div className="mini-footer">
      <Link
        to={o.kind === 'blood' ? `/blood-donation-details/${o.reqId}` : `/donations/${o.reqId}`}
        className="mini-link"
      >
        التفاصيل
      </Link>
    </div>
  </li>
);
MyOfferItem.propTypes = { o: offerShape.isRequired };

/* ========= المكوّن الرئيسي ========= */
export default function DashboardPage({
  userName,
  stats,
  latestBloodRequests, // احتياطي إن رغبت بإظهارها لاحقًا
  latestDonationRequests,
}) {
  /* حالة التحميل والبيانات (مُقسّمة حسب النوع) */
  const [loadingMine, setLoadingMine] = useState(true);
  const [myBloodRequests, setMyBloodRequests] = useState([]);
  const [myGeneralRequests, setMyGeneralRequests] = useState([]);
  const [myBloodOffers, setMyBloodOffers] = useState([]);
  const [myGeneralOffers, setMyGeneralOffers] = useState([]);

  /* Helpers: تطبيع */
  const normReqBlood = (r) => ({
    id: r._id,
    kind: 'blood',
    title: r.title || r.description || '—',
    isUrgent: !!r.isUrgent,
    bloodType: r.bloodType || '',
    category: null,
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

  /* الجلب */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingMine(true);
        // طلباتي
        const [mineBlood, mineGeneral] = await Promise.all([
          fetchWithInterceptors('/api/blood-requests/mine-with-offers'),
          fetchWithInterceptors('/api/donationRequests/mine-with-offers'),
        ]);

        const bloodReqs = (mineBlood?.ok && Array.isArray(mineBlood.body) ? mineBlood.body.map(normReqBlood) : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const generalReqs = (mineGeneral?.ok && Array.isArray(mineGeneral.body) ? mineGeneral.body.map(normReqGeneral) : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // عروضي
        const [sentBlood, sentGeneral] = await Promise.all([
          fetchWithInterceptors('/api/donation-confirmations/sent'),
          fetchWithInterceptors('/api/donation-request-confirmations/sent'),
        ]);
        const bloodOffers = (sentBlood?.ok && Array.isArray(sentBlood.body) ? sentBlood.body.map(normOfferBlood) : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const generalOffers = (sentGeneral?.ok && Array.isArray(sentGeneral.body) ? sentGeneral.body.map(normOfferGeneral) : [])
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
    return () => { isMounted = false; };
  }, []);

  /* إحصائيات أعلى الصفحة: إن لم تصل من props نحسبها */
  const derivedStats = useMemo(() => {
    if (stats) return stats;
    const activeBlood =
      myBloodRequests.filter((r) => r.status === 'active' || r.status === 'pending').length;
    const urgentBlood = myBloodRequests.filter((r) => r.isUrgent).length;
    const activeDonations =
      myGeneralRequests.filter((r) => r.status === 'active' || r.status === 'pending').length;
    const pendingReviews =
      [...myBloodOffers, ...myGeneralOffers].filter((o) => o.status === 'fulfilled').length;
    return { activeBlood, urgentBlood, activeDonations, pendingReviews };
  }, [stats, myBloodRequests, myGeneralRequests, myBloodOffers, myGeneralOffers]);

  const safeStats = derivedStats || {
    activeBlood: 0,
    urgentBlood: 0,
    activeDonations: 0,
    pendingReviews: 0,
  };

  // عدّادات للكروت السريعة
  const quickCounts = useMemo(() => ({
    blood: myBloodRequests.length + myBloodOffers.length,
    general: myGeneralRequests.length + myGeneralOffers.length,
    community: 0, // حدّثه إن كان لديك API للمجتمع
  }), [myBloodRequests.length, myBloodOffers.length, myGeneralRequests.length, myGeneralOffers.length]);

  return (
    <main className="dash-shell" dir="rtl">
      {/* ===== رأس الصفحة ===== */}
      <header className="dash-header">
        <div className="dash-header-left">
          <h1 className="dash-hello">
            أهلاً <span className="dash-hello-name">{userName || 'صديقنا'}</span> 👋
          </h1>
          <p className="dash-sub">
            من هنا يمكنك نشر طلب مساعدة، طلب تبرع بالدم، عرض مساعدتك للآخرين،
            ومتابعة ما يحدث في المجتمع ❤️
          </p>
          <Link to="/profile" className="dash-profile-link">الانتقال إلى صفحتي الشخصية</Link>
        </div>

        <section className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-label">طلبات دم نشطة</div>
            <div className="dash-stat-value">{safeStats.activeBlood}</div>
            <div className="dash-stat-hint">{safeStats.urgentBlood} حالة مستعجلة <span className="dash-stat-urgent"> 🚨</span></div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-label">طلبات مساعدة عامة</div>
            <div className="dash-stat-value">{safeStats.activeDonations}</div>
            <div className="dash-stat-hint">قيد النشر الآن</div>
          </div>

          <div className="dash-stat-card">
            <div className="dash-stat-label">بانتظار متابعتك</div>
            <div className="dash-stat-value">{safeStats.pendingReviews}</div>
            <div className="dash-stat-hint">تحتاج رد / تأكيد منك</div>
          </div>
        </section>
      </header>

      {/* ===== كروت الوصول السريع ===== */}
      <ManageQuickCards
        bloodCount={quickCounts.blood}
        generalCount={quickCounts.general}
        communityCount={quickCounts.community}
      />

      {/* ===== قسمين منفصلين: الدم / العامة ===== */}
      <section className="dash-my">
        {/* عمود الدم */}
        <div className="dash-my-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">طلباتي (الدم) 🩸</h3>
            <Link className="dash-see-all" to="/profile?tab=req-blood">إدارة طلبات الدم</Link>
          </div>
          <ul className="dash-card-list">
            {loadingMine ? (
              <MiniEmpty text="⏳ جاري تحميل طلبات الدم..." />
            ) : myBloodRequests.length === 0 ? (
              <MiniEmpty text="لا توجد طلبات دم" />
            ) : (
              myBloodRequests.slice(0, 4).map((r) => <MyReqItem key={r.id} r={r} />)
            )}
          </ul>

          <div className="dash-list-head" style={{ marginTop: 16 }}>
            <h3 className="dash-block-title">عروضي على طلبات الدم 🎁🩸</h3>
            <Link className="dash-see-all" to="/profile?tab=offers-blood">إدارة عروض الدم</Link>
          </div>
          <ul className="dash-card-list">
            {loadingMine ? (
              <MiniEmpty text="⏳ جاري تحميل عروض الدم..." />
            ) : myBloodOffers.length === 0 ? (
              <MiniEmpty text="لم تقدّم عروضًا على طلبات الدم بعد" />
            ) : (
              myBloodOffers.slice(0, 4).map((o) => <MyOfferItem key={o.id} o={o} />)
            )}
          </ul>
        </div>

        {/* عمود الطلبات/العروض العامة */}
        <div className="dash-my-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">طلباتي (العامة) 🤲</h3>
            <Link className="dash-see-all" to="/profile?tab=req-general">إدارة الطلبات العامة</Link>
          </div>
          <ul className="dash-card-list">
            {loadingMine ? (
              <MiniEmpty text="⏳ جاري تحميل الطلبات العامة..." />
            ) : myGeneralRequests.length === 0 ? (
              <MiniEmpty text="لا توجد طلبات عامة" />
            ) : (
              myGeneralRequests.slice(0, 4).map((r) => <MyReqItem key={r.id} r={r} />)
            )}
          </ul>

          <div className="dash-list-head" style={{ marginTop: 16 }}>
            <h3 className="dash-block-title">عروضي على الطلبات العامة 🎁</h3>
            <Link className="dash-see-all" to="/profile?tab=offers-general">إدارة العروض العامة</Link>
          </div>
          <ul className="dash-card-list">
            {loadingMine ? (
              <MiniEmpty text="⏳ جاري تحميل عروضك العامة..." />
            ) : myGeneralOffers.length === 0 ? (
              <MiniEmpty text="لم تقدّم عروض مساعدة عامة بعد" />
            ) : (
              myGeneralOffers.slice(0, 4).map((o) => <MyOfferItem key={o.id} o={o} />)
            )}
          </ul>
        </div>
      </section>
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

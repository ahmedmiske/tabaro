// src/pages/DashboardPage.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

export default function DashboardPage({
  userName,
  stats,
  latestBloodRequests,
  latestDonationRequests,
  myRequests,
  myOffers,
}) {
  const safeStats = stats || {
    activeBlood: 0,
    urgentBlood: 0,
    activeDonations: 0,
    pendingReviews: 0,
  };

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

          <Link to="/profile" className="dash-profile-link">
            الانتقال إلى صفحتي الشخصية
          </Link>
        </div>

        <section className="dash-stats-grid">
          <div className="dash-stat-card">
            <div className="dash-stat-label">طلبات دم نشطة</div>
            <div className="dash-stat-value">{safeStats.activeBlood}</div>
            <div className="dash-stat-hint">
              {safeStats.urgentBlood} حالة مستعجلة
              <span className="dash-stat-urgent"> 🚨</span>
            </div>
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

      {/* ===== إجراءات سريعة ===== */}
      <section className="dash-quick">
        <h2 className="dash-block-title">بدء إجراء سريع ⏱</h2>

        <div className="dash-quick-grid">
          {/* طلب تبرع بالدم */}
          <Link to="/blood-donation" className="quick-action-btn">
            <span className="qa-emoji">🩸</span>
            <div className="qa-texts">
              <div className="qa-title">طلب تبرع بالدم</div>
              <div className="qa-desc">
                تحتاج متبرعين بالدم لحالة طبية عاجلة أو خلال الساعات القادمة؟
              </div>
            </div>
          </Link>

          {/* طلب مساعدة عامة */}
          <Link to="/donation-requests" className="quick-action-btn">
            <span className="qa-emoji">🤲</span>
            <div className="qa-texts">
              <div className="qa-title">طلب مساعدة عامة</div>
              <div className="qa-desc">
                دعم مالي، سكن مؤقت، لوازم مدرسية، دواء...
              </div>
            </div>
          </Link>

          {/* عرض تبرع / المساعدة */}
          <Link to="/ready/general" className="quick-action-btn">
            <span className="qa-emoji">🎁</span>
            <div className="qa-texts">
              <div className="qa-title">عرض مساعدتي / تبرعي</div>
              <div className="qa-desc">
                أريد أن أتبرع (مال / أغراض / وقتي) أو أساعد شخص محتاج
              </div>
            </div>
          </Link>

          {/* فكرة للمجتمع */}
          <Link to="/social/new" className="quick-action-btn">
            <span className="qa-emoji">💡</span>
            <div className="qa-texts">
              <div className="qa-title">شارك فكرة مع المجتمع</div>
              <div className="qa-desc">
                مبادرة اجتماعية، نشاط تضامني، اقتراح تحسين للمنصة
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ===== أحدث طلبات عامة منشورة (دم / عام) ===== */}
      <section className="dash-lists">
        {/* العام: طلبات الدم */}
        <div className="dash-list-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">أحدث طلبات التبرع بالدم 🩸</h3>

            {/* رابط للائحة الدم العامة */}
            <Link className="dash-see-all" to="/blood-donations">
              عرض جميع حالات الدم
            </Link>
          </div>

          <ul className="dash-card-list">
            {(latestBloodRequests || []).length === 0 ? (
              <li className="dash-empty">لا توجد طلبات دم حديثة</li>
            ) : (
              latestBloodRequests.map((req) => (
                <li key={req.id} className="mini-card">
                  <div className="mini-card-top">
                    {req.isUrgent && (
                      <span className="mini-badge urgent">مستعجل ⚡</span>
                    )}
                    <span className="mini-badge blood">
                      {req.bloodType || '—'}
                    </span>
                  </div>

                  <div className="mini-main">
                    <div className="mini-title">
                      {req.title}
                    </div>

                    <div className="mini-row">
                      <span className="mini-label">المكان:</span>
                      <span>{req.location || 'غير محدد'}</span>
                    </div>

                    <div className="mini-row">
                      <span className="mini-label">آخر أجل:</span>
                      <span>
                        {req.deadline
                          ? new Date(req.deadline).toLocaleDateString('ar-MA')
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mini-footer">
                    <Link
                      to={`/blood-donation-details/${req.id}`}
                      className="mini-link"
                    >
                      التفاصيل
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* العام: طلبات المساعدة العامة */}
        <div className="dash-list-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">أحدث طلبات المساعدة 🤲</h3>

            {/* هذا المسار عندك لائحة الطلبات العامة */}
            <Link className="dash-see-all" to="/donations">
              عرض جميع طلبات المساعدة
            </Link>
          </div>

          <ul className="dash-card-list">
            {(latestDonationRequests || []).length === 0 ? (
              <li className="dash-empty">لا توجد طلبات مساعدة حديثة</li>
            ) : (
              latestDonationRequests.map((req) => (
                <li key={req.id} className="mini-card">
                  <div className="mini-card-top">
                    {req.isUrgent && (
                      <span className="mini-badge urgent">مستعجل ⚡</span>
                    )}
                    <span className="mini-badge category">
                      {req.category || 'طلب'}
                    </span>
                  </div>

                  <div className="mini-main">
                    <div className="mini-title">
                      {req.title}
                    </div>

                    <div className="mini-row">
                      <span className="mini-label">المكان:</span>
                      <span>{req.place || req.location || 'غير محدد'}</span>
                    </div>

                    {'amountNeeded' in req && req.amountNeeded && (
                      <div className="mini-row">
                        <span className="mini-label">المبلغ المطلوب:</span>
                        <span className="mini-amount">
                          {req.amountNeeded} €
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mini-footer">
                    <Link
                      to={`/donations/${req.id}`}
                      className="mini-link"
                    >
                      التفاصيل
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* ===== ملخص سريع: طلباتي / تبرعاتي ===== */}
      <section className="dash-my">
        {/* طلباتي أنا */}
        <div className="dash-my-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">طلباتي 📄</h3>
            <Link
              className="dash-see-all"
              to="/profile?tab=req-general"
            >
              إدارة طلباتي
            </Link>
          </div>

          <ul className="dash-card-list">
            {(myRequests || []).length === 0 ? (
              <li className="dash-empty">لم تنشر أي طلب بعد</li>
            ) : (
              myRequests.map((r) => (
                <li key={r.id} className="mini-card">
                  <div className="mini-card-top">
                    {r.kind === 'blood' ? (
                      <span className="mini-badge blood">
                        دم {r.bloodType || ''}
                      </span>
                    ) : (
                      <span className="mini-badge category">
                        {r.category || 'طلب'}
                      </span>
                    )}

                    {r.isUrgent && (
                      <span className="mini-badge urgent">⚡ مستعجل</span>
                    )}
                  </div>

                  <div className="mini-main">
                    <div className="mini-title">{r.title}</div>

                    <div className="mini-row">
                      <span className="mini-label">الحالة:</span>
                      <span>{r.status || '—'}</span>
                    </div>
                  </div>

                  <div className="mini-footer">
                    <Link
                      to={
                        r.kind === 'blood'
                          ? `/blood-donation-details/${r.id}`
                          : `/donations/${r.id}`
                      }
                      className="mini-link"
                    >
                      عرض
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* تبرعاتي أنا / عروضي */}
        <div className="dash-my-col">
          <div className="dash-list-head">
            <h3 className="dash-block-title">تبرعاتي / عروضي 🎁</h3>
            <Link
              className="dash-see-all"
              to="/profile?tab=offers-general"
            >
              إدارة عروض المساعدة
            </Link>
          </div>

          <ul className="dash-card-list">
            {(myOffers || []).length === 0 ? (
              <li className="dash-empty">لم تقدّم عرض مساعدة بعد</li>
            ) : (
              myOffers.map((o) => (
                <li key={o.id} className="mini-card">
                  <div className="mini-card-top">
                    <span className="mini-badge offer">عرض مساعدة</span>
                    {o.status === 'accepted' && (
                      <span className="mini-badge success">تم القبول ✅</span>
                    )}
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
                    {/* حالياً ما عندنا /offers/:id في الروتر.
                       لو تضيفه لاحقاً، يبقى هذا الرابط.
                       الآن ممكن نخليه يذهب إلى /profile */}
                    <Link
                      to="/profile?tab=offers-general"
                      className="mini-link"
                    >
                      التفاصيل
                    </Link>
                  </div>
                </li>
              ))
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
  myRequests: PropTypes.arrayOf(PropTypes.object),
  myOffers: PropTypes.arrayOf(PropTypes.object),
};

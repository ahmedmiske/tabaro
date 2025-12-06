// src/components/ManageQuickCards.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ManageQuickCards.css';

export default function ManageQuickCards({
  bloodCount,
  generalCount,
  communityCount,
}) {
  return (
    <section className="mqs-section" dir="rtl">
      <h2 className="mqc-title">الوصول السريع لإدارة طلباتك وعروضك</h2>
      <p className="mqc-sub">
        من هنا يمكنك إدارة طلباتك، استكشاف طلبات الآخرين، أو الإعلان عن استعدادك
        للتبرع في أي وقت.
      </p>

      {/* شبكة الكروت الثلاثة */}
      <div className="mqs-shell">
        {/* بطاقة التبرع بالدم */}
        <article className="mqs-card is-blood">
          <div className="mqs-glow" />

          <div className="mqs-top">
            <div className="mqs-icon">💧</div>
            <span className="mqs-badge">{bloodCount} عنصر متعلق بك</span>
          </div>

          <h3 className="mqs-title">إدارة التبرع بالدم</h3>
          <p className="mqs-desc">
            تابع طلباتك وعروضك الخاصة بالتبرع بالدم
          </p>

          <div className="mqs-footer">
            <span className="mqs-hint">منطقة خاصة بطلبات وعروض الدم.</span>
            <div className="mqs-actions">
              <Link to="/manage/blood" className="mqs-cta mqs-cta--primary">
                إدارة طلباتي وعروضي
              </Link>
            </div>
          </div>
        </article>

        {/* بطاقة التبرعات العامة */}
        <article className="mqs-card is-general">
          <div className="mqs-glow" />

          <div className="mqs-top">
            <div className="mqs-icon">🎁</div>
            <span className="mqs-badge">{generalCount} عنصر متعلق بك</span>
          </div>

          <h3 className="mqs-title">إدارة التبرعات العامة</h3>
          <p className="mqs-desc">
            المساعدات المالية والعينية، السكن، التعليم وغيرها من الطلبات والعروض.
          </p>

          <div className="mqs-footer">
            <span className="mqs-hint">منطقة إدارة التبرعات والطلبات العامة.</span>
            <div className="mqs-actions">
              <Link to="/manage/general" className="mqs-cta mqs-cta--primary">
                إدارة طلباتي وعروضي
              </Link>
            </div>
          </div>
        </article>

        {/* بطاقة المجتمع / الإعلانات الاجتماعية */}
        <article className="mqs-card is-community">
          <div className="mqs-glow" />

          <div className="mqs-top">
            <div className="mqs-icon">💬</div>
            <span className="mqs-badge">{communityCount} عنصر</span>
          </div>

          <h3 className="mqs-title">المجتمع والإعلانات الاجتماعية</h3>
          <p className="mqs-desc">
            حملات، منشورات، وإعلانات اجتماعية للتطوع أو جمع التبرعات (قيد
            التطوير).
          </p>

          <div className="mqs-footer">
            <span className="mqs-hint">مساحة المجتمع والتطوع.</span>
            <div className="mqs-actions">
              <Link to="/manage/community" className="mqs-cta mqs-cta--primary">
                إدارة منشوراتي وإعلاناتي
              </Link>
            </div>
          </div>
        </article>
      </div>

      {/* ✅ صف جديد أسفل الكروت يحتوي الأزرار العامة */}
      <div className="mqs-global-actions">
        <Link
          to="/blood-donations"  // غيّر المسار حسب الراوتر عندك
          className="mqs-global-btn"
        >
          استكشف طلبات التبرع بالدم
        </Link>

        <Link
          to="/donations" // غيّر المسار لمسار طلبات التبرعات العامة
          className="mqs-global-btn mqs-global-btn--secondary"
        >
          استكشف طلبات التبرعات العامة
        </Link>

        <Link
          to="/ready/blood" // صفحة يعلن فيها المستخدم استعداده للتبرع
          className="mqs-global-btn mqs-global-btn--accent"
        >
          أعلن عن استعدادك للتبرع الآن
        </Link>
      </div>
    </section>
  );
}

ManageQuickCards.propTypes = {
  bloodCount: PropTypes.number,
  generalCount: PropTypes.number,
  communityCount: PropTypes.number,
};

ManageQuickCards.defaultProps = {
  bloodCount: 0,
  generalCount: 0,
  communityCount: 0,
};

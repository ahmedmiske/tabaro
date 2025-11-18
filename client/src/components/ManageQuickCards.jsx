// src/components/ManageQuickCards.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './ManageQuickCards.css';

export default function ManageQuickCards({
  bloodCount = 0,
  generalCount = 0,
  communityCount = 0,
}) {
  const items = [
    {
      key: 'blood',
      manageTo: '/manage?tab=blood',
      listTo: '/blood-donations',
      icon: '💧',
      title: 'إدارة طلبات التبرع بالدم',
      hint: bloodCount > 0 ? `${bloodCount} عناصر بانتظارك` : 'لا توجد طلبات أو عروض بعد',
      badge: 'دم',
      desc: 'أنشئ طلب دم جديد، راقب العروض، وأكمل التنفيذ بسهولة.',
      listLabel: 'عرض طلبات التبرع بالدم',
    },
    {
      key: 'general',
      manageTo: '/manage?tab=general',
      listTo: '/donations',
      icon: '🎁',
      title: 'إدارة الطلبات العامة',
      hint: generalCount > 0 ? `${generalCount} عناصر نشطة` : 'لم تضف أو تتفاعل مع طلبات عامة بعد',
      badge: 'عام',
      desc: 'طلبات مساعدة متنوعة: إغاثة، تعليم، مبادرات.. ادعم أو اطلب.',
      listLabel: 'استكشاف الطلبات العامة',
    },
    {
      key: 'community',
      manageTo: '/manage?tab=community',
      listTo: '/announcements',
      icon: '💬',
      title: 'مشاركاتك مع المجتمع',
      hint: communityCount > 0 ? `${communityCount} تفاعل حديث` : 'لم تشارك بعد في منشورات المجتمع',
      badge: 'مجتمعنا',
      desc: 'شارك فكرة، اقترح مبادرة، وتفاعل مع منشورات المجتمع.',
      listLabel: 'الذهاب إلى الإعلانات المجتمعية',
    },
  ];

  return (
    <section
      className="mqs-shell"
      aria-label="الوصول السريع لإدارة الطلبات والمجتمع"
      dir="rtl"
    >
      {items.map((it) => (
        <article key={it.key} className={`mqs-card is-${it.key}`}>
          <div className="mqs-glow" aria-hidden />
          <div className="mqs-top">
            <span className="mqs-icon" aria-hidden>
              {it.icon}
            </span>
            <span className="mqs-badge">{it.badge}</span>
          </div>

          <h3 className="mqs-title">{it.title}</h3>
          <p className="mqs-desc">{it.desc}</p>

          <div className="mqs-footer">
            <span className="mqs-hint">{it.hint}</span>

            <div className="mqs-actions">
              {/* زر الإدارة (نفس الفكرة السابقة) */}
              <Link
                className="mqs-cta mqs-cta--primary"
                to={it.manageTo}
                aria-label={`إدارة: ${it.title}`}
              >
                إدارة
              </Link>

              {/* زر عرض / استكشاف الطلبات في الصفحة المخصصة */}
              {it.listTo && (
                <Link
                  className="mqs-cta mqs-cta--ghost"
                  to={it.listTo}
                  aria-label={it.listLabel}
                >
                  {it.listLabel}
                </Link>
              )}
            </div>
          </div>
        </article>
      ))}
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

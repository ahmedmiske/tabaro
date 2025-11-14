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
      to: '/manage?tab=blood',
      icon: '💧',
      title: 'إدارة طلبات التبرع بالدم',
      hint: `${bloodCount} عناصر بانتظارك`,
      badge: 'دم',
      desc: 'أنشئ طلب دم جديد، راقب العروض، وأكمل التنفيذ بسهولة.',
    },
    {
      key: 'general',
      to: '/manage?tab=general',
      icon: '🎁',
      title: 'إدارة الطلبات العامة',
      hint: `${generalCount} عناصر نشطة`,
      badge: 'عام',
      desc: 'طلبات مساعدة متنوعة: إغاثة، تعليم، مبادرات.. ادعم أو اطلب.',
    },
    {
      key: 'community',
      to: '/manage?tab=community',
      icon: '💬',
      title: 'مشاركاتك مع المجتمع',
      hint: `${communityCount} تفاعل حديث`,
      badge: 'مجتمعنا',
      desc: 'شارك فكرة، اقترح مبادرة، وتفاعل مع منشورات المجتمع.',
    },
  ];

  return (
    <section className="mqs-shell" aria-label="الوصول السريع لإدارة الطلبات والمجتمع" dir="rtl">
      {items.map((it) => (
        <article key={it.key} className={`mqs-card is-${it.key}`}>
          <div className="mqs-glow" aria-hidden />
          <div className="mqs-top">
            <span className="mqs-icon" aria-hidden>{it.icon}</span>
            <span className="mqs-badge">{it.badge}</span>
          </div>

          <h3 className="mqs-title">{it.title}</h3>
          <p className="mqs-desc">{it.desc}</p>

          <div className="mqs-footer">
            <span className="mqs-hint">{it.hint}</span>
            <Link className="mqs-cta" to={it.to} aria-label={it.title}>
              انتقل الآن
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

ManageQuickCards.propTypes = {
  // لو كانت القيم تأتي أحيانًا كنص من API غيّرها إلى oneOfType([PropTypes.number, PropTypes.string])
  bloodCount: PropTypes.number,
  generalCount: PropTypes.number,
  communityCount: PropTypes.number,
};

ManageQuickCards.defaultProps = {
  bloodCount: 0,
  generalCount: 0,
  communityCount: 0,
};

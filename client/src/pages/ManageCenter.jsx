import React, { useState } from 'react';
import './ManageCenter.css';
import MyDonationOffersBlood from '../components/MyDonationOffersBlood';
import MyRequestsWithOffersBlood from '../components/MyRequestsWithOffersBlood';
import MyDonationOffersGeneral from '../components/MyDonationOffersGeneral';
import MyRequestsWithOffersGeneral from '../components/MyRequestsWithOffersGeneral';

const TABS = [
  { key: 'blood', label: 'تبرع بالدم', icon: '💧', variant: 'blood' },
  { key: 'general', label: 'تبرعات عامة', icon: '🎁', variant: 'general' },
  { key: 'community', label: 'مجتمعنا', icon: '💬', variant: 'community' },
];

function BloodSection() {
  return (
    <div className="mc-panel-inner">
      <h2 className="mc-panel-title">إدارة طلبات وعروض التبرع بالدم</h2>
      <p className="mc-panel-desc">يمكنك هنا إدارة الطلبات والعروض الخاصة بالتبرع بالدم.</p>
      <div className="mc-placeholder">
      <MyDonationOffersBlood />
      <MyRequestsWithOffersBlood />
      </div>
    </div>
  );
}

function GeneralSection() {
  return (
    <div className="mc-panel-inner">
      <h2 className="mc-panel-title">إدارة التبرعات العامة</h2>
      <p className="mc-panel-desc">تابع طلباتك وعروضك العامة مثل المساعدات والمستلزمات.</p>
      <div className="mc-placeholder">
        <MyDonationOffersGeneral />
        <MyRequestsWithOffersGeneral />
      </div>
    </div>
  );
}

function CommunitySection() {
  return (
    <div className="mc-panel-inner">
      <h2 className="mc-panel-title">مساحات المجتمع</h2>
      <p className="mc-panel-desc">شارك أفكارك وتفاعل مع منشورات المجتمع.</p>
      <div className="mc-placeholder">هنا توضع مكونات المجتمع</div>
    </div>
  );
}

export default function ManageCenter() {
  const [active, setActive] = useState('blood');

  return (
    <main className="mc-wrap" dir="rtl">
      <header className="mc-hero">
        <h1 className="mc-hero-title">إدارة الطلبات والعروض</h1>
        <p className="mc-hero-sub">كل ما يخص طلباتك وعروضك في مكان واحد — نظّم أمورك بسرعة عبر التبويبات 👇</p>
      </header>

      <div className="mc-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            className={`mc-tab ${active === t.key ? 'is-active' : ''}`}
            data-variant={t.variant}
            onClick={() => setActive(t.key)}
          >
            <span className="mc-tab__icon">{t.icon}</span>
            <span className="mc-tab__label">{t.label}</span>
          </button>
        ))}
      </div>

      <section className="mc-panel">
        {active === 'blood' && <BloodSection />}
        {active === 'general' && <GeneralSection />}
        {active === 'community' && <CommunitySection />}
      </section>

      <footer className="mc-footnote">يمكنك التنقل بين التبويبات دون فقدان تقدمك.</footer>
    </main>
  );
}

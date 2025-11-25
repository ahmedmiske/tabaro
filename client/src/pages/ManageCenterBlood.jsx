import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageCenter.css';
import TitleMain from '../components/TitleMain.jsx';
import MyDonationOffersBlood from '../components/MyDonationOffersBlood.jsx';
import MyRequestsWithOffersBlood from '../components/MyRequestsWithOffersBlood.jsx';

export default function ManageCenterBlood() {
  const navigate = useNavigate();

  return (
    <main className="mc-wrap mc-wrap--blood" dir="rtl">
      <header className="mc-hero">
        <TitleMain
          title="لوحة التبرع بالدم"
          subtitle="إدارة طلباتك وعروضك الخاصة بالتبرع بالدم في مكان واحد."
          align="center"
          size="lg"
        />

        <div className="mc-topbar">
          <button
            type="button"
            className="mc-back"
            onClick={() => navigate('/manage')}
          >
            <span className="mc-back__icon" aria-hidden>↩</span>
            <span className="mc-back__label">رجوع للمركز</span>
          </button>
        </div>
      </header>
        
        <article className="mc-panel-inner mc-panel-inner--blood">
          <MyRequestsWithOffersBlood />
        </article>
      <section className="mc-two-columns">
        <article className="mc-panel-inner mc-panel-inner--blood">
          <MyDonationOffersBlood />
        </article>

      </section>

      <footer className="mc-footnote">
        إدارة دقيقة لطلبات وعروض التبرع بالدم تساعد على إنقاذ المزيد من الأرواح 💚
      </footer>
    </main>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageCenter.css';
import TitleMain from '../components/TitleMain.jsx';
import MyDonationOffersGeneral from '../components/MyDonationOffersGeneral.jsx';
import MyRequestsWithOffersGeneral from '../components/MyRequestsWithOffersGeneral.jsx';

export default function ManageCenterGeneral() {
  const navigate = useNavigate();

  return (
    <main className="mc-wrap mc-wrap--general" dir="rtl">
      <header className="mc-hero">
        <TitleMain
          title="لوحة التبرعات العامة"
          subtitle="تابع التبرعات المالية والعينية، وراقب حالة الطلبات والعروض."
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

      <section className="mc-two-columns">
        
            <article className="mc-panel-inner mc-panel-inner--general">
          <h2 className="mc-panel-title">طلباتي التي استقبلت عروضًا</h2>
          <p className="mc-panel-desc">
            إدارة طلباتك العامة ومتابعة العروض، القبول، التنفيذ، والتقييم.
          </p>
          <MyRequestsWithOffersGeneral />
        </article>


        <article className="mc-panel-inner mc-panel-inner--general">
          <h2 className="mc-panel-title">عروضي في التبرعات العامة</h2>
          <p className="mc-panel-desc">
            التبرعات المالية، المساعدات، المستلزمات، وأي عروض قدّمتها للآخرين.
          </p>
          <MyDonationOffersGeneral />
        </article>

    
      </section>

      <footer className="mc-footnote">
        يمكنك العودة لاحقًا لإضافة فلاتر، إحصائيات، ومخططات لهذه اللوحة 🎯
      </footer>
    </main>
  );
}

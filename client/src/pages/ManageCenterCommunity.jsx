import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageCenter.css';
import TitleMain from '../components/TitleMain.jsx';

export default function ManageCenterCommunity() {
  const navigate = useNavigate();

  return (
    <main className="mc-wrap mc-wrap--community" dir="rtl">
      <header className="mc-hero">
        <TitleMain
          title="لوحة المجتمع والإعلانات الاجتماعية"
          subtitle="من هنا ستتم إدارة الحملات، الإعلانات الاجتماعية، ومساحات التفاعل."
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

      <section className="mc-panel-inner mc-panel-inner--community">
        <h2 className="mc-panel-title">إدارة الإعلانات الاجتماعية</h2>
        <p className="mc-panel-desc">
          في المرحلة الحالية هذا القسم مجرد مكان جاهز لإضافة مكونات:
          <br />
          الإعلانات، الحملات، منشورات المجتمع، والإشعارات المرتبطة بها.
        </p>

        <div className="mc-placeholder-community">
          {/* لاحقًا: ضع هنا مكونات مثل MySocialAnnouncements, MyCampaigns, ... */}
          سيتم قريبًا إضافة مكونات المجتمع هنا 🌱
        </div>
      </section>

      <footer className="mc-footnote">
        هذا القسم مصمم ليكون مرنًا لإضافة موديولات المجتمع لاحقًا.
      </footer>
    </main>
  );
}

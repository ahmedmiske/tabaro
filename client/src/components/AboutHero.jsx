// src/components/AboutHero.jsx
import React from 'react';
import './AboutHero.css';

const AboutHero = () => {
  return (
    <section className="modern-about-section">
      <div className="about-container">

        {/* Hero Header */}
        <div className="about-hero-header">
          <div className="hero-logo-container">
            <img src="/logoTabaro.png" alt="تبَرُّع" className="hero-logo" />
          </div>
          
          <h1 className="hero-main-title">
            نربط القلوب الكريمة
            <span className="gradient-text"> بالأيادي المحتاجة في موريتانيا</span>
          </h1>
          <p className="hero-description">
            أول تجربة موريتانية من نوعها - منصة رقمية متكاملة تُمكّن المواطنين الموريتانيين من التبرع 
            وطلب التبرعات بالدم والمال والعينيات في بيئة آمنة وشفافة تخدم المجتمع الموريتاني.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="bento-grid">

          
          {/* Circles Section */}
          <div className="bento-card wide-card circles-section">
            <div className="circles-grid">
              
              {/* Vision Circle */}
              <div className="circle-card vision-circle">
                <div className="circle-inner">
                  <div className="circle-icon-wrapper">
                    <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="circle-title">رؤيتنا</h3>
                  <p className="circle-text">
                    المنصة الرقمية الرائدة في موريتانيا لربط المحتاجين بالمتبرعين
                  </p>
                </div>
              </div>

              {/* Mission Circle */}
              <div className="circle-card mission-circle">
                <div className="circle-inner">
                  <div className="circle-icon-wrapper">
                    <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="circle-title">رسالتنا</h3>
                  <p className="circle-text">
                    تسهيل التبرع والمساعدة بين أبناء الشعب الموريتاني بتقنية حديثة وشفافة
                  </p>
                </div>
              </div>

              {/* Goals Circle */}
              <div className="circle-card goals-circle">
                <div className="circle-inner">
                  <div className="circle-icon-wrapper">
                    <svg className="circle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="circle-title">أهدافنا</h3>
                  <p className="circle-text">
                    بناء أول شبكة موريتانية موثوقة للتبرعات وإنقاذ الأرواح
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;

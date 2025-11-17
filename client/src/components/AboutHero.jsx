// src/components/AboutHero.jsx
import React from "react";
import "./AboutHero.css";

const AboutHero = () => {
  return (
    <section className="modern-about-section">
      <div className="about-container">
        {/* Hero Header */}
        <div className="about-hero-header">
          <div className="hero-logo-container">
            <div className="logo-glow"></div>
            <img src="/logoTabaro.png" alt="تبَرُّع" className="hero-logo" />
          </div>

          <div className="platform-title">
            <h2 className="platform-name">المنصة الوطنية للتبرع</h2>
            <div className="platform-underline"></div>
          </div>

          <h1 className="hero-main-title">
            <span className="gradient-text">خيرٌ يصل… وكرامة تُصان</span>
          </h1>

          <p className="hero-description">
            أول تجربة موريتانية من نوعها – منصة رقمية متكاملة تُمكّن المواطنين
            بصفة مباشرة من التبرع وطلب التبرعات بالدم والمال والعينيات والحملات
            المجتمعية، في بيئة آمنة وشفافة تحافظ على كرامة المحتاج وتحمي
            المتبرع.
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
                    <svg
                      className="circle-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="circle-title">رؤيتنا</h3>
                  <p className="circle-text">
                    المنصة الرقمية الرائدة في موريتانيا لربط المحتاجين
                    بالمتبرعين. نعمل على تعزيز ثقافة العطاء والشفافية في المجتمع
                    الموريتاني، وبناء منظومة وطنية حديثة تجعل العطاء أسهل،
                    وأسرع، وأعمق أثرًا.
                  </p>
                </div>
              </div>

              {/* Mission Circle */}
              <div className="circle-card mission-circle">
                <div className="circle-inner">
                  <div className="circle-icon-wrapper">
                    <svg
                      className="circle-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M12 2v20"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <polyline
                        points="5 10 12 3 19 10"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h3 className="circle-title">رسالتنا</h3>
                  <p className="circle-text">
                    أن نسهّل عملية التبرع والمساعدة بين أفراد المجتمع الموريتاني
                    عبر منصة تقنية حديثة، توفر تواصلاً مباشرًا بين المحتاج وأهل
                    الخير دون وسطاء أو تعقيد، وتعتمد أعلى معايير الشفافية
                    والسرعة لحفظ الحقوق، وصون الخصوصية، وضمان وصول الدعم إلى
                    مستحقيه بكرامة واحترام.
                  </p>
                </div>
              </div>

              {/* Goals Circle */}
              <div className="circle-card goals-circle">
                <div className="circle-inner">
                  <div className="circle-icon-wrapper">
                    <svg
                      className="circle-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <circle cx="12" cy="12" r="6" strokeWidth="2" />
                      <circle
                        cx="12"
                        cy="12"
                        r="2"
                        strokeWidth="2"
                        fill="currentColor"
                      />
                      <line
                        x1="12"
                        y1="2"
                        x2="12"
                        y2="4"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="12"
                        y1="20"
                        x2="12"
                        y2="22"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="2"
                        y1="12"
                        x2="4"
                        y2="12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="20"
                        y1="12"
                        x2="22"
                        y2="12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <h3 className="circle-title">أهدافنا</h3>
                  <p className="circle-text">
                    نهدف إلى بناء منظومة خيرية رقمية تربط المتبرعين بالمحتاجين
                    مباشرة، وتسرّع الاستجابة للحالات العاجلة، خصوصًا التبرع
                    بالدم. كما نعزّز قيم التكافل المتجذّرة في المجتمع الموريتاني
                    المعروف بالعطاء واحترام الآخرين، مع ضمان الشفافية وحفظ
                    الخصوصية، ليصل الخير لمن يستحقه دون عوائق
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

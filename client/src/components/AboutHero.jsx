// src/components/AboutHero.jsx
import React from 'react';
import SectionHeader from './SectionHeader.jsx';
import './AboutHero.css';

const AboutHero = () => {
  return (
    <header className="about-hero reveal" data-animate="up">
      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-icon">🌟</span>
          <span className="badge-text">منصة تبرع الرسمية</span>
        </div>

        <SectionHeader
          id="about-title"
          title="عن منصة تبرع"
          subtitle="نربط المتبرع بالمحتاج مباشرةً عبر مسارات موثوقة وتجربة بسيطة وآمنة"
          align="start"
        />

        <div className="hero-description">
          <p className="hero-text">
            منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن.
            <span className="highlight"> نسهل خطوات التبرع ونضاعف أثره في المجتمع.</span>
          </p>

          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">🩸</span>
              <span className="feature-text">التبرع بالدم</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💳</span>
              <span className="feature-text">التبرع المالي</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎁</span>
              <span className="feature-text">التبرع العيني</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📢</span>
              <span className="feature-text">الإعلانات الاجتماعية</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-image">
        <div className="image-wrapper">
          <img
            src="/images/tabar7.jpg"
            alt="منصة تبرع - تواصل مباشر بين المتبرع والمحتاج"
            className="hero-img"
          />
          <div className="image-overlay">
            <div className="stats-overlay">
              <div className="stat">
                <span className="stat-number">1000+</span>
                <span className="stat-label">متبرع</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">حالة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AboutHero;

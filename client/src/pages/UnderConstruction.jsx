// src/pages/UnderConstruction.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UnderConstruction.css';

const UnderConstruction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  const featureName = location.state?.featureName || 'هذه الميزة';
  const featureIcon = location.state?.featureIcon || '🚧';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="under-construction-page">
      {/* خلفية متحركة */}
      <div className="animated-background">
        <div className="construction-circle circle-1"></div>
        <div className="construction-circle circle-2"></div>
        <div className="construction-circle circle-3"></div>
        <div className="construction-circle circle-4"></div>
      </div>

      <div className="construction-container">
        {/* أيقونة متحركة */}
        <div className="construction-icon-wrapper">
          <div className="icon-pulse"></div>
          <div className="construction-icon">{featureIcon}</div>
        </div>

        {/* العنوان الرئيسي */}
        <h1 className="construction-title">
          <span className="title-gradient">قيد الإنشاء</span>
        </h1>

        {/* الوصف */}
        <p className="construction-description">
          <span className="feature-highlight">{featureName}</span>
          <br />
          نعمل بجد لتوفير هذه الخدمة لك قريباً
        </p>

        {/* شريط التقدم */}
        <div className="progress-section">
          <div className="progress-label">
            <span>جارٍ التطوير</span>
            <span className="progress-percent">75%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
        </div>

        {/* ميزات قادمة */}
        <div className="coming-features">
          <div className="feature-item">
            <i className="fas fa-check-circle"></i>
            <span>تصميم عصري وسهل الاستخدام</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-check-circle"></i>
            <span>أمان وحماية متقدمة</span>
          </div>
          <div className="feature-item">
            <i className="fas fa-check-circle"></i>
            <span>تجربة سلسة وسريعة</span>
          </div>
        </div>

        {/* مؤقت العودة */}
        <div className="countdown-section">
          <p className="countdown-text">
            سيتم توجيهك للصفحة الرئيسية خلال
          </p>
          <div className="countdown-number">{countdown}</div>
          <p className="countdown-label">ثانية</p>
        </div>

        {/* أزرار الإجراءات */}
        <div className="action-buttons">
          <button className="btn-home btn-primary" onClick={handleGoHome}>
            <i className="fas fa-home"></i>
            العودة للرئيسية
          </button>
          <button className="btn-notify btn-secondary" onClick={() => alert('شكراً! سنبلغك عند الإطلاق')}>
            <i className="fas fa-bell"></i>
            أبلغني عند الإطلاق
          </button>
        </div>

        {/* معلومات التواصل */}
        <div className="contact-info">
          <p>لديك استفسار؟</p>
          <a href="mailto:support@tabaro.com" className="contact-link">
            تواصل معنا
          </a>
        </div>
      </div>

      {/* عناصر زخرفية */}
      <div className="decoration-elements">
        <div className="deco-element deco-1">🔨</div>
        <div className="deco-element deco-2">⚙️</div>
        <div className="deco-element deco-3">🚀</div>
        <div className="deco-element deco-4">💡</div>
      </div>
    </div>
  );
};

export default UnderConstruction;

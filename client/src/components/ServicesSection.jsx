// src/components/ServicesSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const ServicesSection = () => {
  const navigate = useNavigate();

  const serviceCards = [
    {
      icon: "🩸",
      title: "تبرع بالدم",
      description: "تبرع بالدم وأنقذ حياة إنسان - عملية آمنة وسريعة",
      path: "/blood-donations",
      state: { type: "blood" },
      buttonText: "تبرع الآن",
      buttonClass: "btn-accent"
    },
    {
      icon: "🆘",
      title: "طلب تبرع بالدم",
      description: "هل تحتاج متبرعاً؟ أنشئ طلباً وتواصل مع متبرعين",
      path: "/donation-requests",
      state: { type: "blood" },
      buttonText: "إنشاء طلب",
      buttonClass: "btn-accent"
    },
    {
      icon: "✅",
      title: "إعلان استعداد للتبرع",
      description: "أعلن استعدادك للتبرع وساعد المحتاجين في أي وقت",
      path: "/ready/blood",
      state: { type: "blood" },
      buttonText: "أنا مستعد",
      buttonClass: "btn-accent"
    },
    {
      icon: "💰",
      title: "تبرع مالي",
      description: "ادعم حالات إنسانية عاجلة بمساهمة مالية آمنة",
      path: "/donations",
      state: { type: "financial" },
      buttonText: "تبرع مالياً",
      buttonClass: "btn-accent"
    },
    {
      icon: "🎁",
      title: "تبرع عيني",
      description: "تبرع بملابس أو طعام أو أدوات للمحتاجين مباشرة",
      path: "/donations",
      state: { type: "in-kind" },
      buttonText: "تبرع عينياً",
      buttonClass: "btn-accent"
    },
    {
      icon: "🤝",
      title: "تطوّع",
      description: "شارك بوقتك وجهدك في أعمال خيرية ميدانية أو رقمية",
      path: "/social",
      state: { type: "volunteer" },
      buttonText: "انضم كمتطوع",
      buttonClass: "btn-accent"
    },
    {
      icon: "💡",
      title: "أفكار ومبادرات",
      description: "شارك مبادرتك الخيرية واجمع فريقاً لتحقيقها",
      path: "/social",
      state: { type: "ideas" },
      buttonText: "أضف مبادرة",
      buttonClass: "btn-accent"
    },
    {
      icon: "🔍",
      title: "مفقودات",
      description: "ساعد في البحث عن المفقودات أو أعلن عن مفقوداتك",
      path: "/under-construction",
      state: { featureName: "مفقودات", featureIcon: "🔍" },
      buttonText: "بحث/إضافة",
      buttonClass: ""
    },
    {
      icon: "🕌",
      title: "صدقة جارية",
      description: "ساهم في بناء مسجد أو بئر ماء أو مشروع خيري مستدام",
      path: "/donations",
      state: { type: "sadaqah" },
      buttonText: "ساهم الآن",
      buttonClass: "btn-accent"
    },
  ];

  return (
    <section aria-label="الخدمات المتاحة" className="services-section">
      <div className="services-grid">
        {serviceCards.map((service, index) => (
          <div key={index} className="service-card reveal" data-animate="up">
            <div className="service-content">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
            <button
              className={`service-btn ${service.buttonClass}`}
              onClick={() => navigate(service.path, { state: service.state })}
            >
              {service.buttonText}
              <i className="fas fa-arrow-left" style={{ marginRight: '0.5rem' }}></i>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;

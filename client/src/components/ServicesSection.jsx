// src/components/ServicesSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServicesSection = () => {
  const navigate = useNavigate();

  const serviceCards = [
    {
      icon: "🩸",
      title: "تبرع بالدم",
      description: "ساهم في إنقاذ الأرواح عبر تبرع آمن وسريع",
      path: "/blood-donations",
      state: { type: "blood" },
    },
    {
      icon: "🔴",
      title: "طلب تبرع بالدم",
      description: "ابحث عن متبرعين بفصيلة دم معينة لحالة عاجلة",
      path: "/donation-requests",
      state: { type: "blood" },
    },
    {
      icon: "❤️",
      title: "الإعلان عن تبرع بالدم",
      description: "أعلن عن استعدادك للتبرع بالدم وساعد المحتاجين",
      path: "/ready/blood",
      state: { type: "blood" },
    },
    {
      icon: "💳",
      title: "تبرع مالي",
      description: "ادعم حالات عاجلة بمساهمة آمنة وشفافة",
      path: "/donations",
      state: { type: "financial" },
    },
    {
      icon: "🎁",
      title: "تبرع عيني",
      description: "قدّم ملابس، طعامًا أو أدوات لتلبية احتياجات عاجلة",
      path: "/donations",
      state: { type: "in-kind" },
    },
    {
      icon: "🙋‍♂️",
      title: "تطوّع",
      description: "انضم لفرق مساعدة ميدانية أو رقمية حسب وقتك",
      path: "/social",
      state: { type: "volunteer" },
    },
    {
      icon: "💡",
      title: "أفكار ومبادرات",
      description: "شارك مبادرتك واجمع متطوعين لتنفيذها",
      path: "/social",
      state: { type: "ideas" },
    },
    {
      icon: "🔎",
      title: "مفقودات",
      description: "انشر/ابحث عن مفقودات وساعد أصحابها في استرجاعها",
      path: "/social",
      state: { type: "lost" },
    },
    {
      icon: "🤲",
      title: "صدقة جارية",
      description: "ساهم في بناء مسجد، بئر ماء، أو مشروع خيري مستمر",
      path: "/donations",
      state: { type: "sadaqah" },
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
              className="service-btn"
              onClick={() => navigate(service.path, { state: service.state })}
            >
              ابدأ الآن
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;

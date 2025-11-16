// src/pages/About.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import SectionHeader from "./SectionHeader.jsx";
import IconsSection from "./IconsSection.jsx";
import ReadyToDonateSection from "./ReadyToDonateSection.jsx";
import AboutHero from "./AboutHero.jsx";
import ContactForm from "./ContactForm.jsx";
import AboutFaq from "../pages/AboutFaq.jsx";
import "./About.css";

function About() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // ===== Scroll reveal =====
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const items = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ===== Stats numbers =====
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = root.querySelectorAll(".stat-value");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target") || "0", 10);

            if (prefersReduced) {
              el.textContent = target.toLocaleString("ar");
              observer.unobserve(el);
              return;
            }

            let current = 0;
            const steps = 50;
            const increment = target / steps;
            const duration = 1500;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current).toLocaleString("ar");
            }, duration / steps);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
  
  ];

  const stats = [
    {
      icon: "❤️",
      value: "1240",
      label: "تبرع ناجح",
      description: "ساهمنا في إنقاذ الأرواح",
    },
    {
      icon: "🚀",
      value: "85",
      label: "حملة فعالة",
      description: "لجمع التبرعات والمبادرات",
    },
    {
      icon: "✓",
      value: "530",
      label: "متبرع موثّق",
      description: "في مجتمعنا المتنامي",
    },
  ];

  return (
    <section className="about-container" aria-labelledby="about-title" ref={sectionRef}>
      <section>
        {/* ===== هيرو: عن منصة تبرع ===== */}
        <AboutHero />
        <IconsSection />
        <ReadyToDonateSection />
        
        {/* ===== الخدمات ===== */}
        <section className="separador">
          <div className="separador-content">
            <SectionHeader
              id="services-title"
              title="خدماتنا"
              subtitle="مجالات الخير المتنوعة - اختر الطريقة الأنسب لك للمساهمة في مساعدة الآخرين"
              tone="light"
            />
          </div>
        </section>

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
        {/* ===== الإحصائيات ===== */}
        <section className="separador" style={{
          background: "url('/images/gualla.png') center/cover no-repeat",
          position: "relative"
        }}>
          <div className="separador-content">
            <SectionHeader
              id="impact-title"
              title="أثرنا في المجتمع"
              subtitle="أرقام حقيقية تعكس مساهماتكم وحملاتنا الفعّالة على مدار الفترة الماضية"
              tone="green"
            />
          </div>
        </section>

        <section className="stats-section" aria-label="إحصائيات المنصة">
          
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card reveal" data-animate="up">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value" data-target={stat.value}>0</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== تواصل معنا ===== */}
        <section className="separador">
          <div className="separador-content">
            <SectionHeader
              id="form-title"
              title="تواصل معنا"
              subtitle="نستقبل استفساراتك ومقترحاتك — فريقنا يرد عادة خلال 24–48 ساعة"
              tone="light"
            />
          </div>
        </section>
        
        <ContactForm />

        {/* ===== الدعوة للإجراء ===== */}
        <section className="cta-section">
          <div className="cta-card">
            <h3 className="cta-title">ابدأ رحلتك في العطاء</h3>
            <p className="cta-text">
              انضم إلى آلاف المتبرعين والمتطوعين الذين يساهمون في صنع فرق حقيقي في المجتمع
            </p>

            <div className="cta-buttons">
              <Link to="/add-user" className="cta-btn primary">
                سجل الآن مجاناً
              </Link>
              <Link to="/donations" className="cta-btn secondary">
                تصفح التبرعات
              </Link>
            </div>
          </div>
        </section>

        {/* ===== الأسئلة الشائعة ===== */}
        <section className="separador">
          <div className="separador-content">
            <SectionHeader
              id="faq-title"
              title="أسئلة شائعة"
              subtitle="مجموعة من الإجابات المختصرة لأكثر الاستفسارات تكرارًا حول المنصة"
              tone="light"
            />
          </div>
        </section>

        <section className="faq-section" aria-labelledby="faq-title">
          <AboutFaq />
        </section>


        
      </section>
    </section>
  );
}

export default About;

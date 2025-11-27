// src/pages/About.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import SectionHeader from "./SectionHeader.jsx";
import IconsSection from "./IconsSection.jsx";
import ReadyToDonateSection from "./ReadyToDonateSection.jsx";
import AboutHero from "./AboutHero.jsx";
import ServicesSection from "./ServicesSection.jsx";
import ContactForm from "./ContactForm.jsx";
import AboutFaq from "../pages/AboutFaq.jsx";
import QuranVerse from "./QuranVerse.jsx";
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
      <AboutHero />
      <section className="separador">
        <div className="separador-content">
          <SectionHeader
            id="services-title"
            title="أبواب الخير "
            tone="light"
            subtitle="            هي فرص تتجدد للعطاء، تتنوّع فيها المبادرات وتختلف وسائل المساهمة، لكن يجمعها هدف واحد  نشر الخير وصناعة الأثر "
          />

        </div>
      </section>

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
      {/* ===== الكومبونت الخاص ب خدماتنا ===== */}
      <ServicesSection />


      {/* ===== الإحصائيات ===== */}
       <section className="separador">
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
      <section >
        <ContactForm />
      </section>
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
  );
}

export default About;

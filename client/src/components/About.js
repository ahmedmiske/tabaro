// ===== React Component المحدث =====
import React, { useEffect, useRef, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
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
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll(".stat-value");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target") || "0", 10);

            if (prefersReduced) {
              el.textContent = target.toLocaleString("ar");
              return;
            }

            let current = 0;
            const increment = target / 50;
            const duration = 1500;

            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current).toLocaleString("ar");
            }, duration / 50);

            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ===== Form state & validation =====
  const [form, setForm] = useState({ name: "", email: "", message: "", agree: false });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const rules = {
    name: (v) => v.trim().length >= 3,
    email: (v) => /^\S+@\S+\.\S+$/.test(v),
    message: (v) => v.trim().length >= 20,
    agree: (v) => v === true,
  };

  const errors = {
    name: !rules.name(form.name) ? "الاسم يجب أن لا يقل عن 3 أحرف." : "",
    email: !rules.email(form.email) ? "رجاءً أدخل بريدًا إلكترونيًا صالحًا." : "",
    message: !rules.message(form.message) ? "الرسالة يجب أن لا تقل عن 20 حرفًا." : "",
    agree: !rules.agree(form.agree) ? "يجب الموافقة على الشروط قبل الإرسال." : "",
  };

  const isValid = Object.values(errors).every((e) => e === "");

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true, agree: true });
    if (!isValid) return;
    // TODO: إرسال إلى API
    setSent(true);
  };

  const serviceCards = [
    {
      icon: "🩸",
      title: "تبرع بالدم",
      description: "ساهم في إنقاذ الأرواح عبر تبرع آمن وسريع",
      path: "/donations",
      state: { type: "blood" }
    },
    {
      icon: "💳",
      title: "تبرع مالي",
      description: "ادعم حالات عاجلة بمساهمة آمنة وشفافة",
      path: "/donations",
      state: { type: "financial" }
    },
    {
      icon: "🎁",
      title: "تبرع عيني",
      description: "قدّم ملابس، طعامًا أو أدوات لتلبية احتياجات عاجلة",
      path: "/donations",
      state: { type: "in-kind" }
    },
    {
      icon: "🙋‍♂️",
      title: "تطوّع",
      description: "انضم لفرق مساعدة ميدانية أو رقمية حسب وقتك",
      path: "/announcements",
      state: { type: "volunteer" }
    },
    {
      icon: "💡",
      title: "أفكار ومبادرات",
      description: "شارك مبادرتك واجمع متطوعين لتنفيذها",
      path: "/announcements",
      state: { type: "ideas" }
    },
    {
      icon: "🔎",
      title: "مفقودات",
      description: "انشر/ابحث عن مفقودات وساعد أصحابها في استرجاعها",
      path: "/announcements",
      state: { type: "lost" }
    }
  ];

  const stats = [
    {
      icon: "❤️",
      value: "1240",
      label: "تبرع ناجح",
      description: "ساهمنا في إنقاذ الأرواح"
    },
    {
      icon: "🚀",
      value: "85",
      label: "حملة فعالة",
      description: "لجمع التبرعات والمبادرات"
    },
    {
      icon: "✓",
      value: "530",
      label: "متبرع موثّق",
      description: "في مجتمعنا المتنامي"
    }
  ];

  const faqs = [
    {
      question: "كيف أضمن موثوقية الطلبات؟",
      answer: "نطبّق توثيق الهوية ومراجعة الوثائق، مع شارات ثقة وتاريخ آخر تحديث لكل طلب."
    },
    {
      question: "هل التبرع المالي آمن؟",
      answer: "يتم عبر قنوات آمنة ومشفّرة، مع تتبع للدفعات وعرض ملخص الاستخدام."
    },
    {
      question: "كيف أتواصل مع صاحب الطلب؟",
      answer: "من صفحة الطلب، استخدم زر \"تواصل\"—ستجد الهاتف/الواتساب بعد تحقق الصلاحيات."
    },
    {
      question: "هل يمكنني التطوع بدون خبرة سابقة؟",
      answer: "نعم، نوفر فرص تطوع تناسب جميع المستويات ونقدم التوجيه والدعم اللازم."
    },
    {
      question: "كيف أتابع حالة طلبي أو تبرعي؟",
      answer: "يمكنك متابعة حالة الطلب أو التبرع من خلال حسابك الشخصي في المنصة وستصلك إشعارات بالتحديثات."
    },
    {
      question: "هل يمكنني اقتراح خدمة أو مبادرة جديدة؟",
      answer: "بكل سرور! يمكنك إرسال اقتراحك عبر نموذج التواصل وسنقوم بدراسته والرد عليك."  
    }
  ];

  return (
    <section className="about-container" aria-labelledby="about-title" ref={sectionRef}>
      <section>
        {/* تعريف المنصة مع التصميم المبسط */}
        <header className="about-hero reveal" data-animate="up">
          <div className="hero-content">
            {<div className="hero-badge">
              <span className="badge-icon">🌟</span>
              <span className="badge-text">منصة تبرع الرسمية</span>
            </div>}

            <h1 id="about-title" className="hero-title">
              عن منصة تبرع
            </h1>

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

        {/* الخدمات */}
        <section className="separador">
          <div className="separador-content">
             <h2 className="section-title">خدماتنا</h2>
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

        {/* الإحصائيات */}
        <section className="stats-section" aria-label="إحصائيات المنصة">
          <h2 className="section-title">أثرنا في المجتمع</h2>
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
        <section className="separador">
          <div className="separador-content">
            <h3 id="form-title" className="form-title">تواصل معنا</h3>
            <p className="form-description">
              نحن هنا للإجابة على جميع استفساراتك أو ملاحظاتك. يمكنك التواصل معنا عبر النموذج أو من خلال وسائل التواصل التالية:
            </p>
          </div>
        </section>
        {/* نموذج الاتصال المحسن */}

        <section className="contact-form-section" aria-labelledby="form-title">
          <div className="form-header">

            <div className="divider" aria-hidden="true">
              <img
                src={require("../images/contactanos.png")}
                alt="تواصل معنا"
                className="divider-img"
              />
            </div>

          </div>
          <div className="form-container">
            {!sent ? (
              <Form noValidate onSubmit={handleSubmit} className="simple-form">
                <div className="form-grid">
                  <div className="form-field">
                    <Form.Label htmlFor="name">الاسم الكامل</Form.Label>
                    <Form.Control
                      id="name"
                      name="name"
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={form.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.name && !!errors.name}
                      required
                      minLength={3}
                      className="form-input"
                    />
                    <Form.Control.Feedback type="invalid" className="error-message">
                      {errors.name}
                    </Form.Control.Feedback>
                  </div>

                  <div className="form-field">
                    <Form.Label htmlFor="email">البريد الإلكتروني</Form.Label>
                    <Form.Control
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@mail.com"
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && !!errors.email}
                      required
                      className="form-input"
                    />
                    <Form.Control.Feedback type="invalid" className="error-message">
                      {errors.email}
                    </Form.Control.Feedback>
                  </div>

                  <div className="form-field full-width">
                    <Form.Label htmlFor="message">رسالتك</Form.Label>
                    <Form.Control
                      as="textarea"
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="اكتب رسالتك هنا..."
                      value={form.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.message && !!errors.message}
                      required
                      minLength={20}
                      className="form-textarea"
                    />
                    <Form.Control.Feedback type="invalid" className="error-message">
                      {errors.message}
                    </Form.Control.Feedback>
                  </div>
                </div>

                <div className="agreement-section">
                  <Form.Check
                    id="agree"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.agree && !!errors.agree}
                    required
                    className="agreement-checkbox"
                  />
                  <Form.Label htmlFor="agree" className="agreement-label">
                    أوافق على <Link to="/terms" className="terms-link">الشروط والأحكام</Link> وسياسة الخصوصية
                  </Form.Label>
                  <Form.Control.Feedback type="invalid" className="error-message">
                    {errors.agree}
                  </Form.Control.Feedback>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn" disabled={!isValid}>
                    إرسال الرسالة
                  </button>
                  <Link to="/add-user" className="secondary-btn">
                    إنشاء حساب جديد
                  </Link>
                </div>
              </Form>
            ) : (
              <div className="success-state">
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h4>تم استلام رسالتك بنجاح</h4>
                  <p>سنقوم بالرد عليك في أقرب وقت ممكن</p>
                </div>
                <div className="success-buttons">
                  <Link to="/add-user" className="submit-btn">
                    إنشاء حساب جديد
                  </Link>
                  <Link to="/donations" className="secondary-btn">
                    تصفح التبرعات
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>



        {/* الأسئلة الشائعة */}
  <section className="separador">
          <div className="separador-content">
          <h2 id="faq-title" className="section-title">أسئلة شائعة</h2>
            <p className="form-description">
              تجد هنا إجابات لأكثر الأسئلة شيوعًا حول منصتنا وخدماتنا
            </p>
          </div>
        </section>
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <details key={index} className="faq-item reveal" data-animate="up">
                <summary className="faq-question">{faq.question}</summary>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>


        {/* الدعوة للإجراء */}
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
      </section>
    </section >
  );
}

export default About;
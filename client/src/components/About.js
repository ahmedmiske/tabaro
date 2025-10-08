// ===== React Component المحدث =====
import React, { useEffect, useRef, useState } from "react";
import { Container, Form, Alert } from "react-bootstrap";
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
    }
  ];

  return (
    <section className="about-container" aria-labelledby="about-title" ref={sectionRef}>
      <Container>
        {/* تعريف المنصة مع التصميم الاحترافي */}
        <header className="about-definition reveal" data-animate="up">
          <div className="about-hero-section">
            <div className="about-hero-content">
              <div className="about-hero-badge">
                <span className="badge-icon">🌟</span>
                <span className="badge-text">منصة تبرع الرسمية</span>
              </div>
              
              <h2 id="about-title" className="about-h2 about-hero-title">
                عن منصة تبرع
                <span className="title-decoration"></span>
              </h2>
              
              <div className="about-hero-description">
                <p className="about-lead enhanced-lead">
                  منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن.
                  <span className="highlight-text">نسهل خطوات التبرع ونضاعف أثره في المجتمع.</span>
                </p>
                
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">🩸</span>
                    <span className="feature-text"><strong>التبرع بالدم</strong></span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💳</span>
                    <span className="feature-text"><strong>التبرع المالي</strong></span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎁</span>
                    <span className="feature-text"><strong>التبرع العيني</strong></span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📢</span>
                    <span className="feature-text"><strong>الإعلانات الاجتماعية</strong></span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🏛️</span>
                    <span className="feature-text"><strong>حملات الجمعيات</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="about-hero-image">
              <div className="image-container">
                <img 
                  src="/images/tabar7.jpg" 
                  alt="منصة تبرع - تواصل مباشر بين المتبرع والمحتاج" 
                  className="hero-image"
                />
                <div className="image-overlay">
                  <div className="floating-stats">
                    <div className="stat-bubble">
                      <span className="stat-number">1000+</span>
                      <span className="stat-label">متبرع</span>
                    </div>
                    <div className="stat-bubble">
                      <span className="stat-number">500+</span>
                      <span className="stat-label">حالة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* الخدمات */}
        <section aria-label="الخدمات المتاحة" className="about-content">
          <h3 className="about-h3 text-center">خدماتنا</h3>
          <div className="services-grid">
            {serviceCards.map((service, index) => (
              <div key={index} className="service-card reveal" data-animate="up">
                <div>
                  <div className="service-icon">{service.icon}</div>
                  <h4 className="service-title">{service.title}</h4>
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
        <section className="about-impact" aria-label="إحصائيات المنصة">
          <h3 className="about-h3 text-center">أثرنا في المجتمع</h3>
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

        {/* نموذج الاتصال */}
        <section className="about-form reveal" data-animate="up" aria-labelledby="form-title">
          <h3 id="form-title" className="about-h3">تواصل معنا</h3>
          {!sent ? (
            <Form noValidate onSubmit={handleSubmit} className="styled-form">
              <div className="form-group">
                <Form.Label htmlFor="name">الاسم الكامل</Form.Label>
                <Form.Control
                  id="name"
                  name="name"
                  type="text"
                  placeholder="مثال: أحمد مسكه"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.name && !!errors.name}
                  required
                  minLength={3}
                />
                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
              </div>

              <div className="form-group">
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
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </div>

              <div className="form-group full-width">
                <Form.Label htmlFor="message">رسالتك</Form.Label>
                <Form.Control
                  as="textarea"
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="اكتب رسالتك هنا..."
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.message && !!errors.message}
                  required
                  minLength={20}
                />
                <Form.Control.Feedback type="invalid">{errors.message}</Form.Control.Feedback>
              </div>

              <div className="form-check">
                <Form.Check
                  id="agree"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.agree && !!errors.agree}
                  required
                />
                <Form.Label htmlFor="agree" className="form-check-label">
                  أوافق على <Link to="/terms" className="link-terms">الشروط والأحكام</Link> وسياسة الخصوصية.
                </Form.Label>
                <Form.Control.Feedback type="invalid">{errors.agree}</Form.Control.Feedback>
              </div>

              <div className="form-actions">
                <button type="submit" className="form-submit-btn" disabled={!isValid}>
                  إرسال الرسالة
                </button>
                <Link to="/add-user" className="form-secondary-btn">
                  إنشاء حساب جديد
                </Link>
              </div>
            </Form>
          ) : (
            <>
              <Alert variant="success" className="text-center">
                <h5>✅ تم استلام رسالتك بنجاح</h5>
                <p className="mb-0">سنقوم بالرد عليك في أقرب وقت ممكن</p>
              </Alert>
              <div className="form-actions mt-3">
                <Link to="/add-user" className="form-submit-btn">
                  إنشاء حساب جديد
                </Link>
                <Link to="/donations" className="form-secondary-btn">
                  تصفح التبرعات
                </Link>
              </div>
            </>
          )}
        </section>

        {/* الأسئلة الشائعة */}
        <section className="about-faq" aria-labelledby="faq-title">
          <h3 id="faq-title" className="about-h3 text-center">أسئلة شائعة</h3>
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
        <section className="about-cta">
          <div className="cta-card">
            <h3 className="cta-title">ابدأ رحلتك في العطاء</h3>
            <p className="cta-text">
              انضم إلى آلاف المتبرعين والمتطوعين الذين يساهمون في صنع فرق حقيقي في المجتمع
            </p>
            <div className="cta-actions">
              <Link to="/add-user" className="btn btn-accent btn-lg btn-rounded">
                سجل الآن مجاناً
              </Link>
              <Link to="/donations" className="btn btn-ghost btn-lg btn-rounded">
                تصفح التبرعات
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </section>
  );
}

export default About;
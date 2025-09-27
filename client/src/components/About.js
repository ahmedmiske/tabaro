import React, { useEffect, useRef, useState } from "react";
import { Container, Card, Row, Col, Button, Form, Alert } from "react-bootstrap";
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

  // ===== Cards navigation =====
  const cardProps = (label, path) => ({
    role: "button",
    tabIndex: 0,
    onClick: () => navigate(path),
    onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && navigate(path),
    className: "info-card clickable reveal",
    "aria-label": label,
  });

  // ===== Stats numbers (respect reduced motion) =====
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = document.querySelectorAll(".kpi-value");
    els.forEach((el) => {
      const target = parseInt(el.getAttribute("data-target") || "0", 10);
      if (prefersReduced) {
        el.textContent = target.toLocaleString("ar");
        return;
      }
      let start = 0;
      const duration = 1000;
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / duration, 1);
        el.textContent = Math.floor(start + p * (target - start)).toLocaleString("ar");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
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

  return (
    <section className="about-container" aria-labelledby="about-title" ref={sectionRef}>
      <Container>
        {/* تعريف المنصة */}
        <header className="about-definition reveal" data-animate="up">
          <h2 id="about-title" className="about-h2">عن منصة تبرع</h2>
          <p className="about-lead">
            منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن.
            نسهل خطوات التبرع ونضاعف أثره في المجتمع.
          </p>
          <p>
            المنصّة تتيح طلبات <strong>التبرع بالدم</strong> و<strong>التبرع المالي</strong> و<strong>التبرع العيني</strong>،
            مع إمكانية نشر <strong>الإعلانات الاجتماعية</strong> وتنظيم <strong>حملات الجمعيات</strong>.
          </p>
        </header>

        {/* الخدمات / الأنواع (أضفنا 3 بطاقات للإعلانات الاجتماعية) */}
        <section aria-label="الخدمات المتاحة" className="about-content">
          <Row xs={1} md={3} className="g-4">
            {/* تبرع بالدم */}
            <Col className="reveal" data-animate="right">
              <Card {...cardProps("اذهب إلى صفحة التبرعات - التبرع بالدم", "/donations")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">🩸</div>
                  <Card.Title as="h3" className="card-title">تبرع بالدم</Card.Title>
                  <p>ساهم في إنقاذ الأرواح عبر تبرع آمن وسريع.</p>
                  <Button variant="outline-success" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* تبرع مالي */}
            <Col className="reveal" data-animate="up">
              <Card {...cardProps("اذهب إلى صفحة التبرعات - التبرع المالي", "/donations")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">💳</div>
                  <Card.Title as="h3" className="card-title">تبرع مالي</Card.Title>
                  <p>ادعم حالات عاجلة بمساهمة آمنة وشفافة.</p>
                  <Button variant="outline-success" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* تبرع عيني */}
            <Col className="reveal" data-animate="left">
              <Card {...cardProps("اذهب إلى صفحة التبرعات - التبرع العيني", "/donations")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">🎁</div>
                  <Card.Title as="h3" className="card-title">تبرع عيني</Card.Title>
                  <p>قدّم ملابس، طعامًا أو أدوات لتلبية احتياجات عاجلة.</p>
                  <Button variant="outline-success" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* تطوّع */}
            <Col className="reveal" data-animate="right">
              <Card {...cardProps("اذهب إلى الإعلانات الاجتماعية - التطوع", "/announcements")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">🙋‍♂️</div>
                  <Card.Title as="h3" className="card-title">تطوّع</Card.Title>
                  <p>انضم لفرق مساعدة ميدانية أو رقمية حسب وقتك.</p>
                  <Button variant="outline-success" size="sm">استكشف الفرص</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* أفكار ومبادرات */}
            <Col className="reveal" data-animate="up">
              <Card {...cardProps("اذهب إلى الإعلانات الاجتماعية - مشاركة الأفكار", "/announcements")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">💡</div>
                  <Card.Title as="h3" className="card-title">أفكار ومبادرات</Card.Title>
                  <p>شارك مبادرتك واجمع متطوعين لتنفيذها.</p>
                  <Button variant="outline-success" size="sm">شارك فكرة</Button>
                </Card.Body>
              </Card>
            </Col>

            {/* مفقودات */}
            <Col className="reveal" data-animate="left">
              <Card {...cardProps("اذهب إلى الإعلانات الاجتماعية - المفقودات", "/announcements")}>
                <div className="card-accent" aria-hidden="true" />
                <Card.Body>
                  <div className="card-icon" aria-hidden="true">🔎</div>
                  <Card.Title as="h3" className="card-title">مفقودات</Card.Title>
                  <p>انشر/ابحث عن مفقودات وساعد أصحابها في استرجاعها.</p>
                  <Button variant="outline-success" size="sm">اعرض الإعلانات</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </section>

        {/* أثر المنصة — شارات دائرية */}
        <section className="about-impact reveal" data-animate="up" aria-label="أثر المنصة بالأرقام">
          <Row xs={1} md={3} className="g-3">
            <Col>
              <div className="kpi-card" role="group" aria-label="تبرعات ناجحة">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="1240">0</div>
                </div>
                <div className="kpi-label">تبرعًا ناجحًا</div>
              </div>
            </Col>
            <Col>
              <div className="kpi-card" role="group" aria-label="حملات مفعّلة">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="85">0</div>
                </div>
                <div className="kpi-label">حملة مفعّلة</div>
              </div>
            </Col>
            <Col>
              <div className="kpi-card" role="group" aria-label="متبرعين موثّقين">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="530">0</div>
                </div>
                <div className="kpi-label">متبرعًا موثّقًا</div>
              </div>
            </Col>
          </Row>
        </section>

        {/* الاستمارة مع الشروط */}
        <section className="about-form reveal" data-animate="up" aria-labelledby="form-title">
          <h3 id="form-title" className="about-h3">استفسار سريع</h3>
          {!sent ? (
            <Form noValidate onSubmit={handleSubmit} className="styled-form">
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label htmlFor="name">الاسم الكامل</Form.Label>
                  <Form.Control
                    id="name" name="name" type="text" placeholder="مثال: أحمد مسكه"
                    value={form.name} onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={touched.name && !!errors.name} aria-describedby="nameHelp"
                    required minLength={3} className={touched.name && errors.name ? "is-invalid" : ""}
                  />
                  <div id="nameHelp" className="invalid-feedback">{errors.name}</div>
                </Col>

                <Col md={6}>
                  <Form.Label htmlFor="email">البريد الإلكتروني</Form.Label>
                  <Form.Control
                    id="email" name="email" type="email" placeholder="example@mail.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={touched.email && !!errors.email} aria-describedby="emailHelp"
                    required className={touched.email && errors.email ? "is-invalid" : ""}
                  />
                  <div id="emailHelp" className="invalid-feedback">{errors.email}</div>
                </Col>

                <Col xs={12}>
                  <Form.Label htmlFor="message">سؤالك أو استفسارك</Form.Label>
                  <Form.Control
                    as="textarea" id="message" name="message" rows={4} placeholder="اكتب رسالتك هنا…"
                    value={form.message} onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={touched.message && !!errors.message} aria-describedby="msgHelp"
                    required minLength={20} className={touched.message && errors.message ? "is-invalid" : ""}
                  />
                  <div id="msgHelp" className="invalid-feedback">{errors.message}</div>
                </Col>

                <Col xs={12} className="d-flex align-items-start gap-2">
                  <Form.Check
                    id="agree" name="agree" checked={form.agree}
                    onChange={handleChange} onBlur={handleBlur}
                    aria-invalid={touched.agree && !!errors.agree}
                    className={touched.agree && errors.agree ? "is-invalid" : ""} required
                  />
                  <Form.Label htmlFor="agree" className="m-0">
                    أوافق على <Link to="/terms" className="link-terms">الشروط والأحكام</Link> وسياسة الخصوصية.
                  </Form.Label>
                </Col>
                {touched.agree && errors.agree && (
                  <div className="invalid-feedback d-block mb-2">{errors.agree}</div>
                )}

                <Col xs={12} className="d-flex gap-2">
                  <Button type="submit" variant="success" disabled={!isValid}>إرسال</Button>
                  <Button as={Link} to="/add-user" variant="outline-secondary">التسجيل الآن</Button>
                </Col>
              </Row>
            </Form>
          ) : (
            <>
              <Alert variant="success" className="mt-3" aria-live="polite">
                ✅ تم استلام استفسارك بنجاح. سنعاود التواصل معك قريبًا.
              </Alert>
              <div className="cta-after mt-3 d-flex flex-wrap gap-2">
                <Button as={Link} to="/add-user" variant="success">سجّل وابدأ رحلتك الآن</Button>
                <Button as={Link} to="/donations" variant="outline-success">تصفّح الطلبات</Button>
              </div>
            </>
          )}
        </section>

        {/* الأسئلة الشائعة */}
        <section className="about-faq reveal" data-animate="up" aria-labelledby="faq-title">
          <h3 id="faq-title" className="about-h3">أسئلة شائعة</h3>
          <div className="faq">
            <details>
              <summary>كيف أضمن موثوقية الطلبات؟</summary>
              <p>نطبّق توثيق الهوية ومراجعة الوثائق، مع شارات ثقة وتاريخ آخر تحديث لكل طلب.</p>
            </details>
            <details>
              <summary>هل التبرع المالي آمن؟</summary>
              <p>يتم عبر قنوات آمنة ومشفّرة، مع تتبع للدفعات وعرض ملخص الاستخدام.</p>
            </details>
            <details>
              <summary>كيف أتواصل مع صاحب الطلب؟</summary>
              <p>من صفحة الطلب، استخدم زر “تواصل”—ستجد الهاتف/الواتساب بعد تحقق الصلاحيات.</p>
            </details>
          </div>
        </section>

        {/* CTA نهائي */}
        <section className="about-cta reveal" data-animate="up" aria-label="ابدأ الآن">
          <div className="cta-inner">
            <div>
              <h3 className="cta-title">ابدأ رحلتك في دقائق</h3>
              <p className="cta-text">سجّل مجانًا أو تصفّح الطلبات العاجلة الآن.</p>
            </div>
            <div className="cta-actions">
              <Button as={Link} to="/add-user" variant="success">تسجيل جديد</Button>
              <Button as={Link} to="/donations" variant="outline-success">تصفّح الطلبات</Button>
            </div>
          </div>
        </section>
      </Container>
    </section>
  );
}

export default About;

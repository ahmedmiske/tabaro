import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Button, Form, Row, Col, Alert } from "./ui";
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
    <section className="py-16 bg-bg-page" aria-labelledby="about-title" ref={sectionRef}>
      <Container>
        {/* تعريف المنصة */}
        <header className="text-center mb-16 reveal" data-animate="up">
          <h2 id="about-title" className="text-4xl font-bold text-text-color mb-6">عن منصة تبرع</h2>
          <p className="text-xl text-text-muted mb-4 max-w-4xl mx-auto leading-relaxed">
            منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن.
            نسهل خطوات التبرع ونضاعف أثره في المجتمع.
          </p>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            المنصّة تتيح طلبات <strong className="text-ui-primary">التبرع بالدم</strong> و<strong className="text-ui-primary">التبرع المالي</strong> و<strong className="text-ui-primary">التبرع العيني</strong>،
            مع إمكانية نشر <strong className="text-ui-accent">الإعلانات الاجتماعية</strong> وتنظيم <strong className="text-ui-accent">حملات الجمعيات</strong>.
          </p>
        </header>

        {/* الخدمات / الأنواع */}
        <section aria-label="الخدمات المتاحة" className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* تبرع بالدم */}
            <div className="reveal" data-animate="right">
              <Card 
                {...cardProps("اذهب إلى صفحة التبرعات - التبرع بالدم", "/donations")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-red-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">🩸</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">تبرع بالدم</h3>
                  <p className="text-text-muted mb-6">ساهم في إنقاذ الأرواح عبر تبرع آمن وسريع.</p>
                  <Button variant="outline" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </div>

            {/* تبرع مالي */}
            <div className="reveal" data-animate="up">
              <Card 
                {...cardProps("اذهب إلى صفحة التبرعات - التبرع المالي", "/donations")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-green-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">💳</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">تبرع مالي</h3>
                  <p className="text-text-muted mb-6">ادعم حالات عاجلة بمساهمة آمنة وشفافة.</p>
                  <Button variant="outline" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </div>

            {/* تبرع عيني */}
            <div className="reveal" data-animate="left">
              <Card 
                {...cardProps("اذهب إلى صفحة التبرعات - التبرع العيني", "/donations")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-blue-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">🎁</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">تبرع عيني</h3>
                  <p className="text-text-muted mb-6">قدّم ملابس، طعامًا أو أدوات لتلبية احتياجات عاجلة.</p>
                  <Button variant="outline" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </div>

            {/* تطوّع */}
            <div className="reveal" data-animate="right">
              <Card 
                {...cardProps("اذهب إلى الإعلانات الاجتماعية - التطوع", "/announcements")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-purple-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">🙋‍♂️</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">تطوّع</h3>
                  <p className="text-text-muted mb-6">انضم لفرق مساعدة ميدانية أو رقمية حسب وقتك.</p>
                  <Button variant="outline" size="sm">استكشف الفرص</Button>
                </Card.Body>
              </Card>
            </div>

            {/* أفكار ومبادرات */}
            <div className="reveal" data-animate="up">
              <Card 
                {...cardProps("اذهب إلى الإعلانات الاجتماعية - مشاركة الأفكار", "/announcements")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-yellow-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">💡</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">أفكار ومبادرات</h3>
                  <p className="text-text-muted mb-6">شارك مبادرتك واجمع متطوعين لتنفيذها.</p>
                  <Button variant="outline" size="sm">شارك فكرة</Button>
                </Card.Body>
              </Card>
            </div>

            {/* مفقودات */}
            <div className="reveal" data-animate="left">
              <Card 
                {...cardProps("اذهب إلى الإعلانات الاجتماعية - المفقودات", "/announcements")}
                className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-t-4 border-t-orange-500"
                shadow="md"
              >
                <Card.Body className="text-center p-8">
                  <div className="text-6xl mb-4" aria-hidden="true">🔎</div>
                  <h3 className="text-xl font-bold text-text-color mb-3">مفقودات</h3>
                  <p className="text-text-muted mb-6">انشر/ابحث عن مفقودات وساعد أصحابها في استرجاعها.</p>
                  <Button variant="outline" size="sm">اعرض الإعلانات</Button>
                </Card.Body>
              </Card>
            </div>
          </div>
        </section>

        {/* أثر المنصة — شارات دائرية */}
        <section className="about-impact reveal" data-animate="up" aria-label="أثر المنصة بالأرقام">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="kpi-card" role="group" aria-label="تبرعات ناجحة">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="1240">0</div>
                </div>
                <div className="kpi-label">تبرعًا ناجحًا</div>
              </div>
            </div>
            <div>
              <div className="kpi-card" role="group" aria-label="حملات مفعّلة">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="85">0</div>
                </div>
                <div className="kpi-label">حملة مفعّلة</div>
              </div>
            </div>
            <div>
              <div className="kpi-card" role="group" aria-label="متبرعين موثّقين">
                <div className="kpi-ring">
                  <div className="kpi-value" data-target="530">0</div>
                </div>
                <div className="kpi-label">متبرعًا موثّقًا</div>
              </div>
            </div>
          </div>
        </section>

        {/* الاستمارة مع الشروط */}
        <section className="about-form reveal" data-animate="up" aria-labelledby="form-title">
          <h3 id="form-title" className="about-h3">استفسار سريع</h3>
          {!sent ? (
            <Form onSubmit={handleSubmit} className="styled-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Form.Label htmlFor="name" required>الاسم الكامل</Form.Label>
                  <Form.Control
                    id="name" name="name" type="text" placeholder="مثال: أحمد مسكه"
                    value={form.name} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                    required
                  />
                  {touched.name && errors.name && (
                    <Form.Text variant="danger">{errors.name}</Form.Text>
                  )}
                </div>

                <div>
                  <Form.Label htmlFor="email" required>البريد الإلكتروني</Form.Label>
                  <Form.Control
                    id="email" name="email" type="email" placeholder="example@mail.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email}
                    required
                  />
                  {touched.email && errors.email && (
                    <Form.Text variant="danger">{errors.email}</Form.Text>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Form.Label htmlFor="message" required>سؤالك أو استفسارك</Form.Label>
                  <Form.Textarea
                    id="message" name="message" rows={4} placeholder="اكتب رسالتك هنا…"
                    value={form.message} onChange={handleChange} onBlur={handleBlur}
                    isInvalid={touched.message && !!errors.message}
                    required
                  />
                  {touched.message && errors.message && (
                    <Form.Text variant="danger">{errors.message}</Form.Text>
                  )}
                </div>

                <div className="md:col-span-2 flex items-start gap-2">
                  <Form.Check
                    id="agree" name="agree" checked={form.agree}
                    onChange={handleChange} onBlur={handleBlur}
                    required
                  />
                  <Form.Label htmlFor="agree" className="text-sm">
                    أوافق على <Link to="/terms" className="text-ui-primary hover:underline">الشروط والأحكام</Link> وسياسة الخصوصية.
                  </Form.Label>
                </div>
                {touched.agree && errors.agree && (
                  <Form.Text variant="danger" className="md:col-span-2">{errors.agree}</Form.Text>
                )}

                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2">
                  <Button type="submit" variant="primary" disabled={!isValid}>إرسال</Button>
                  <Button as={Link} to="/add-user" variant="outline">التسجيل الآن</Button>
                </div>
              </div>
            </Form>
          ) : (
            <>
              <Alert variant="success" className="mt-4">
                ✅ تم استلام استفسارك بنجاح. سنعاود التواصل معك قريبًا.
              </Alert>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button as={Link} to="/add-user" variant="primary">سجّل وابدأ رحلتك الآن</Button>
                <Button as={Link} to="/donations" variant="outline">تصفّح الطلبات</Button>
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
            <div className="cta-actions flex flex-col sm:flex-row gap-3">
              <Button as={Link} to="/add-user" variant="primary">تسجيل جديد</Button>
              <Button as={Link} to="/donations" variant="outline">تصفّح الطلبات</Button>
            </div>
          </div>
        </section>
      </Container>
    </section>
  );
}

export default About;

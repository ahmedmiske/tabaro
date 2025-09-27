import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import './LandingPage.css';
import About from '../components/About';
import useSEO from '../hooks/useSEO';

function LandingPage() {
  useSEO({
    title: 'تبرع | تواصل مباشر بين المتبرع والمتعفف',
    description:
      'منصّة تربط المتبرعين بالمتعففين مباشرةً: تبرعات الدم، المالية، والمساعدات الاجتماعية. سجّل الآن وابدأ الخير.',
    canonical: 'https://example.com/',
    lang: 'ar',
    dir: 'rtl',
    meta: {
      'og:type': 'website',
      'og:title': 'منصّة التبرعات',
      'og:description': 'تواصل مباشر بين المتبرع والمتعفف — الجسر الذي يربط الخير بأهله.',
      'og:url': 'https://example.com/',
      'og:image': 'https://example.com/og-image.jpg',
      'twitter:card': 'summary_large_image',
    },
  });

  return (
    <>
      {/* وصلة تخطي للمحتوى (وصولية) */}
      <a className="skip-link" href="#main">تخطّي إلى المحتوى</a>

      {/* ===== بطل الصفحة (Hero) ===== */}
      <header className="landing-page" id="top" role="banner" aria-label="القسم الافتتاحي">
        <div className="container-landing">
          <Card className="card-landing shadow-lg" as="section" aria-labelledby="hero-title">
            <Card.Body>
              <div className="hero-content">
                <h1 id="hero-title" className="landing-title">
                  تواصل مباشر بين <span className="highlight">المتبرع والمتعفف</span>
                </h1>

                <p className="lead-text">معًا… نصل الخير بمن يستحق.</p>
                <p className="lead-text">الجسر الذي يربط الخير بأهله.</p>

                {/* أزرار الإجراءات الرئيسية */}
                <div className="link-card" role="group" aria-label="روابط الإجراءات الرئيسية">
                  <Link to="/add-user" className="btn go-landing" aria-label="ابدأ التسجيل كمستخدم جديد">
                    ابدأ رحلتك الآن
                  </Link>
                  <Link to="/login" className="btn log-landing" aria-label="انتقال إلى صفحة تسجيل الدخول">
                    تسجيل الدخول
                  </Link>
                </div>

                {/* سهم الانتقال للأسفل */}
                <div className="scroll-down" aria-hidden="true">
                  <a href="#about" className="scroll-link" aria-label="الانتقال إلى قسم التعريف">
                    <i className="fas fa-chevron-down" />
                  </a>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </header>

      {/* ===== المحتوى الرئيسي ===== */}
      <main id="main" tabIndex={-1}>
        <section className="about-section" id="about" aria-label="عن المنصّة">
          <About />
        </section>
      </main>
    </>
  );
}

export default LandingPage;

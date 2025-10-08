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

      {/* ===== بطل الصفحة (Hero) ===== */}
      <header className="landing-page" id="top" role="banner" aria-label="القسم الافتتاحي">
        <div className="container-landing">
          <div className="hero-content">
            <h1 id="hero-title" className="landing-title">
              تواصل مباشر بين المتبرع والمتعفف
            </h1>

            <p className="lead-text">نربط الأيدي البيضاء بالقلوب المحتاجة
            </p>

            {/* أزرار الإجراءات الرئيسية */}
            <div className="buttons-container" role="group" aria-label="روابط الإجراءات الرئيسية">
              <Link to="/add-user" className="hero-btn-primary" aria-label="ابدأ التسجيل كمستخدم جديد">
                ابدأ رحلتك الآن
              </Link>
              <Link to="/login" className="hero-btn-secondary" aria-label="انتقال إلى صفحة تسجيل الدخول">
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

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import About from '../components/About.js';
import ReadyToDonateSection from '../components/ReadyToDonateSection.jsx';
import useSEO from '../hooks/useSEO.js';
import IconsSection from '../components/IconsSection.jsx';
import CarouselHero from '../components/CarouselHero.jsx';

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

  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }, []);
  const isAuthed = !!user;

  const displayName = useMemo(() => {
    if (!user) return '';
    const fn = user.firstName || user.given_name || '';
    return (fn || user.username || user.email || 'مرحبًا').toString();
  }, [user]);

  const heroScrollTargetId = isAuthed ? 'quick-start' : 'about';

  const handleScrollClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(heroScrollTargetId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // غلاف خاص بالصفحة: يفعّل متغيرات الألوان ويعزل التنسيق
    <div className="lp" data-page="landing">
      {/* ===== الهيرو ===== */}
      <header className="lp-hero" id="top" role="banner" aria-label="القسم الافتتاحي" style={{position: 'relative', overflow: 'hidden'}}>
        <CarouselHero />
        <div className="lp-container" style={{position: 'relative', zIndex: 2}}>
          <div className="lp-hero-content">
            <h1 id="hero-title" className="lp-title">
              {isAuthed ? `مرحبًا ${displayName}! لنُكمِل الخير معًا` : 'تواصل مباشر بين المتبرع والمتعفف'}
            </h1>

            <p className="lp-lead">
              {isAuthed
                ? 'إدارة تبرعاتك، متابعة طلبات المحتاجين، والانضمام للحملات بنقرة واحدة.'
                : 'نربط الأيدي البيضاء بالقلوب المحتاجة'}
            </p>

            <div className="lp-actions" role="group" aria-label="روابط الإجراءات الرئيسية">
              {isAuthed ? (
                <>
                  <Link to="/dashboard" className="lp-btn lp-btn-primary" aria-label="الانتقال إلى لوحة التحكم">
                    إلى لوحة التحكم
                  </Link>
                  <Link to="/donations" className="lp-btn lp-btn-secondary" aria-label="استكشاف الطلبات">
                    استكشف الطلبات
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/add-user" className="lp-btn lp-btn-primary" aria-label="ابدأ التسجيل كمستخدم جديد">
                    ابدأ رحلتك الآن
                  </Link>
                  <Link to="/login" className="lp-btn lp-btn-secondary" aria-label="انتقال إلى صفحة تسجيل الدخول">
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            {/* سهم النزول يعمل في الحالتين */}
            <div className="lp-scroll" aria-hidden="true">
              <a
                href={`#${heroScrollTargetId}`}
                className="lp-scroll-link"
                aria-label="الانتقال للأسفل"
                onClick={handleScrollClick}
              >
                <i className="fas fa-chevron-down" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ===== المحتوى الرئيسي ===== */}
      <main id="main" tabIndex={-1}>
        {/* الزائر: About — المستخدم: بداية سريعة */}
        {isAuthed ? (
          <section
            className="lp-section lp-quick-start lp-anchor-target"
            id="quick-start"
            aria-label="مقترحات للمستخدم"
          >
         
            {/* <div className="lp-container lp-center">
              <h2 className="lp-qs-title">ابدأ بسرعة</h2>
              <div className="lp-qs-grid">
                <Link className="lp-btn lp-btn-secondary on-light" to="/ready/blood">
                  إعلان استعداد للتبرع بالدم
                </Link>
                <Link className="lp-btn lp-btn-secondary on-light" to="/donation-requests">
                  إضافة طلب تبرع
                </Link>
                <Link className="lp-btn lp-btn-secondary on-light" to="/campaigns">
                  الانضمام لحملة
                </Link>
              </div>
            </div> */}
            <About />
          </section>
        ) : (
          <section className="lp-section lp-about lp-anchor-target" id="about" aria-label="عن المنصّة">
            <About />
          </section>
        )}

          

      
      </main>
    </div>
  );
}

export default LandingPage;
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import About from '../components/About';
import ReadyToDonateSection from '../components/ReadyToDonateSection.jsx';
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

  // الهدف الذي يذهب إليه سهم النزول
  const heroScrollTargetId = isAuthed ? 'quick-start' : 'about';

  const handleScrollClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(heroScrollTargetId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ===== الهيرو ===== */}
      <header className="landing-page" id="top" role="banner" aria-label="القسم الافتتاحي">
        <div className="container-landing">
          <div className="hero-content">
            <h1 id="hero-title" className="landing-title">
              {isAuthed ? `مرحبًا ${displayName}! لنُكمِل الخير معًا` : 'تواصل مباشر بين المتبرع والمتعفف'}
            </h1>

            <p className="lead-text">
              {isAuthed
                ? 'إدارة تبرعاتك، متابعة طلبات المحتاجين، والانضمام للحملات بنقرة واحدة.'
                : 'نربط الأيدي البيضاء بالقلوب المحتاجة'}
            </p>

            <div className="buttons-container" role="group" aria-label="روابط الإجراءات الرئيسية">
              {isAuthed ? (
                <>
                  <Link to="/dashboard" className="hero-btn-primary" aria-label="الانتقال إلى لوحة التحكم">
                    إلى لوحة التحكم
                  </Link>
                  <Link to="/donations" className="hero-btn-secondary" aria-label="استكشاف الطلبات">
                    استكشف الطلبات
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/add-user" className="hero-btn-primary" aria-label="ابدأ التسجيل كمستخدم جديد">
                    ابدأ رحلتك الآن
                  </Link>
                  <Link to="/login" className="hero-btn-secondary" aria-label="انتقال إلى صفحة تسجيل الدخول">
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            {/* سهم النزول يعمل في الحالتين */}
            <div className="scroll-down" aria-hidden="true">
              <a
                href={`#${heroScrollTargetId}`}
                className="scroll-link"
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
        {/* الزائر: About كما هو — المستخدم: قسم بداية سريعة */}
        {isAuthed ? (
          <section
            className="about-section anchor-target quick-start"
            id="quick-start"
            aria-label="مقترحات للمستخدم"
          >
            <div className="container-landing" style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ marginBottom: 16 }}>ابدأ بسرعة</h2>
              <div
                style={{
                  display: 'grid',
                  gap: 16,
                  gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                }}
              >
                {/* زرّان ثانويان بخلفية فاتحة => on-light لضمان تباين النص */}
                <Link className="hero-btn-secondary on-light" to="/ready/blood">
                  إعلان استعداد للتبرع بالدم
                </Link>
                <Link className="hero-btn-secondary on-light" to="/donation-requests">
                  إضافة طلب تبرع
                </Link>
                <Link className="hero-btn-secondary on-light" to="/campaigns">
                  الانضمام لحملة
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="about-section anchor-target" id="about" aria-label="عن المنصّة">
            <About />
          </section>
        )}

        <ReadyToDonateSection />
      </main>
    </>
  );
}

export default LandingPage;

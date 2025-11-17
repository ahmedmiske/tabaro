// src/pages/LandingPage.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import useSEO from "../hooks/useSEO.js";

import About from "../components/About.jsx";
import CarouselHero from "../components/CarouselHero.jsx";

import "./LandingPage.css";

function LandingPage() {
  useSEO({
    title: "تبرع | تواصل مباشر بين المتبرع والمتعفّف",
    description:
      "منصّة تربط أهل الخير بالمحتاجين مباشرة: تبرع بالدم، دعم الأسر، إعمار المساجد، وكفالة طلاب العلم.",
    canonical: "https://example.com/",
    lang: "ar",
    dir: "rtl",
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const isAuthed = !!user;

  const heroScrollTargetId = isAuthed ? "quick-start" : "about";

  const handleScrollClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(heroScrollTargetId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ✅ الشريحة الحالية من الكاروسيل
  const [activeSlide, setActiveSlide] = useState(0);

  // ✅ النصوص المرتبطة بالصور (7 شرائح)
  // الترتيب يجب أن يطابق ترتيب الصور في CarouselHero
  const captions = useMemo(
    () => [
      // 1) منارة مسجد - دعم بيوت الله
      {
        visitor: {
          title: "ادعم بيوت الله… وأبقِ نورها قائمًا",
          text: "ساهم في إعمار المساجد والمحاظر، ودع طلبات الدعم تصل مباشرة إلى أهل الخير.",
        },
        user: {
          title: "شارك في إعمار المساجد والمحاظر",
          text: "من حسابك يمكنك دعم مشاريع المساجد والمحاظر ومساندة من يخدمون بيوت الله مباشرة.",
        },
      },
      // 2) امرأة تدعو بعد الصلاة
      {
        visitor: {
          title: "بيدك قد تُجاب دعوة محتاج",
          text: "انضم للمنصة وكن سببًا في تفريج كربة من يدعو الله سرًا، عبر تواصل مباشر وآمن.",
        },
        user: {
          title: "كن سببًا في فرج دعوة صادقة",
          text: "تصفّح الطلبات واختر من تحب أن تساعده، لتصل مساعدتك مباشرة لصاحب الحاجة.",
        },
      },
      // 3) قطرة دم - التبرع بالدم
      {
        visitor: {
          title: "قطرة دم منك… حياة لغيرك",
          text: "سجّل استعدادك للتبرع بالدم، ودع المحتاجين يصلون إليك بسهولة وأمان.",
        },
        user: {
          title: "هل أنت مستعد لإنقاذ حياة؟",
          text: "تابع طلبات التبرع بالدم أو أعلن استعدادك الآن، ليتم التواصل معك مباشرة من أصحاب الحاجة.",
        },
      },
      // 4) هدايا - تبرعات عينية
      {
        visitor: {
          title: "هديتك الصغيرة… تصنع فرقًا كبيرًا",
          text: "قدّم ملابس أو غذاء أو لوازم ضرورية، لتصل مباشرة إلى الأسر الأكثر حاجة.",
        },
        user: {
          title: "حوّل فائض أغراضك إلى فرصة لغيرك",
          text: "أضف تبرعًا عينيًا، ودع الأسر المحتاجة تتواصل معك مباشرة لاستلام المساعدة.",
        },
      },
      // 5) صلاة أو دعاء - صدقات وتفريج كرب
      {
        visitor: {
          title: "كن سببًا في تفريج كربة",
          text: "صدقتك تصل إلى مستحقيها بكرامة وخصوصية، عبر تواصل مباشر بينك وبين المحتاج.",
        },
        user: {
          title: "رتّب صدقاتك من مكان واحد",
          text: "من حسابك يمكنك متابعة طلبات المحتاجين، ودعم أقرب الحالات إلى قلبك بسهولة.",
        },
      },
      // 6) التعليم - دعم طلاب العلم
      {
        visitor: {
          title: " ادعم طالبًا… تُنِر مستقبلا",
          text: "ساعد في تغطية رسوم دراسة أو لوازم تعليمية، ليصل دعمك مباشرة لطالب العلم.",
        },
        user: {
          title: "كن شريكًا في رحلة طالب علم",
          text: "اختر حالة تعليمية وادعمها، وتابع أثر مساهمتك على مسار الطالب.",
        },
      },
      // 7) قلب بين الأيادي - التكافل والرحمة
      {
        visitor: {
          title: "الخير بين يديك… دع أثره يمتد",
          text: "منصتنا تمكّن المحتاج من عرض طلبه، وتمكّنك من الوصول إليه والتواصل معه مباشرة.",
        },
        user: {
          title: "انضم إلى مجتمع يتقاسم الرحمة والتكافل",
          text: "استكشف الطلبات، أطلق مبادراتك، ودع عطاءك يصل مباشرة لمن ينتظره.",
        },
      },
    ],
    []
  );

  // ✅ اختيار النص حسب الشريحة وحالة المستخدم
  const currentCaption =
    captions[activeSlide] || captions[0] || { visitor: { title: "", text: "" }, user: { title: "", text: "" } };

  const heroTitle = isAuthed ? currentCaption.user.title : currentCaption.visitor.title;
  const heroLead = isAuthed ? currentCaption.user.text : currentCaption.visitor.text;

  return (
    <div className="lp" data-page="landing">
      {/* ===== الهيرو ===== */}
      <header
        className="lp-hero"
        id="top"
        role="banner"
        aria-label="القسم الافتتاحي"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* الخلفية المتحركة بالصور */}
        <CarouselHero onSlideChange={setActiveSlide} />

        <div className="lp-container" style={{ position: "relative", zIndex: 2 }}>
          <div className="lp-hero-content">
            <h1 id="hero-title" className="lp-title">
              {heroTitle}
            </h1>

            <p className="lp-lead">{heroLead}</p>

            <div className="lp-actions" role="group" aria-label="روابط الإجراءات الرئيسية">
              {isAuthed ? (
                <>
                  <Link to="/dashboard" className="lp-btn lp-btn-primary">
                    لوحة التحكم
                  </Link>
                  <Link
  to={activeSlide === 2 ? "/blood-donations" : "/donations"}
  className="lp-btn lp-btn-secondary"
>
  {activeSlide === 2 ? "استكشف طلبات التبرع بالدم" : "استكشف الطلبات"}
</Link>

                </>
              ) : (
                <>
                  <Link to="/add-user" className="lp-btn lp-btn-primary">
                    سجّل الآن لتنضم إلى قافلة الخير
                  </Link>
                  <Link to="/login" className="lp-btn lp-btn-secondary">
                    لديَّ حساب بالفعل
                  </Link>
                </>
              )}
            </div>

            {/* سهم النزول */}
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
        {isAuthed ? (
          <section
            className="lp-section lp-quick-start lp-anchor-target"
            id="quick-start"
            aria-label="مقترحات للمستخدم"
          >
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

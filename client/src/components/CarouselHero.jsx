// src/components/CarouselHero.jsx
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import "./CarouselHero.css";

// الشرائح (كل صورة مع وصف واضح)
const slides = [
  {
    src: "/images/carrusel-2.jpg",
    alt: "منارة مسجد تعبّر عن إعمار بيوت الله",
  },
  {
    src: "/images/carrusel-3.jpg",
    alt: "امرأة تدعو بعد الصلاة تعبّر عن الدعاء وتفريج الكربات",
  },
  {
    src: "/images/carrusel-6.png",
    alt: "قطرة دم تعبّر عن التبرع بالدم وإنقاذ الأرواح",
  },
  {
    src: "/images/carruse-7.png",
    alt: "هدايا تعبّر عن التبرعات العينية ومشاركة الخير",
  },
  {
    src: "/images/carruse-10.png",
    alt: "شخص يرفع يديه بالدعاء تعبّر عن الصدقات وتفريج الكرب",
  },
  {
    src: "/images/carruse-11.png",
    alt: "كتاب ووسائل تعليم تعبّر عن دعم طلاب العلم",
  },
  {
    src: "/images/carruse-14.jpg",
    alt: "قلب بين الأيادي تعبّر عن الرحمة والتكافل بين أفراد المجتمع",
  },
];

const AUTO_PLAY_DELAY = 7000; // 7 ثواني

const CarouselHero = ({ onSlideChange }) => {
  const [current, setCurrent] = useState(0);
  const total = slides.length;

  const goToSlide = (index) => {
    const normalized = ((index % total) + total) % total;
    setCurrent(normalized);
    if (onSlideChange) onSlideChange(normalized);
  };

  const goNext = () => {
    goToSlide(current + 1);
  };

  const goPrev = () => {
    goToSlide(current - 1);
  };

  // تشغيل تلقائي بسيط وثابت
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % total;
        if (onSlideChange) onSlideChange(next);
        return next;
      });
    }, AUTO_PLAY_DELAY);

    return () => clearInterval(interval);
  }, [onSlideChange, total]);

  return (
    <section
      className="carousel-hero-bg"
      role="region"
      aria-roledescription="carousel"
      aria-label="شرائح تصف مجالات التبرع في المنصة"
    >
      {/* الصور الخلفية */}
      {slides.map((slide, idx) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`carousel-hero-img${current === idx ? " active" : ""}`}
          aria-hidden="true"
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* أزرار السابق / التالي */}
      <button
        type="button"
        className="carousel-hero-control prev"
        onClick={goPrev}
        aria-label="الشريحة السابقة"
      >
        ‹
      </button>

      <button
        type="button"
        className="carousel-hero-control next"
        onClick={goNext}
        aria-label="الشريحة التالية"
      >
        ›
      </button>

      {/* النقاط السفلية */}
      <div
        className="carousel-hero-indicators"
        role="tablist"
        aria-label="اختيار شريحة"
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={current === idx ? "active" : ""}
            onClick={() => goToSlide(idx)}
            role="tab"
            aria-selected={current === idx}
            aria-label={`الانتقال إلى الشريحة رقم ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

CarouselHero.propTypes = {
  onSlideChange: PropTypes.func,
};

export default CarouselHero;

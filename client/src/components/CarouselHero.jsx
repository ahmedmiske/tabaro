import React, { useState, useEffect } from 'react';
import './CarouselHero.css';

const images = [
  '/images/carrusel-2.jpg',
  '/images/carrusel-3.jpg', 
  '/images/carrusel-6.png', 
  '/images/carruse-7.png', 
  '/images/carruse-10.png', 
  '/images/carruse-11.png', 
  '/images/carruse-14.jpg', 
];

const CarouselHero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-hero-bg">
      {images.map((img, idx) => (
        <img
          key={img}
          src={img}
          alt={`خلفية ${idx + 1}`}
          className={`carousel-hero-img${current === idx ? ' active' : ''}`}
          aria-hidden={current !== idx}
        />
      ))}
      <div className="carousel-hero-indicators">
        {images.map((_, idx) => (
          <span key={idx} className={current === idx ? 'active' : ''} />
        ))}
      </div>
    </div>
  );
};

export default CarouselHero;

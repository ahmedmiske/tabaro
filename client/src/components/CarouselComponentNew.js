import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';

function CarouselComponent({ 
  images = [], 
  autoPlay = true, 
  interval = 5000, 
  showIndicators = true, 
  showControls = true,
  height = '400px'
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // إضافة أنماط CSS للانيميشن
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Default images if none provided
  const defaultImages = [
    {
      src: '/images/tabar1.jpg',
      alt: 'صورة من حملة التبرع بالدم 1',
      title: 'إنقاذ الأرواح',
      description: 'كل قطرة دم تعني حياة جديدة'
    },
    {
      src: '/images/tabar2.jpg',
      alt: 'صورة من حملة التبرع بالدم 2',
      title: 'التبرع بالدم',
      description: 'عطاؤك يصنع الفرق'
    },
    {
      src: '/images/tabar3.jpg',
      alt: 'صورة من حملة التبرع بالدم 3',
      title: 'أبطال حقيقيون',
      description: 'المتبرعون هم الأبطال الحقيقيون في مجتمعنا'
    }
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  }, [displayImages.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  }, [displayImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto play functionality
  useEffect(() => {
    if (isPlaying && displayImages.length > 1) {
      intervalRef.current = setInterval(nextSlide, interval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, nextSlide, interval, displayImages.length]);

  // Touch/Mouse drag handlers
  const handleStart = (e) => {
    setIsDragging(true);
    const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    
    setTranslateX(0);
  };

  const containerStyles = {
    position: 'relative',
    width: '100%',
    height: height,
    overflow: 'hidden',
    borderRadius: '1rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#f9fafb',
    userSelect: 'none'
  };

  const slidesContainerStyles = {
    display: 'flex',
    width: `${displayImages.length * 100}%`,
    height: '100%',
    transform: `translateX(${(-currentIndex * 100) / displayImages.length}%) ${isDragging ? `translateX(${translateX}px)` : ''}`,
    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  const slideStyles = {
    flex: `0 0 ${100 / displayImages.length}%`,
    height: '100%',
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const overlayStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textAlign: 'center',
    padding: '2rem'
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 900,
    marginBottom: '0.5rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    opacity: 0,
    transform: 'translateY(20px)',
    animation: 'fadeInUp 0.6s ease forwards 0.2s'
  };

  const descriptionStyles = {
    fontSize: '1.25rem',
    fontWeight: 400,
    maxWidth: '600px',
    lineHeight: 1.6,
    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
    opacity: 0,
    transform: 'translateY(20px)',
    animation: 'fadeInUp 0.6s ease forwards 0.4s'
  };

  const controlButtonStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '3rem',
    height: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#374151',
    fontSize: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    zIndex: 10
  };

  const prevButtonStyles = {
    ...controlButtonStyles,
    right: '1rem'
  };

  const nextButtonStyles = {
    ...controlButtonStyles,
    left: '1rem'
  };

  const indicatorsContainerStyles = {
    position: 'absolute',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    zIndex: 10
  };

  const indicatorStyles = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid white',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const activeIndicatorStyles = {
    ...indicatorStyles,
    backgroundColor: 'white',
    transform: 'scale(1.2)'
  };

  const playButtonStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#374151',
    marginLeft: '0.5rem'
  };

  if (displayImages.length === 0) {
    return (
      <div style={containerStyles}>
        <div style={{ ...overlayStyles, background: '#f3f4f6' }}>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            لا توجد صور للعرض
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={containerStyles}
      ref={containerRef}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div style={slidesContainerStyles}>
        {displayImages.map((image, index) => (
          <div
            key={index}
            style={{
              ...slideStyles,
              backgroundImage: `url(${image.src || image})`
            }}
          >
            {(image.title || image.description) && (
              <div style={overlayStyles}>
                {image.title && (
                  <h2 style={titleStyles}>{image.title}</h2>
                )}
                {image.description && (
                  <p style={descriptionStyles}>{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showControls && displayImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={prevButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="الصورة السابقة"
          >
            <FiChevronRight />
          </button>

          <button
            onClick={nextSlide}
            style={nextButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
            aria-label="الصورة التالية"
          >
            <FiChevronLeft />
          </button>
        </>
      )}

      {showIndicators && displayImages.length > 1 && (
        <div style={indicatorsContainerStyles}>
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={currentIndex === index ? activeIndicatorStyles : indicatorStyles}
              onMouseEnter={(e) => {
                if (currentIndex !== index) {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentIndex !== index) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              aria-label={`الانتقال إلى الصورة ${index + 1}`}
            />
          ))}
          
          {autoPlay && (
            <button
              onClick={togglePlayPause}
              style={playButtonStyles}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'scale(1)';
              }}
              aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل التشغيل التلقائي'}
            >
              {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CarouselComponent;
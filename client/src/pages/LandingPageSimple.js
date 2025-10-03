import React, { useEffect, useRef, useState } from 'react';
import { FiDroplet, FiHeart, FiUsers, FiTrendingUp, FiStar, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

function LandingPageSimple() {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    donors: 0,
    donations: 0,
    lives: 0,
    hospitals: 0
  });
  
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCounters = () => {
    const targets = { donors: 1000, donations: 500, lives: 200, hospitals: 50 };
    const duration = 2000;
    const interval = 50;
    const steps = duration / interval;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        donors: Math.floor(targets.donors * progress),
        donations: Math.floor(targets.donations * progress),
        lives: Math.floor(targets.lives * progress),
        hospitals: Math.floor(targets.hospitals * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, interval);
  };

  return (
    <main style={{ 
      minHeight: '100vh', 
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.6,
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <section style={{
        color: 'white',
        padding: '120px 20px',
        textAlign: 'center',
        minHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
  background: 'linear-gradient(135deg, var(--main-color, #4CAF50) 0%, var(--main-color-alt, #2E7D32) 100%)',
  boxShadow: '0 0 0 100vw rgba(76,175,80,0.35) inset'
      }}>
        {/* خلفية متحركة */}
        {/* خلفية متحركة موحدة */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("/tabarou.png") center center/cover no-repeat',
          zIndex: 0,
          animation: 'heroBgMove 18s ease-in-out infinite',
          willChange: 'transform',
          boxShadow: '0 0 0 100vw rgba(76,175,80,0.35) inset'
        }} />
        <style>{`
          @keyframes heroBgMove {
            0% { transform: scale(1) translate(0px, 0px); }
            25% { transform: scale(1.04) translate(10px, -8px); }
            50% { transform: scale(1.02) translate(-8px, 10px); }
            75% { transform: scale(1.05) translate(8px, -10px); }
            100% { transform: scale(1) translate(0px, 0px); }
          }
        `}</style>
        
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '30px'
          }}>
            <img 
              src="/logoTabaro.png" 
              alt="المنصة الوطنية للتبرع" 
              style={{ 
                width: '120px', 
                height: '120px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))'
              }} 
            />
          </div>
          
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '8px 20px',
            borderRadius: '25px',
            marginBottom: '20px',
            fontSize: '0.9em',
            fontWeight: '500',
        backdropFilter: 'blur(10px)',
        color: '#ffffff',
          }}>
            
            🩸 المنصة الوطنية للتبرع الرائدة في المنطقة
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            color: 'white'
          }}>
            المنصة الوطنية للتبرع
          </h1>

          <h2 style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
            marginBottom: '40px',
            opacity: 0.95,
            lineHeight: 1.8,
            maxWidth: '700px',
            margin: '0 auto 40px auto'
          }}>
            انضم إلى مجتمع التبرع بالدم وكن جزءاً من إنقاذ الأرواح. كل قطرة دم تعني أملاً جديداً لمن يحتاجها.
          </h2>

          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>

<button
  type="button"
  style={{
    backgroundColor: 'white',
    color: '#e74c3c',
    padding: '18px 35px',
    textDecoration: 'none',
    borderRadius: '50px',
    fontWeight: 'bold',
    fontSize: '1.1em',
    transition: 'all 0.4s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    border: '2px solid white'
  }}
  onClick={() => navigate('/DonatePage')}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-3px) scale(1.05)';
    e.target.style.boxShadow = '0 12px 35px rgba(0,0,0,0.3)';
    e.target.style.backgroundColor = '#f8f9fa';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0) scale(1)';
    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
    e.target.style.backgroundColor = 'white';
  }}
>
  <FiHeart />
  ابدأ التبرع الآن
</button>
 
            <Link
              to="/blood-requests"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '18px 35px',
                textDecoration: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 'bold',
                fontSize: '1.1em',
                transition: 'all 0.4s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#e74c3c';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.border = '2px solid white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.border = '2px solid rgba(255,255,255,0.3)';
              }}
            >
              <FiDroplet />
              طلبات الدم العاجلة
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap',
            marginTop: '40px',
            opacity: 0.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiCheckCircle style={{ color: '#4CAF50' }} />
              <span style={{ fontSize: '0.9em' }}>معتمد من وزارة الصحة</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiAward style={{ color: '#FFD700' }} />
              <span style={{ fontSize: '0.9em' }}>جائزة أفضل تطبيق صحي</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock style={{ color: '#17a2b8' }} />
              <span style={{ fontSize: '0.9em' }}>متاح 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* نبذة عن منصة تبرع */}
      <section style={{
        background: 'rgba(255,255,255,0.85)',
        borderRadius: '18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        padding: '32px 24px',
        margin: '0 auto 48px auto',
        maxWidth: '700px',
        textAlign: 'right',
        direction: 'rtl',
        color: '#2c3e50',
        fontSize: '1.15em',
        lineHeight: 2
      }}>
        <h2 style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#e74c3c', marginBottom: '12px' }}>عن منصة تبرع</h2>
        منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن. نسهل خطوات التبرع ونضاعف أثره في المجتمع.<br /><br />
        المنصّة تتيح طلبات التبرع بالدم والتبرع المالي والتبرع العيني، مع إمكانية نشر الإعلانات الاجتماعية وتنظيم حملات الجمعيات.
      </section>

      {/* Statistics Section */}
      <section ref={statsRef} style={{
        padding: '80px 20px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#2c3e50',
            textAlign: 'center'
          }}>
            إنجازاتنا بالأرقام
          </h2>
          <p style={{
            fontSize: '1.2em',
            color: '#7f8c8d',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px auto'
          }}>
            شاهد الأثر الإيجابي الذي حققناه معاً في مجتمعنا
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '40px 20px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            >
              <FiUsers style={{ 
                fontSize: '3em', 
                color: '#e74c3c', 
                marginBottom: '15px' 
              }} />
              <h3 style={{
                fontSize: '3em',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0'
              }}>
                {counters.donors}+
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                fontWeight: '500'
              }}>
                متبرع مسجل
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '40px 20px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            >
              <FiDroplet style={{ 
                fontSize: '3em', 
                color: '#e74c3c', 
                marginBottom: '15px' 
              }} />
              <h3 style={{
                fontSize: '3em',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0'
              }}>
                {counters.donations}+
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                fontWeight: '500'
              }}>
                عملية تبرع
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '40px 20px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            >
              <FiHeart style={{ 
                fontSize: '3em', 
                color: '#e74c3c', 
                marginBottom: '15px' 
              }} />
              <h3 style={{
                fontSize: '3em',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0'
              }}>
                {counters.lives}+
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                fontWeight: '500'
              }}>
                حياة تم إنقاذها
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '40px 20px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
            >
              <FiTrendingUp style={{ 
                fontSize: '3em', 
                color: '#e74c3c', 
                marginBottom: '15px' 
              }} />
              <h3 style={{
                fontSize: '3em',
                fontWeight: 'bold',
                color: '#2c3e50',
                margin: '10px 0'
              }}>
                {counters.hospitals}+
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                fontWeight: '500'
              }}>
                مستشفى شريك
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Cards Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#2c3e50'
          }}>
            خدماتنا المتنوعة
          </h2>
          <p style={{
            fontSize: '1.2em',
            color: '#7f8c8d',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px auto'
          }}>
            نقدم مجموعة شاملة من الخدمات لخدمة المجتمع وتلبية احتياجاته المختلفة
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* تبرع بالدم */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.1s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(231, 76, 60, 0.2)';
                e.currentTarget.style.borderColor = '#e74c3c';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#e74c3c';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#e74c3c';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                🩸
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                تبرع بالدم
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                ساهم في إنقاذ الأرواح عبر تبرع آمن وسريع
              </p>
              <Link
                to="/blood-donations"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#e74c3c',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e74c3c'
                }}
              >
                تبرع الآن
              </Link>
            </div>

            {/* تبرع مالي */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.2s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(52, 152, 219, 0.2)';
                e.currentTarget.style.borderColor = '#3498db';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#3498db';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#3498db';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                💳
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                تبرع مالي
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                ادعم حالات عاجلة بمساهمة آمنة وشفافة
              </p>
              <Link
                to="/general-donations"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#3498db',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #3498db'
                }}
              >
                تبرع الآن
              </Link>
            </div>

            {/* تبرع عيني */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.3s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(46, 204, 113, 0.2)';
                e.currentTarget.style.borderColor = '#2ecc71';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#2ecc71';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#2ecc71';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                🎁
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                تبرع عيني
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                قدّم ملابس، طعامًا أو أدوات لتلبية احتياجات عاجلة
              </p>
              <Link
                to="/donations"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#2ecc71',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #2ecc71'
                }}
              >
                تبرع الآن
              </Link>
            </div>

            {/* تطوّع */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.4s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(155, 89, 182, 0.2)';
                e.currentTarget.style.borderColor = '#9b59b6';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#9b59b6';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#9b59b6';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                🙋‍♂️
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                تطوّع
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                انضم لفرق مساعدة ميدانية أو رقمية حسب وقتك
              </p>
              <Link
                to="/volunteer"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#9b59b6',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #9b59b6'
                }}
              >
                انضم الآن
              </Link>
            </div>

            {/* أفكار ومبادرات */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.5s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(243, 156, 18, 0.2)';
                e.currentTarget.style.borderColor = '#f39c12';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f39c12';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#f39c12';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                💡
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                أفكار ومبادرات
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                شارك مبادرتك واجمع متطوعين لتنفيذها
              </p>
              <Link
                to="/initiatives"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#f39c12',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #f39c12'
                }}
              >
                شارك فكرتك
              </Link>
            </div>

            {/* مفقودات */}
            <div 
              className="service-card"
              style={{
                backgroundColor: 'white',
                padding: '40px 30px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                border: '2px solid transparent',
                position: 'relative',
                overflow: 'hidden',
                animation: 'fadeInUp 0.8s ease-out forwards',
                animationDelay: '0.6s',
                opacity: 0,
                transform: 'translateY(30px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(230, 126, 34, 0.2)';
                e.currentTarget.style.borderColor = '#e67e22';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1.2) rotate(5deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#e67e22';
                e.currentTarget.querySelector('.service-button').style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.querySelector('.service-icon').style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.querySelector('.service-button').style.backgroundColor = '#f8f9fa';
                e.currentTarget.querySelector('.service-button').style.color = '#e67e22';
              }}
            >
              <div 
                className="service-icon"
                style={{
                  fontSize: '4em',
                  marginBottom: '20px',
                  transition: 'transform 0.3s ease'
                }}
              >
                🔎
              </div>
              <h3 style={{
                fontSize: '1.8em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                مفقودات
              </h3>
              <p style={{
                fontSize: '1.1em',
                color: '#7f8c8d',
                lineHeight: 1.6,
                marginBottom: '25px'
              }}>
                انشر/ابحث عن مفقودات وساعد أصحابها في استرجاعها
              </p>
              <Link
                to="/lost-found"
                className="service-button"
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  backgroundColor: '#f8f9fa',
                  color: '#e67e22',
                  textDecoration: 'none',
                  borderRadius: '25px',
                  fontWeight: '600',
                  fontSize: '1em',
                  transition: 'all 0.3s ease',
                  border: '2px solid #e67e22'
                }}
              >
                ابحث الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5em',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: '#2c3e50'
          }}>
            شهادات المستخدمين
          </h2>
          <p style={{
            fontSize: '1.2em',
            color: '#7f8c8d',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px auto'
          }}>
            اقرأ تجارب المتبرعين والمستفيدين من خدماتنا
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              position: 'relative',
              border: '1px solid #dee2e6'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} style={{ 
                    color: '#FFD700', 
                    fontSize: '1.2em'
                  }} />
                ))}
              </div>
              <p style={{
                fontSize: '1.1em',
                color: '#495057',
                fontStyle: 'italic',
                lineHeight: 1.8,
                marginBottom: '25px'
              }}>
                &ldquo;تطبيق رائع وسهل الاستخدام. تمكنت من التبرع بالدم بسهولة وأشعر بالفخر لكوني جزء من هذا المجتمع الخيري.&rdquo;
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5em',
                  fontWeight: 'bold'
                }}>
                  أ
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1em' }}>أحمد محمد</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9em' }}>متبرع منذ 2022</p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              position: 'relative',
              border: '1px solid #dee2e6'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} style={{ 
                    color: '#FFD700', 
                    fontSize: '1.2em'
                  }} />
                ))}
              </div>
              <p style={{
                fontSize: '1.1em',
                color: '#495057',
                fontStyle: 'italic',
                lineHeight: 1.8,
                marginBottom: '25px'
              }}>
                &ldquo;المنصة الوطنية للتبرع ساعدتني في الحصول على الدم اللازم لوالدتي في وقت قياسي. شكراً لكل المتبرعين الكرام.&rdquo;
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5em',
                  fontWeight: 'bold'
                }}>
                  ف
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1em' }}>فاطمة علي</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9em' }}>مستفيدة من الخدمة</p>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              position: 'relative',
              border: '1px solid #dee2e6'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} style={{ 
                    color: '#FFD700', 
                    fontSize: '1.2em'
                  }} />
                ))}
              </div>
              <p style={{
                fontSize: '1.1em',
                color: '#495057',
                fontStyle: 'italic',
                lineHeight: 1.8,
                marginBottom: '25px'
              }}>
                &ldquo;التطبيق ممتاز ويوفر خدمة إنسانية رائعة. التبرع بالدم أصبح أسهل وأكثر تنظيماً من خلال هذه المنصة.&rdquo;
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5em',
                  fontWeight: 'bold'
                }}>
                  م
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1em' }}>محمد سالم</h4>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9em' }}>متبرع نشط</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 20px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '2.5em',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#2c3e50'
            }}>
              لماذا تختار المنصة الوطنية للتبرع؟
            </h2>
            <p style={{
              fontSize: '1.2em',
              color: '#7f8c8d',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              ميزات متقدمة تجعل عملية التبرع بالدم أسهل وأكثر أماناً
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            <div style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              border: '1px solid #dee2e6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto'
              }}>
                <FiHeart style={{ fontSize: '2.5em', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                سهولة الاستخدام
              </h3>
              <p style={{
                color: '#7f8c8d',
                fontSize: '1.1em',
                lineHeight: 1.8
              }}>
                واجهة بسيطة وسهلة تتيح لك التبرع أو طلب الدم في خطوات قليلة ومبسطة
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              border: '1px solid #dee2e6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto'
              }}>
                <FiCheckCircle style={{ fontSize: '2.5em', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                أمان وموثوقية
              </h3>
              <p style={{
                color: '#7f8c8d',
                fontSize: '1.1em',
                lineHeight: 1.8
              }}>
                نظام محكم للتحقق من هوية المتبرعين وضمان سلامة وجودة عمليات التبرع
              </p>
            </div>

            <div style={{
              background: 'white',
              padding: '40px 30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              border: '1px solid #dee2e6'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px auto'
              }}>
                <FiClock style={{ fontSize: '2.5em', color: 'white' }} />
              </div>
              <h3 style={{
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                سرعة الاستجابة
              </h3>
              <p style={{
                color: '#7f8c8d',
                fontSize: '1.1em',
                lineHeight: 1.8
              }}>
                نظام إشعارات فوري لتنبيه المتبرعين بالطلبات العاجلة في منطقتهم
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '100px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: 'clamp(2em, 5vw, 3.5em)',
            fontWeight: 'bold',
            marginBottom: '25px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            انضم إلينا اليوم
          </h2>
          <p style={{
            fontSize: 'clamp(1.1em, 3vw, 1.4em)',
            marginBottom: '50px',
            opacity: 0.9,
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto 50px auto'
          }}>
            كن جزءاً من مجتمع المتبرعين وساهم في إنقاذ الأرواح. تبرعك اليوم قد ينقذ حياة غداً.
          </p>
          <div style={{
            display: 'flex',
            gap: '25px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/signup"
              style={{
                backgroundColor: '#e74c3c',
                color: 'white',
                padding: '20px 40px',
                textDecoration: 'none',
                borderRadius: '50px',
                fontWeight: 'bold',
                fontSize: '1.2em',
                transition: 'all 0.4s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 30px rgba(231, 76, 60, 0.4)',
                border: '2px solid #e74c3c'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 40px rgba(231, 76, 60, 0.6)';
                e.target.style.backgroundColor = '#c0392b';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(231, 76, 60, 0.4)';
                e.target.style.backgroundColor = '#e74c3c';
              }}
            >
              <FiHeart />
              سجل كمتبرع
            </Link>
            <Link
              to="/about"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                padding: '20px 40px',
                textDecoration: 'none',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.5)',
                fontWeight: 'bold',
                fontSize: '1.2em',
                transition: 'all 0.4s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.border = '2px solid white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.border = '2px solid rgba(255,255,255,0.5)';
              }}
            >
              <FiUsers />
              تعرف علينا أكثر
            </Link>
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }
          
          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .service-card {
            animation-fill-mode: forwards;
          }
          
          .service-card:hover .service-icon {
            animation: bounce 0.6s ease-in-out;
          }
          
          @keyframes bounce {
            0%, 20%, 60%, 100% {
              transform: translateY(0) scale(1);
            }
            40% {
              transform: translateY(-10px) scale(1.1);
            }
            80% {
              transform: translateY(-5px) scale(1.05);
            }
          }
          
          .service-button {
            position: relative;
            overflow: hidden;
          }
          
          .service-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }
          
          .service-card:hover .service-button::before {
            left: 100%;
          }
        `}
      </style>
    </main>
  );
}

export default LandingPageSimple;
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiDroplet, FiHeart, FiUsers, FiShield, FiClock, FiAward } from 'react-icons/fi';

function About() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // Scroll reveal animation
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    
    const items = root.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );
    
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const sectionStyles = {
    padding: '5rem 1rem',
    backgroundColor: 'white'
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto'
  };

  const titleStyles = {
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#1f2937',
    marginBottom: '1rem'
  };

  const subtitleStyles = {
    textAlign: 'center',
    fontSize: '1.25rem',
    color: '#6b7280',
    marginBottom: '4rem',
    maxWidth: '600px',
    margin: '0 auto 4rem',
    lineHeight: 1.6
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
    marginBottom: '5rem'
  };

  const cardStyles = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const iconStyles = {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    fontSize: '1.5rem'
  };

  const cardTitleStyles = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '1rem'
  };

  const cardDescriptionStyles = {
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '1.5rem'
  };

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer'
  };

  const statsStyles = {
    backgroundColor: '#f9fafb',
    padding: '3rem 2rem',
    borderRadius: '1rem',
    textAlign: 'center'
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem'
  };

  const statItemStyles = {
    padding: '1rem'
  };

  const statNumberStyles = {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#dc2626',
    display: 'block',
    marginBottom: '0.5rem'
  };

  const statLabelStyles = {
    color: '#6b7280',
    fontSize: '1rem'
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleCardHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-8px)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
  };

  return (
    <section ref={sectionRef} style={sectionStyles} id="about">
      <div style={containerStyles}>
        <div className="reveal">
          <h2 style={titleStyles}>عن المنصة الوطنية للتبرع</h2>
          <p style={subtitleStyles}>
            المنصة الوطنية للتبرع هي منصة متخصصة في تسهيل عملية التبرع بالدم وربط المتبرعين 
            بالمحتاجين لإنقاذ الأرواح وخدمة المجتمع
          </p>
        </div>

        <div style={gridStyles}>
          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/donations/blood/request')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#fef2f2', color: '#dc2626'}}>
              <FiHeart size={32} />
            </div>
            <h3 style={cardTitleStyles}>طلب تبرع بالدم</h3>
            <p style={cardDescriptionStyles}>
              هل تحتاج إلى دم أو تعرف شخصاً يحتاج؟ اطلب تبرعاً الآن وسنساعدك في العثور على متبرعين مناسبين
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              اطلب تبرعاً
            </button>
          </div>

          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/donations/blood')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#f0f9ff', color: '#0ea5e9'}}>
              <FiDroplet size={32} />
            </div>
            <h3 style={cardTitleStyles}>قائمة طلبات التبرع</h3>
            <p style={cardDescriptionStyles}>
              تصفح قائمة طلبات التبرع الحالية واختر الطلب الذي يمكنك المساعدة فيه
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              تصفح الطلبات
            </button>
          </div>

          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/donors/blood')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#f0fdf4', color: '#10b981'}}>
              <FiUsers size={32} />
            </div>
            <h3 style={cardTitleStyles}>المتبرعون</h3>
            <p style={cardDescriptionStyles}>
              تعرف على المتبرعين المسجلين في المنصة وتواصل معهم مباشرة
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              عرض المتبرعين
            </button>
          </div>

          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/add-user')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#fefce8', color: '#eab308'}}>
              <FiShield size={32} />
            </div>
            <h3 style={cardTitleStyles}>انضم كمتبرع</h3>
            <p style={cardDescriptionStyles}>
              سجل في المنصة كمتبرع وساهم في إنقاذ الأرواح وخدمة المجתمع
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              انضم الآن
            </button>
          </div>

          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/notifications')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#fdf2f8', color: '#ec4899'}}>
              <FiClock size={32} />
            </div>
            <h3 style={cardTitleStyles}>التنبيهات</h3>
            <p style={cardDescriptionStyles}>
              احصل على تنبيهات فورية عند وجود طلبات تبرع تناسب فصيلة دمك
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              عرض التنبيهات
            </button>
          </div>

          <div 
            className="reveal"
            style={cardStyles}
            onClick={() => handleCardClick('/profile')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{...iconStyles, backgroundColor: '#f5f3ff', color: '#8b5cf6'}}>
              <FiAward size={32} />
            </div>
            <h3 style={cardTitleStyles}>ملفي الشخصي</h3>
            <p style={cardDescriptionStyles}>
              تابع إحصائيات تبرعاتك وشاهد تأثيرك الإيجابي في المجتمع
            </p>
            <button 
              style={buttonStyles}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              عرض الملف
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="reveal" style={statsStyles}>
          <h3 style={{...titleStyles, marginBottom: '2rem', fontSize: '2rem'}}>إحصائيات المنصة</h3>
          <div style={statsGridStyles}>
            <div style={statItemStyles}>
              <span style={statNumberStyles}>+1000</span>
              <span style={statLabelStyles}>متبرع مسجل</span>
            </div>
            <div style={statItemStyles}>
              <span style={statNumberStyles}>+500</span>
              <span style={statLabelStyles}>طلب تبرع تم تلبيته</span>
            </div>
            <div style={statItemStyles}>
              <span style={statNumberStyles}>+200</span>
              <span style={statLabelStyles}>حياة تم إنقاذها</span>
            </div>
            <div style={statItemStyles}>
              <span style={statNumberStyles}>24/7</span>
              <span style={statLabelStyles}>خدمة على مدار الساعة</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
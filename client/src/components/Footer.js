import React from 'react';
import { FiHeart, FiDroplet, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerStyles = {
    backgroundColor: '#1f2937',
    color: '#f9fafb',
    padding: '3rem 0 1rem 0',
    marginTop: 'auto'
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  };

  const sectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: '1rem'
  };

  const linkStyles = {
    color: '#d1d5db',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const bottomStyles = {
    borderTop: '1px solid #374151',
    paddingTop: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#9ca3af'
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  };

  const logoIconStyles = {
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        <div style={gridStyles}>
          
          {/* القسم الأول - حول المنصة */}
          <div style={sectionStyles}>
            <div style={logoStyles}>
              <div style={logoIconStyles}>
                <img 
                  src="/logoTabaro.png" 
                  alt="المنصة الوطنية للتبرع" 
                  style={{ 
                    width: '2rem', 
                    height: '2rem',
                    objectFit: 'contain'
                  }} 
                />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  المنصة الوطنية للتبرع
                </h3> 
              </div>
            </div>
            <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.6' }}>
              المنصة الوطنية للتبرع هي منصة متخصصة في تسهيل عملية التبرع بالدم وربط المتبرعين 
              بالمحتاجين لإنقاذ الأرواح وخدمة المجتمع.
            </p>
          </div>

          {/* القسم الثاني - روابط سريعة */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>روابط سريعة</h3>
            <a href="/" style={linkStyles} 
               onMouseEnter={(e) => e.target.style.color = '#dc2626'}
               onMouseLeave={(e) => e.target.style.color = '#d1d5db'}>
              الرئيسية
            </a>
            <a href="/about" style={linkStyles}
               onMouseEnter={(e) => e.target.style.color = '#dc2626'}
               onMouseLeave={(e) => e.target.style.color = '#d1d5db'}>
              حول المنصة
            </a>
            <a href="/donations/blood" style={linkStyles}
               onMouseEnter={(e) => e.target.style.color = '#dc2626'}
               onMouseLeave={(e) => e.target.style.color = '#d1d5db'}>
              طلبات التبرع
            </a>
            <a href="/donors/blood" style={linkStyles}
               onMouseEnter={(e) => e.target.style.color = '#dc2626'}
               onMouseLeave={(e) => e.target.style.color = '#d1d5db'}>
              المتبرعون
            </a>
          </div>

          {/* القسم الثالث - معلومات الاتصال */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>اتصل بنا</h3>
            <div style={linkStyles}>
              <FiPhone size={16} />
              <span>+966 XX XXX XXXX</span>
            </div>
            <div style={linkStyles}>
              <FiMail size={16} />
              <span>info@tabaro.com</span>
            </div>
            <div style={linkStyles}>
              <FiMapPin size={16} />
              <span>الجمهورية الإسلامية الموريتانية</span>
            </div>
          </div>

          {/* القسم الرابع - إحصائيات */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>إحصائيات المنصة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiHeart size={16} style={{ color: '#dc2626' }} />
                <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                  المتبرعون المسجلون: <strong style={{ color: '#fff' }}>+1000</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiDroplet size={16} style={{ color: '#dc2626' }} />
                <span style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                  طلبات التبرع: <strong style={{ color: '#fff' }}>+500</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* الجزء السفلي */}
        <div style={bottomStyles}>
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <p style={{ margin: 0 }}>
              © {currentYear} المنصة الوطنية للتبرع. جميع الحقوق محفوظة.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/privacy" style={{ ...linkStyles, fontSize: '0.75rem' }}
                 onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                 onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                سياسة الخصوصية
              </a>
              <a href="/terms" style={{ ...linkStyles, fontSize: '0.75rem' }}
                 onMouseEnter={(e) => e.target.style.color = '#dc2626'}
                 onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                شروط الاستخدام
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

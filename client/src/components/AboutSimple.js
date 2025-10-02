
import React from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiUsers, FiHeart, FiTrendingUp, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

function AboutSimple() {
  return (
    <main style={{
      minHeight: '100vh',
      padding: 0,
  background: 'linear-gradient(135deg, #f9fafb 0%, #e6fcf7 100%)',
      fontFamily: 'Arial, sans-serif',
      lineHeight: 1.7
    }}>
      {/* Header Section */}
      <section style={{
        textAlign: 'center',
        marginBottom: '3.5rem',
        padding: '3.5rem 1rem 2rem 1rem',
    background: '#00CC99',
    color: 'white',
        boxShadow: '0 8px 32px rgba(231,76,60,0.08)'
      }}>
        <img src="/logoTabaro.png" alt="شعار المنصة" style={{ width: 90, height: 90, marginBottom: 18, filter: 'drop-shadow(0 0 12px #fff8)' }} />
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '0.7rem',
          letterSpacing: '.5px',
          textShadow: '2px 2px 8px #e74c3c44'
        }}>
          من نحن
        </h1>
        <p style={{
          fontSize: '1.13rem',
          color: '#fff',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.8,
          opacity: 0.97,
          textShadow: '1px 1px 6px #e74c3c22',
          fontWeight: 400
        }}>
          منصة وطنية موريتانية تربط بين الراغبين في العطاء والمحتاجين للدعم، عبر تواصل مباشر وآمن. نسعى لتسهيل خطوات التبرع وتعظيم الأثر الإنساني في الجمهورية الإسلامية الموريتانية.
        </p>
      </section>

      {/* Services Section */}
      <section style={{ marginBottom: '3.5rem', padding: '0 1rem' }}>
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#00CC99',
          marginBottom: '2.2rem',
          letterSpacing: '.5px'
        }}>
          خدماتنا
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '2rem',
          maxWidth: '950px',
          margin: '0 auto'
        }}>
          <Link 
            to="/blood-donations"
            style={{
              display: 'block',
              padding: '2.2rem 1.5rem',
              background: 'white',
              borderRadius: '1.5rem',
              boxShadow: '0 8px 32px rgba(231,76,60,0.07)',
              textDecoration: 'none',
              color: '#1f2937',
              border: 'none',
              transition: 'transform 0.3s, box-shadow 0.3s',
              borderTop: '4px solid #00CC9922',
              borderBottom: '4px solid #00CC9911',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #fef2f2 60%, #fff 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 2px 8px #e74c3c11'
            }}>
              <FiDroplet size={28} color="#00CC99" />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              طلبات التبرع بالدم
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              تصفح طلبات التبرع العاجلة واختر الحالة التي تريد مساعدتها
            </p>
          </Link>

          <Link 
            to="/donations"
            style={{
              display: 'block',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #e5e7eb'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #fef2f2 60%, #fff 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 2px 8px #e74c3c11'
            }}>
              <FiHeart size={28} color="#00CC99" />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              طلبات التبرع العامة
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              انشر طلب تبرع أو تطوع في الأنشطة الخيرية المختلفة
            </p>
          </Link>

          <Link 
            to="/users"
            style={{
              display: 'block',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              border: '1px solid #e5e7eb'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #fef2f2 60%, #fff 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 2px 8px #e74c3c11'
            }}>
              <FiUsers size={28} color="#00CC99" />
            </div>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              المتبرعون
            </h3>
            <p style={{
              color: '#6b7280',
              lineHeight: 1.6
            }}>
              تعرف على المتبرعين المسجلين في المنصة وتواصل معهم
            </p>
          </Link>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{
        background: 'white',
        padding: '3rem 1rem',
        borderRadius: '2rem',
        margin: '0 auto 3.5rem auto',
        boxShadow: '0 8px 32px rgba(231,76,60,0.07)',
        maxWidth: '1100px'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#1f2937',
          marginBottom: '3rem'
        }}>
          إحصائياتنا
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <FiUsers size={48} color="#00CC99" style={{ marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              1000+
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              متبرع مسجل
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <FiDroplet size={48} color="#00CC99" style={{ marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              500+
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              عملية تبرع ناجحة
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <FiHeart size={48} color="#00CC99" style={{ marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              200+
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              حياة تم إنقاذها
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <FiTrendingUp size={48} color="#00CC99" style={{ marginBottom: '1rem' }} />
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              50+
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              مستشفى شريك
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{
  background: 'linear-gradient(120deg, #00CC99 0%, #1f2937 100%)',
        color: 'white',
        padding: '3rem 1rem',
        borderRadius: '2rem',
        textAlign: 'center',
        maxWidth: '1100px',
        margin: '0 auto 2.5rem auto',
        boxShadow: '0 8px 32px rgba(231,76,60,0.09)'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>
          تواصل معنا
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <FiMapPin size={24} />
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#00CC99' }}>العنوان</h4>
              <p style={{ color: '#15803d', fontWeight: 700, fontSize: '1.08rem', letterSpacing: '.5px' }}>الجمهورية الإسلامية الموريتانية، نواكشوط</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <FiPhone size={24} />
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>الهاتف</h4>
              <p style={{ color: '#d1d5db' }}>+966 xx xxx xxxx</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <FiMail size={24} />
            <div>
              <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>البريد الإلكتروني</h4>
              <p style={{ color: '#d1d5db' }}>info@tabaro.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutSimple;
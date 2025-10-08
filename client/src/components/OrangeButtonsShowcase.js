import React from 'react';
import './ButtonSystem.css';

const OrangeButtonsShowcase = () => {
  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '40px',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          🍊 مجموعة الأزرار البرتقالية الجميلة
        </h1>

        {/* الأزرار الأساسية */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>الأزرار الأساسية</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button className="btn btn-primary">زر رئيسي بالبرتقالي</button>
            <button className="btn btn-secondary">زر ثانوي بالبرتقالي</button>
            <button className="btn btn-accent">زر برتقالي مميز</button>
            <button className="btn btn-orange">زر برتقالي متدرج</button>
          </div>
        </div>

        {/* الأزرار الخاصة */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>الأزرار الخاصة</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button className="btn btn-orange-ghost">زر شفاف برتقالي</button>
            <button className="btn btn-orange-neon">زر نيون برتقالي</button>
            <button className="btn btn-orange-animated">زر متحرك برتقالي</button>
            <button className="btn btn-glow">زر متوهج</button>
          </div>
        </div>

        {/* الأزرار التفاعلية */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>الأزرار التفاعلية</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button className="btn btn-donate-orange">تبرع بالدم</button>
            <button className="btn btn-emergency-orange">طوارئ</button>
            <button className="btn btn-search-orange">بحث</button>
            <button className="btn btn-download-orange">تحميل</button>
          </div>
        </div>

        {/* الأزرار المتنوعة */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>أزرار متنوعة</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <button className="btn btn-orange-circle">👤</button>
            <button className="btn btn-profile-orange">🔥</button>
            <button className="btn btn-settings-orange">الإعدادات</button>
            <button className="btn btn-soft" style={{background: 'linear-gradient(135deg, rgba(255,122,69,0.1), rgba(255,154,108,0.1))'}}>
              زر ناعم برتقالي
            </button>
          </div>
        </div>

        {/* أحجام مختلفة */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>أحجام مختلفة</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-accent btn-sm">صغير</button>
            <button className="btn btn-accent">عادي</button>
            <button className="btn btn-accent btn-lg">كبير</button>
            <button className="btn btn-accent btn-xl">كبير جداً</button>
          </div>
        </div>

        {/* أشكال مختلفة */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>أشكال مختلفة</h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <button className="btn btn-accent">مربع عادي</button>
            <button className="btn btn-accent btn-rounded">دائري الزوايا</button>
            <button className="btn btn-orange-circle">دائري</button>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#666',
          fontSize: '18px'
        }}>
          <p>✨ جميع الأزرار تتمتع بتأثيرات متقدمة وألوان برتقالية جميلة ✨</p>
        </div>
      </div>
    </div>
  );
};

export default OrangeButtonsShowcase;
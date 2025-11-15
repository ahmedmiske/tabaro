import React from 'react';

const ButtonsDemo = () => {
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
          🍊 الأزرار المحسنة في index.css
        </h1>

        {/* الأزرار الأساسية */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>الأزرار الأساسية المحسنة</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button className="btn btn-primary">زر رئيسي محسن</button>
            <button className="btn btn-secondary">زر ثانوي شفاف</button>
            <button className="btn btn-accent">زر برتقالي مميز</button>
            <button className="btn btn-orange-ghost">زر برتقالي شفاف</button>
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
          <h2 style={{ color: '#333', marginBottom: '20px' }}>الأزرار التفاعلية الجديدة</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <button className="btn btn-donate">تبرع بالدم</button>
            <button className="btn btn-emergency">طوارئ</button>
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
            <button className="btn btn-accent">مربع</button>
            <button className="btn btn-accent btn-rounded">دائري الزوايا</button>
            <button className="btn btn-circle">🔥</button>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#666',
          fontSize: '18px'
        }}>
          <p>✅ تم تحسين الأزرار في ملف index.css مباشرة!</p>
          <p>🎨 الأزرار الآن أكثر جمالاً مع اللون البرتقالي المميز</p>
          <p>🚀 يمكن استخدامها في جميع أنحاء التطبيق</p>
        </div>
      </div>
    </div>
  );
};

export default ButtonsDemo;
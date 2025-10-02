import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

export default function BloodDonationInfo() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row-reverse',
      background: 'linear-gradient(135deg, #f9fafb 0%, #fef2f2 100%)',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Main Info */}
      <div style={{ flex: 1, padding: '4rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2.7rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '1.5rem', lineHeight: 1.2 }}>
          أهمية التبرع بالدم
        </h1>
        <blockquote style={{
          background: '#fff',
          borderRight: '6px solid #e74c3c',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          fontSize: '1.3rem',
          color: '#1f2937',
          boxShadow: '0 4px 24px #e74c3c11',
          fontStyle: 'italic',
        }}>
          <span style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.5rem', display: 'block', marginBottom: 8 }}>
            ﴿ وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا ﴾
          </span>
          <span style={{ fontSize: '1.1rem', color: '#555' }}>
            (سورة المائدة: 32)
          </span>
        </blockquote>
        <p style={{ fontSize: '1.15rem', color: '#444', marginBottom: '2rem', maxWidth: 700 }}>
          التبرع بالدم هو عمل إنساني نبيل يُسهم في إنقاذ حياة الكثيرين ممن هم في أمس الحاجة إلى الدم، سواء في العمليات الجراحية أو الحوادث أو الأمراض المزمنة. كل قطرة دم قد تعني حياة جديدة لشخص آخر.
        </p>
        <ul style={{ color: '#333', fontSize: '1.08rem', marginBottom: '2.5rem', paddingRight: 24 }}>
          <li>يساعد في علاج المرضى والمصابين في الحوادث.</li>
          <li>يسهم في استمرارية العمليات الجراحية.</li>
          <li>يُعزز من روح التعاون والتكافل في المجتمع.</li>
        </ul>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/blood-donations" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#e74c3c',
            color: 'white',
            padding: '1rem 2.5rem',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '1.15rem',
            textDecoration: 'none',
            boxShadow: '0 4px 16px #e74c3c22',
            transition: 'background 0.2s',
          }}>
            <FiHeart size={22} />
            تصفح طلبات التبرع
          </Link>
        </div>
      </div>
      {/* Login Section */}
      <div style={{
        width: 380,
        background: 'white',
        borderLeft: '1px solid #f3d6d6',
        boxShadow: '0 0 32px #e74c3c11',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '3rem 2rem',
        minHeight: '100vh',
      }}>
        <h2 style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: 24 }}>تسجيل الدخول</h2>
        <p style={{ color: '#555', marginBottom: 24, textAlign: 'center' }}>
          للاستفادة من جميع خدمات المنصة، يرجى تسجيل الدخول أو إنشاء حساب جديد.
        </p>
        <Link to="/login" style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white',
          padding: '0.9rem 2.2rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          boxShadow: '0 2px 12px #e74c3c22',
          marginBottom: 12,
          transition: 'background 0.2s',
        }}>
          تسجيل الدخول
        </Link>
        <div style={{ color: '#888', margin: '12px 0' }}>أو</div>
        <Link to="/add-user" style={{
          display: 'inline-block',
          background: 'linear-gradient(90deg, #fff 0%, #e74c3c 100%)',
          color: '#e74c3c',
          padding: '0.9rem 2.2rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          boxShadow: '0 2px 12px #e74c3c11',
          border: '1px solid #e74c3c33',
          transition: 'background 0.2s',
        }}>
          إنشاء حساب جديد
        </Link>
      </div>
    </div>
  );
}

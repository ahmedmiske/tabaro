import React, { useState } from 'react';

import UserForm from '../components/UserForm';
import { FiUserPlus, FiUsers, FiHeart, FiShield, FiCheckCircle, FiLogIn } from 'react-icons/fi';
import './addUserPage.css';

function AddUserPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const addUser = (_user) => {
    setFormSubmitted(true);
    setSuccessMessage('تم إنشاء الحساب بنجاح!');
  };

  return (
    <div className="signup-layout" style={{background: '#fafbfc'}}>
      <div className="signup-form-section" style={{boxShadow: 'none', borderRight: 'none', background: '#fff'}}>
        <div className="modern-header" style={{marginBottom: 18, textAlign: 'center'}}>
          <div className="logo-container" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8}}>
            <span className="logo-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f87171', borderRadius: '50%', width: 44, height: 44}}>
              <FiUserPlus size={24} color="#fff" />
            </span>
            <h1 style={{fontWeight: 800, fontSize: '1.3rem', color: '#dc2626', margin: 0}}>المنصة الوطنية للتبرع</h1>
          </div>
          <h2 style={{fontWeight: 700, fontSize: '1.1rem', color: '#222', margin: 0, letterSpacing: 0.5}}>إنشاء حساب جديد</h2>
          <p style={{color: '#64748b', margin: '6px 0 0 0', fontSize: 13}}>انضم إلى مجتمع المتبرعين وساهم في إنقاذ الأرواح</p>
        </div>
        {formSubmitted ? (
          <div className="success-message-container" style={{textAlign: 'center', padding: '2rem 1rem'}}>
            <FiCheckCircle size={40} color="#10b981" style={{marginBottom: 12}} />
            <p style={{fontWeight: 600, fontSize: '1.05rem', color: '#1a202c', marginBottom: 12}}>{successMessage}</p>
            <button onClick={() => setFormSubmitted(false)} className="retry-button back-button" style={{marginTop: 8, fontSize: 15, padding: '0.7rem 2rem', borderRadius: 24}}>
              العودة للنموذج
            </button>
          </div>
        ) : (
          <UserForm addUser={addUser} />
        )}
      </div>
      <div className="signup-section" style={{background: '#f9fafb', borderRight: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: 280, padding: '2rem 1rem'}}>
        <div className="info-content" style={{width: '100%', maxWidth: 320}}>
          <div className="stats-section" style={{display: 'flex', flexDirection: 'row', gap: 12, marginBottom: 18, justifyContent: 'center'}}>
            <div className="stat-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <span className="stat-icon" style={{background: '#fee2e2', borderRadius: '50%', padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FiUsers size={18} color="#dc2626" /></span>
              <strong style={{fontWeight: 700, fontSize: '1rem'}}>10K+</strong>
              <span style={{color: '#64748b', fontSize: 11}}>متبرع نشط</span>
            </div>
            <div className="stat-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <span className="stat-icon" style={{background: '#fef9c3', borderRadius: '50%', padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FiHeart size={18} color="#f59e42" /></span>
              <strong style={{fontWeight: 700, fontSize: '1rem'}}>50K+</strong>
              <span style={{color: '#64748b', fontSize: 11}}>حياة تم إنقاذها</span>
            </div>
            <div className="stat-item" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4}}>
              <span className="stat-icon" style={{background: '#d1fae5', borderRadius: '50%', padding: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><FiShield size={18} color="#10b981" /></span>
              <strong style={{fontWeight: 700, fontSize: '1rem'}}>24/7</strong>
              <span style={{color: '#64748b', fontSize: 11}}>خدمة آمنة</span>
            </div>
          </div>
          <div className="verse" style={{background: '#fff', borderRadius: 10, padding: '0.7rem 0.5rem', marginBottom: 14, boxShadow: '0 1px 6px #e74c3c08', textAlign: 'center'}}>
            <div className="verse-icon" style={{marginBottom: 4}}><FiHeart color="#dc2626" size={16} /></div>
            <p style={{fontWeight: 700, color: '#dc2626', fontSize: '0.98rem', marginBottom: 1}}>﴿ وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا ﴾</p>
            <small style={{color: '#64748b', fontSize: 11}}>سورة المائدة</small>
          </div>
          <div className="cta-link" style={{textAlign: 'center', marginTop: 8}}>
            <a href='/login' style={{display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontWeight: 600, textDecoration: 'none', fontSize: 13}}>
              <FiLogIn /> تسجيل الدخول
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddUserPage;

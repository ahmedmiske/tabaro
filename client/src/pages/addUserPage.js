import React, { useState } from 'react';
import UserForm from '../components/UserForm';
import './addUserPage.css';
import TitleMain from '../components/TitleMain';

function AddUserPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const addUser = (user) => {
    // عملية إرسال البيانات
  };

  return (
    <div className="signup-layout">
      {/* ✅ القسم الأيسر: النموذج */}
      <div className="signup-form-section">
        <TitleMain text2="إنشاء حساب جديد" text1="التسجيل" />
        {formSubmitted ? (
          <div className="alert alert-success text-center">{successMessage}</div>
        ) : (
          <UserForm addUser={addUser} />
        )}
      </div>

      {/* ✅ القسم الأيمن: خلفية زرقاء وآية */}
      <div className="signup-section">
        <div className="verse">
          <p>﴿ وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ ﴾</p>
        </div>
      </div>
    </div>
  );
}

export default AddUserPage;

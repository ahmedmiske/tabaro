import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  // تمرير الصفحة لأعلى عند تحميل صفحة 404
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        {/* قسم الأيقونة والعدد */}
        <div className="error-visual">
          <div className="error-number">
            <span className="digit">4</span>
            <div className="heart-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="digit">4</span>
          </div>
          <div className="floating-elements">
            <div className="float-element">🤝</div>
            <div className="float-element">💝</div>
            <div className="float-element">🌟</div>
            <div className="float-element">🫶</div>
          </div>
        </div>

        {/* المحتوى النصي */}
        <div className="error-content">
          <h1 className="error-title">الصفحة غير موجودة</h1>
          <h2 className="error-subtitle">لكن روح العطاء موجودة في كل مكان</h2>
          
          <p className="error-description">
            يبدو أن الصفحة التي تبحث عنها قد فقدت طريقها، 
            مثل قطرة مطر تبحث عن الأرض العطشى.
            <br />
            لا تقلق، نحن هنا لنساعدك في العثور على طريقك نحو الخير.
          </p>

          {/* إحصائيات ملهمة */}
          <div className="inspiring-stats">
            <div className="stat-item">
              <div className="stat-number">+1000</div>
              <div className="stat-label">قلب أعطى</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">+500</div>
              <div className="stat-label">حياة تغيرت</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">أمل جديد</div>
            </div>
          </div>

          {/* اقتراحات التنقل */}
          <div className="navigation-suggestions">
            <h3>ماذا عن زيارة:</h3>
            <div className="suggestion-cards">
              <Link to="/" className="suggestion-card">
                <div className="card-icon">🏠</div>
                <div className="card-title">الصفحة الرئيسية</div>
                <div className="card-desc">ابدأ رحلة العطاء</div>
              </Link>
              
              <Link to="/blood-donations" className="suggestion-card">
                <div className="card-icon">🩸</div>
                <div className="card-title">تبرع بالدم</div>
                <div className="card-desc">أنقذ حياة</div>
              </Link>
              
              <Link to="/donations" className="suggestion-card">
                <div className="card-icon">💝</div>
                <div className="card-title">التبرعات</div>
                <div className="card-desc">ساعد المحتاجين</div>
              </Link>
              
              <Link to="/about" className="suggestion-card">
                <div className="card-icon">ℹ️</div>
                <div className="card-title">حول المنصة</div>
                <div className="card-desc">تعرف علينا</div>
              </Link>
            </div>
          </div>

          {/* رسالة ملهمة */}
          <div className="inspiring-message">
            <blockquote>
              &ldquo;أفضل الناس أنفعهم للناس&rdquo;
            </blockquote>
            <p>كلما ضللت طريقك، تذكر أن هناك دائماً فرصة جديدة للعطاء والمساعدة</p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="action-buttons">
            <Link to="/" className="btn-primary">
              <span>العودة للرئيسية</span>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </Link>
            
            <button onClick={() => window.history.back()} className="btn-secondary">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              <span>العودة للخلف</span>
            </button>
          </div>
        </div>

        {/* عناصر زخرفية */}
        <div className="decorative-elements">
          <div className="circle-1"></div>
          <div className="circle-2"></div>
          <div className="circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
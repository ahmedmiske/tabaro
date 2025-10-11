import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserForm from '../components/UserForm';
import TitleMain from '../components/TitleMain';
import userAddImage from '../images/useradd.png';
import './addUserPage.css';

/**
 * 🎨 صفحة التسجيل المتطورة - تجربة مستخدم استثنائية
 * 
 * @description مكون متقدم لإنشاء حسابات المستخدمين مع تصميم أنيق ومبهر
 * @author PNDD Development Team
 * @version 2.0.0
 */
function AddUserPage() {
  // 🔄 إدارة حالة التطبيق بطريقة احترافية مع نظام الخطوات
  const [currentStep, setCurrentStep] = useState(1); // الخطوة الحالية
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  
  // 📊 إعدادات الخطوات المتعددة
  const totalSteps = 5;

  // ✨ تأثيرات بصرية عند تحميل الصفحة
  useEffect(() => {
    setAnimationClass('fade-in-entrance');
    
    // إضافة تأثير الترحيب المتحرك
    const welcomeTimer = setTimeout(() => {
      setAnimationClass('welcome-ready');
    }, 500);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // 🔢 معلومات الخطوات للتنقل
  const stepInfo = useMemo(() => ({
    1: { 
      title: 'نوع الحساب', 
      description: 'اختر نوع الحساب المناسب لك',
      icon: '�'
    },
    2: { 
      title: 'التحقق من رقم الهاتف', 
      description: 'أدخل رقم الهاتف وتأكد من صحته',
      icon: '�'
    },
    3: { 
      title: 'المعلومات الشخصية', 
      description: 'أدخل بياناتك الشخصية الأساسية',
      icon: '�'
    },
    4: { 
      title: 'معلومات الحساب', 
      description: 'كلمة المرور والإعدادات الأمنية',
      icon: '🔐'
    },
    5: { 
      title: 'اكتمل التسجيل', 
      description: 'تم إنشاء حسابك بنجاح',
      icon: '🎉'
    }
  }), []);

  // 📈 دوال التنقل بين الخطوات
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setAnimationClass('step-forward');
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setAnimationClass('step-backward');
    }
  }, [currentStep]);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      setAnimationClass('step-jump');
    }
  }, [totalSteps]);

  /**
   * 🚀 معالج إضافة المستخدم المتطور
   * 
   * @param {Object} user - بيانات المستخدم الجديد
   * @returns {Promise<void>}
   */
  const addUser = useCallback(async (user) => {
    try {
      // 🎯 بدء حالة التحميل مع تأثيرات بصرية
      setIsLoading(true);
      setErrorMessage('');
      setAnimationClass('processing');

      // 📊 محاكاة معالجة متقدمة للبيانات
      console.log('🔄 معالجة بيانات المستخدم:', {
        ...user,
        timestamp: new Date().toISOString(),
        sessionId: Math.random().toString(36).substr(2, 9)
      });

      // ⏳ تأخير واقعي لمحاكاة استدعاء API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 🎉 رسالة نجاح مخصصة وجذابة
      const successMessages = [
        '🎉 أهلاً وسهلاً! تم إنشاء حسابك بنجاح',
        '✨ رائع! انضممت الآن إلى مجتمع  المتبرعين',
        '🌟 مبروك! حسابك جاهز للاستخدام'
      ];
      
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      setSuccessMessage(randomMessage);
      setFormSubmitted(true);
      setAnimationClass('success-celebration');
      
      // 🎯 الانتقال للخطوة الأخيرة (اكتمال التسجيل)
      setCurrentStep(totalSteps);

      // 🎊 تأخير أنيق قبل التوجيه
      setTimeout(() => {
        setAnimationClass('farewell-transition');
        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      }, 3200);

    } catch (error) {
      // 🔥 معالجة أخطاء متقدمة
      console.error('💥 خطأ في إنشاء المستخدم:', error);
      setErrorMessage('⚠️ عذراً! حدث خطأ غير متوقع. دعنا نحاول مرة أخرى بطريقة أفضل.');
      setAnimationClass('error-shake');
      
      // إزالة تأثير الاهتزاز بعد ثانيتين
      setTimeout(() => setAnimationClass(''), 2000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 🔄 معالج إعادة تعيين النموذج الأنيق
   */
  const handleResetForm = useCallback(() => {
    setAnimationClass('reset-transition');
    
    setTimeout(() => {
      setFormSubmitted(false);
      setSuccessMessage('');
      setErrorMessage('');
      setIsLoading(false);
      setAnimationClass('fresh-start');
      
      // عودة للحالة العادية بعد التأثير
      setTimeout(() => setAnimationClass(''), 300);
    }, 200);
  }, []);

  /**
   * 💫 معالج أخطاء ذكي مع تأثيرات بصرية
   */
  const handleDismissError = useCallback(() => {
    setAnimationClass('error-dismiss');
    setTimeout(() => {
      setErrorMessage('');
      setAnimationClass('');
    }, 300);
  }, []);

  // 🎨 محتوى ديناميكي للآية الكريمة
  const verseContent = useMemo(() => ({
    arabic: "وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    reference: "سورة البقرة: 195",
    meaning: "كونوا من المحسنين في أعمالكم"
  }), []);

  return (
    <div className={`signup-layout ${animationClass}`} role="main" aria-label="صفحة التسجيل">
      {/* 🎨 القسم البصري المبهر - تجربة بصرية استثنائية */}
      <section 
        className="signup-image-section fullscreen-image" 
        aria-label="منطقة الترحيب البصرية"
      >
        {/* الآية الكريمة في الأعلى مع تصميم راقي */}
        <article className="verse verse-top" role="complementary">
          <blockquote className="verse-text">
            <p className="arabic-text">﴿ {verseContent.arabic} ﴾</p>
            <cite className="verse-reference">{verseContent.reference}</cite>
            <small className="verse-meaning">{verseContent.meaning}</small>
          </blockquote>
        </article>

        {/* طبقة التأثيرات البصرية */}
        <div className="image-overlay" aria-hidden="true"></div>
        
        {/* الصورة الرئيسية تحتل كامل المساحة */}
        <div className="image-container fullscreen-container">
          <img 
            src={userAddImage} 
            alt="رسم توضيحي لإنشاء حساب جديد في تطبيق PNDD" 
            className="user-add-image fullscreen-image-element"
            loading="eager"
            decoding="async"
          />
          
          {/* مؤشر التحميل الأنيق */}
          {isLoading && (
            <div className="loading-overlay" aria-live="polite">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <span className="loading-text">جاري المعالجة...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 📋 منطقة النموذج التفاعلي المتطور */}
      <section 
        className="signup-form-section" 
        aria-label="نموذج إنشاء الحساب"
      >
        {/* رأس النموذج الأنيق */}
        <header className="form-header">
          <TitleMain 
            text1="إنشاء حساب جديد" 
          />
          
          {/* شريط التقدم متعدد الخطوات */}
          <div className="steps-progress-container" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps}>
            <div className="steps-info">
              <div className="current-step-info">
                <span className="step-icon">{stepInfo[currentStep]?.icon}</span>
                <div className="step-details">
                  <h3 className="step-title">{stepInfo[currentStep]?.title}</h3>
                  <p className="step-description">{stepInfo[currentStep]?.description}</p>
                </div>
              </div>
              
              {/* نقاط الخطوات بدلاً من العداد النصي */}
              <div className="steps-dots-header">
                {Array.from({ length: totalSteps }, (_, index) => (
                  <div
                    key={index + 1}
                    className={`step-dot-header ${currentStep >= index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
                    aria-label={`الخطوة ${index + 1}: ${stepInfo[index + 1]?.title}`}
                  >
                    {currentStep > index + 1 ? '✓' : index + 1}
                  </div>
                ))}
              </div>
            </div>
            
            {/* شريط التقدم البصري */}
            <div className="progress-indicator">
              <div 
                className={`progress-bar ${formSubmitted ? 'complete' : isLoading ? 'processing' : ''}`}
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </header>

        {/* منطقة الرسائل التفاعلية */}
        {errorMessage && (
          <div 
            className="alert alert-error sophisticated-alert" 
            role="alert"
            aria-live="assertive"
          >
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <p className="alert-message">{errorMessage}</p>
              <button 
                className="alert-dismiss-btn"
                onClick={handleDismissError}
                aria-label="إغلاق رسالة الخطأ"
              >
                <span>✕</span>
              </button>
            </div>
            <button 
              className="retry-btn elegant-btn"
              onClick={handleDismissError}
              disabled={isLoading}
            >
              <span className="btn-text">حاول مرة أخرى</span>
              <span className="btn-icon">🔄</span>
            </button>
          </div>
        )}
        
        {/* منطقة النجاح المبهرة */}
        {formSubmitted ? (
          <div className="success-container celebration-mode" role="status" aria-live="polite">
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="checkmark-circle">
                  <div className="checkmark-stem"></div>
                  <div className="checkmark-kick"></div>
                </div>
              </div>
            </div>
            
            <div className="success-content">
              <h3 className="success-title">🎉 مرحباً بك في PNDD!</h3>
              <p className="success-message">{successMessage}</p>
              
              <div className="success-stats">
                <div className="stat-item">
                  <span className="stat-number">+1</span>
                  <span className="stat-label">عضو جديد</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">🩸</span>
                  <span className="stat-label">جاهز للتبرع</span>
                </div>
              </div>
            </div>
            
            <div className="success-actions">
              <button 
                className="btn btn-primary premium-btn"
                onClick={() => window.location.href = '/'}
                disabled={isLoading}
              >
                <span className="btn-text">ابدأ رحلتك</span>
                <span className="btn-icon">→</span>
              </button>
              
              <button 
                className="btn btn-secondary elegant-btn"
                onClick={handleResetForm}
                disabled={isLoading}
              >
                <span className="btn-text">إنشاء حساب آخر</span>
                <span className="btn-icon">👥</span>
              </button>
            </div>
          </div>
        ) : (
          /* منطقة النموذج الذكي */
          <div className="form-container">
            <UserForm 
              addUser={addUser} 
              isLoading={isLoading}
              className="premium-form"
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
            />
            
            {/* معلومات إضافية مفيدة */}
            <footer className="form-footer">
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">بياناتك محمية بأعلى معايير الأمان</span>
              </div>
              
              <div className="support-info">
                <p className="support-text">
                  تحتاج مساعدة؟ 
                  <a href="/support" className="support-link">تواصل معنا</a>
                </p>
              </div>
            </footer>
          </div>
        )}
      </section>
    </div>
  );
}

// 🎯 تحسين الأداء مع React.memo للمكونات المعقدة
const OptimizedAddUserPage = React.memo(AddUserPage);

// 🏷️ إضافة معلومات المكون للتطوير
OptimizedAddUserPage.displayName = 'AddUserPage';

// 📝 إضافة PropTypes للتطوير الآمن (اختياري)
OptimizedAddUserPage.propTypes = {
  // يمكن إضافة PropTypes هنا عند الحاجة
};

/**
 * 🚀 تصدير المكون المحسن
 * 
 * @exports {React.Component} AddUserPage - صفحة التسجيل المتطورة
 * 
 * Features:
 * ✅ تجربة مستخدم متطورة
 * ✅ تأثيرات بصرية مبهرة  
 * ✅ إمكانية الوصول الكاملة
 * ✅ استجابة مثالية
 * ✅ أداء محسن
 * ✅ معالجة أخطاء ذكية
 * ✅ تصميم احترافي
 */
export default OptimizedAddUserPage;

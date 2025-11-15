// src/pages/AddUserPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import UserForm from '../components/UserForm.jsx';
import TitleMain from '../components/TitleMain.jsx';
import userAddImage from '../images/default-avatar.png';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './addUserPage.css';

// 🛠️ فلتر ResizeObserver فقط (لا نخفي بقية الأخطاء)
const handleResizeObserverError = (e) => {
  const msg = e?.message || e?.reason?.message || '';
  if (msg.includes('ResizeObserver loop completed with undelivered notifications')) {
    e.preventDefault?.();
    return true;
  }
  return false;
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => { handleResizeObserverError(e); });
  window.addEventListener('unhandledrejection', (event) => {
    // لا تمنع باقي الأخطاء حتى لا تختفي مشاكل API
    if (handleResizeObserverError(event)) return;
    // اترك المتصفح يعرضها أو اطبعها
    // console.error('[Unhandled Rejection]', event.reason);
  });
}

function AddUserPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const totalSteps = 5;

  useEffect(() => () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', handleResizeObserverError);
    }
  }, []);

  useEffect(() => {
    setAnimationClass('fade-in-entrance');
    const t = setTimeout(() => setAnimationClass('welcome-ready'), 500);
    return () => clearTimeout(t);
  }, []);

  const stepInfo = useMemo(() => ({
    1: { title: 'نوع الحساب',            description: 'اختر نوع الحساب المناسب لك',      icon: '👤' },
    2: { title: 'التحقق من رقم الهاتف',   description: 'أدخل رقم الهاتف وتأكد من صحته',    icon: '📞' },
    3: { title: 'المعلومات الشخصية',     description: 'أدخل بياناتك الشخصية الأساسية',    icon: '📝' },
    4: { title: 'معلومات الحساب',        description: 'كلمة المرور والإعدادات الأمنية',   icon: '🔐' },
    5: { title: 'اكتمل التسجيل',         description: 'تم إنشاء حسابك بنجاح',            icon: '🎉' },
  }), []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1);
      setTimeout(() => setAnimationClass('step-forward'), 0);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      setTimeout(() => setAnimationClass('step-backward'), 0);
    }
  }, [currentStep]);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      setTimeout(() => setAnimationClass('step-jump'), 0);
    }
  }, [totalSteps]);

  /**
   * ✅ إرسال فعلي إلى الخادم (multipart/form-data) بدلاً من المحاكاة
   */
  const addUser = useCallback(async (user) => {
    setIsLoading(true);
    setErrorMessage('');
    setAnimationClass('processing');

    try {
      // ابنِ FormData من كائن المستخدم القادم من UserForm
      const fd = new FormData();
      Object.entries(user).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (k === 'confirmPassword') return; // لا حاجة لإرساله
        fd.append(k, v);
      });

      // Debug مفيد أثناء التطوير
      // console.log('[AddUser] sending keys:', [...fd.keys()]);

      const res = await fetchWithInterceptors('/api/users', {
        method: 'POST',
        body: fd,
      });

      if (!res?.ok) {
        const msg = res?.body?.message || res?.body?.error || 'فشل إنشاء الحساب';
        throw new Error(msg);
      }

      setSuccessMessage('🎉 تم إنشاء الحساب بنجاح!');
      setFormSubmitted(true);
      setAnimationClass('success-celebration');
      setCurrentStep(totalSteps);
    } catch (err) {
      console.error('💥 خطأ في إنشاء المستخدم:', err);
      setErrorMessage(err?.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب');
      setAnimationClass('error-shake');
      setTimeout(() => setAnimationClass(''), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [totalSteps]);

  const handleResetForm = useCallback(() => {
    requestAnimationFrame(() => {
      setFormSubmitted(false);
      setSuccessMessage('');
      setErrorMessage('');
      setIsLoading(false);
      setAnimationClass('');
      setCurrentStep(1);
    });
  }, []);

  const handleDismissError = useCallback(() => {
    setAnimationClass('error-dismiss');
    setTimeout(() => { setErrorMessage(''); setAnimationClass(''); }, 300);
  }, []);

  return (
    <div className={`signup-layout ${animationClass}`} role="main" aria-label="صفحة التسجيل">
      {/* القسم البصري */}
      <section className="signup-image-section fullscreen-image" aria-label="منطقة الترحيب البصرية">
        <div
          className="image-container fullscreen-container"
          style={{
            backgroundImage: 'url(/images/useradd.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            minHeight: '260px',
            margin: 0,
            padding: 0,
            width: '100%',
            borderRadius: '1.2rem',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="رسم توضيحي لإنشاء حساب جديد"
        />
      </section>

      {/* منطقة النموذج */}
      <section className="signup-form-section" aria-label="نموذج إنشاء الحساب">
       

        {errorMessage && (
          <div className="alert alert-error sophisticated-alert" role="alert" aria-live="assertive">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <p className="alert-message">{errorMessage}</p>
              <button className="alert-dismiss-btn" onClick={handleDismissError} aria-label="إغلاق رسالة الخطأ">
                <span>✕</span>
              </button>
            </div>
            <button className="retry-btn elegant-btn" onClick={handleDismissError} disabled={isLoading}>
              <span className="btn-text">حاول مرة أخرى</span>
              <span className="btn-icon">🔄</span>
            </button>
          </div>
        )}

        {formSubmitted ? (
          <div className="success-container celebration-mode" role="status" aria-live="polite">
            <div className="success-animation">
              <div className="success-checkmark">
                <div className="checkmark-circle"><div className="checkmark-stem" /><div className="checkmark-kick" /></div>
              </div>
            </div>
            <div className="success-content">
              <h3 className="success-title">🎉 مرحباً بك!</h3>
              <p className="success-message">{successMessage}</p>
              <div className="success-stats">
                <div className="stat-item"><span className="stat-number">+1</span><span className="stat-label">عضو جديد</span></div>
                <div className="stat-item"><span className="stat-number">🩸</span><span className="stat-label">جاهز للتبرع</span></div>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn btn-primary premium-btn" onClick={() => (window.location.href = '/')} disabled={isLoading}>
                <span className="btn-text">الانتقال للرئيسية</span><span className="btn-icon">→</span>
              </button>
              <button className="btn btn-secondary elegant-btn" onClick={handleResetForm} disabled={isLoading}>
                <span className="btn-text">إنشاء حساب آخر</span><span className="btn-icon">👥</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="form-container">
             <header className="form-header">
             <TitleMain title="إنشاء حساب جديد" />

             <div className="steps-progress-container" role="progressbar"
               aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax={totalSteps}>
              <div className="steps-info">
                 <div className="current-step-info">
                   <span className="step-icon">{stepInfo[currentStep]?.icon}</span>
                   <div className="step-details">
                     <h3 className="step-title">{stepInfo[currentStep]?.title}</h3>
                     <p className="step-description">{stepInfo[currentStep]?.description}</p>
                   </div>
                 </div>
                  <div className="steps-dots-header">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i + 1}
                    className={`step-dot-header ${currentStep >= i + 1 ? 'completed' : ''} ${currentStep === i + 1 ? 'active' : ''}`}
                    aria-label={`الخطوة ${i + 1}: ${stepInfo[i + 1]?.title}`}
                    onClick={() => goToStep(i + 1)}
                    role="button"
                    tabIndex={0}
                  >
                    {currentStep > i + 1 ? '✓' : i + 1}
                  </div>
                ))}
                  </div>
              </div>

              <div className="progress-indicator">
                <div className={`progress-bar ${formSubmitted ? 'complete' : isLoading ? 'processing' : ''}`}
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
             </div>
             </header>
            <UserForm
              addUser={addUser}         
              isLoading={isLoading}
              className="premium-form"
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onNextStep={nextStep}
              onPreviousStep={previousStep}
            />

            <footer className="form-footer">
              <div className="security-badge"><span className="badge-icon">🔒</span><span className="badge-text">بياناتك محمية</span></div>
              <div className="support-info">
                <p className="support-text">تحتاج مساعدة؟
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

const OptimizedAddUserPage = React.memo(AddUserPage);
OptimizedAddUserPage.displayName = 'AddUserPage';
export default OptimizedAddUserPage;

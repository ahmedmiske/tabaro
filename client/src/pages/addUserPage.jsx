// src/pages/AddUserPage.jsx
import React, { useState, useEffect, useCallback, useMemo , useRef  } from 'react';
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
  window.addEventListener('error', (e) => {
    handleResizeObserverError(e);
  });
  window.addEventListener('unhandledrejection', (event) => {
    // لا تمنع باقي الأخطاء حتى لا تختفي مشاكل API
    if (handleResizeObserverError(event)) return;
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

  const formSectionRef = useRef(null);

  const scrollToFormTop = useCallback(() => {
    if (formSectionRef.current) {
      formSectionRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(
    () => () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleResizeObserverError);
      }
    },
    [],
  );

  useEffect(() => {
    setAnimationClass('fade-in-entrance');
    const t = setTimeout(() => setAnimationClass('welcome-ready'), 500);
    return () => clearTimeout(t);
  }, []);

  // ✅ عناوين الخطوات متطابقة مع محتوى UserForm
  const stepInfo = useMemo(
    () => ({
      1: {
        title: 'اختيار نوع الحساب',
        description: 'اختر هل ستسجل كفرد أم كمؤسسة.',
        icon: '👤',
      },
      2: {
        title: 'بيانات التواصل',
        description: 'أدخل رقم الهاتف، ورقم واتساب (اختياري)، والبريد الإلكتروني إن وجد.',
        icon: '📞',
      },
      3: {
        title: 'البيانات الأساسية',
        description: 'أضف اسمك وبياناتك الشخصية أو بيانات المؤسسة وصورتك إن رغبت.',
        icon: '📝',
      },
      4: {
        title: 'الموقع الجغرافي',
        description: 'حدّد إن كنت داخل موريتانيا أو خارجها وأدخل معلومات مكان إقامتك.',
        icon: '📍',
      },
      5: {
        title: 'بيانات الدخول إلى الحساب',
        description: 'اختر اسم مستخدم وكلمة مرور بدرجة أمان متوسطة ثم اضغط على زر تسجيل.',
        icon: '🔐',
      },
    }),
    [],
  );

      const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((p) => p + 1);
      scrollToFormTop();
      setTimeout(() => setAnimationClass('step-forward'), 0);
    }
  }, [currentStep, totalSteps, scrollToFormTop]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      scrollToFormTop();
      setTimeout(() => setAnimationClass('step-backward'), 0);
    }
  }, [currentStep, scrollToFormTop]);


  const goToStep = useCallback(
    (step) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
        setTimeout(() => setAnimationClass('step-jump'), 0);
      }
    },
    [totalSteps],
  );
       const mapBackendErrorToFriendly = (backendMessage) => {
    const msg = String(backendMessage || '').toLowerCase();

    if (msg.includes('e11000') && msg.includes('username')) {
      return 'اسم المستخدم مستعمَل من قبل. من فضلك اختر اسم مستخدم آخر.';
    }
    if (msg.includes('e11000') && msg.includes('phonenumber')) {
      return 'رقم الهاتف هذا مسجَّل مسبقاً. إذا كان رقمك، فجرّب تسجيل الدخول بدلاً من إنشاء حساب جديد.';
    }
    if (msg.includes('e11000') && msg.includes('email')) {
      return 'هذا البريد الإلكتروني مسجَّل مسبقاً. استخدم بريدًا آخر أو جرّب تسجيل الدخول.';
    }

    if (backendMessage) return String(backendMessage);
    return 'حدث خطأ أثناء إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى.';
  };


  /**
   * ✅ إرسال فعلي إلى الخادم (multipart/form-data)
   */
      const addUser = useCallback(
    async (user) => {
      setIsLoading(true);
      setErrorMessage('');
      setAnimationClass('processing');

      try {
        const fd = new FormData();
        Object.entries(user).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === 'confirmPassword') return;
          fd.append(k, v);
        });

        const res = await fetchWithInterceptors('/api/users', {
          method: 'POST',
          body: fd,
        });

        if (!res?.ok) {
          const raw =
            res?.body?.message ||
            res?.body?.error ||
            res?.message ||
            'فشل إنشاء الحساب';
          throw new Error(raw);
        }

        setSuccessMessage(
          'تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور التي اخترتها.',
        );
        setFormSubmitted(true);
        setAnimationClass('success-celebration');
        setCurrentStep(totalSteps);

        // 🔽 بعد النجاح نرجع لأعلى الصفحة
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 50);
        }
      } catch (err) {
        console.error('💥 خطأ في إنشاء المستخدم:', err);
        setErrorMessage(mapBackendErrorToFriendly(err?.message));
        setAnimationClass('error-shake');
        setTimeout(() => setAnimationClass(''), 2000);
      } finally {
        setIsLoading(false);
      }
    },
    [totalSteps, mapBackendErrorToFriendly],
  );


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
    setTimeout(() => {
      setErrorMessage('');
      setAnimationClass('');
    }, 300);
  }, []);

  return (
    <div
      className={`signup-layout ${animationClass} ${
        formSubmitted ? 'success-only' : ''
      }`}
      role="main"
      aria-label="صفحة التسجيل"
    >
        {!formSubmitted && (
        <section
          className="signup-image-section fullscreen-image"
          aria-label="منطقة الترحيب البصرية"
        />
      )}

      {/* منطقة النموذج */}
      <section className="signup-form-section" aria-label="نموذج إنشاء الحساب">
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

        {formSubmitted ? (
          // ✅ واجهة ما بعد النجاح
          <div className="success-container simple-success" role="status" aria-live="polite">
            <div className="success-icon-circle">✅</div>
            <h3 className="success-title">تم إنشاء حسابك بنجاح</h3>
            <p className="success-message">
              يمكنك الآن تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور التي اخترتها.
            </p>

            <div className="success-actions-row">
              {/* الزر الأساسي: تسجيل الدخول */}
              <button
                className="btn btn-success-main"
                onClick={() => {
                  window.location.href = '/login';
                }}
                disabled={isLoading}
              >
                <span className="btn-text">الانتقال إلى تسجيل الدخول</span>
              </button>

              {/* زر ثانوي: العودة للرئيسية */}
              <button
                className="btn btn-success-secondary"
                onClick={() => {
                  window.location.href = '/';
                }}
                disabled={isLoading}
              >
                <span className="btn-text">الذهاب إلى الرئيسية</span>
              </button>
            </div>

            {/* خيار خفيف لإنشاء حساب آخر */}
            <button
              type="button"
              className="btn btn-success-link"
              onClick={handleResetForm}
              disabled={isLoading}
            >
              إنشاء حساب آخر
            </button>
          </div>
        ) : (
          <div className="form-container">
            <header className="form-header">
              <TitleMain title="إنشاء حساب جديد" />

              <div
                className="steps-progress-container"
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin="1"
                aria-valuemax={totalSteps}
              >
                <div className="steps-info">
                  <div className="current-step-info">
                    <span className="step-icon">{stepInfo[currentStep]?.icon}</span>
                    <div className="step-details">
                      <h3 className="step-title">{stepInfo[currentStep]?.title}</h3>
                      <p className="step-description">
                        {stepInfo[currentStep]?.description}
                      </p>
                    </div>
                  </div>

                  <div className="steps-dots-header">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i + 1}
                        className={`step-dot-header ${
                          currentStep >= i + 1 ? 'completed' : ''
                        } ${currentStep === i + 1 ? 'active' : ''}`}
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
                  <div
                    className={`progress-bar ${
                      formSubmitted ? 'complete' : isLoading ? 'processing' : ''
                    }`}
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
              <div className="security-badge">
                <span className="badge-icon">🔒</span>
                <span className="badge-text">بياناتك محمية</span>
              </div>
              <div className="support-info">
                <p className="support-text">
                  تحتاج مساعدة؟
                  <a href="/support" className="support-link">
                    تواصل معنا
                  </a>
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

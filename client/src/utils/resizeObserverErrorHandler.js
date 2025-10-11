/**
 * 🛠️ معالج شامل لأخطاء ResizeObserver
 * 
 * @description معالج متقدم لحل مشاكل ResizeObserver الشائعة في React
 * @author PNDD Development Team
 * @version 1.0.0
 */

class ResizeObserverErrorHandler {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  /**
   * تهيئة معالج الأخطاء
   */
  init() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    // معالج خطأ ResizeObserver الأساسي
    this.handleResizeObserverError = (event) => {
      if (this.isResizeObserverError(event)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // معالج الوعود المرفوضة
    this.handleUnhandledRejection = (event) => {
      if (this.isResizeObserverError(event.reason)) {
        event.preventDefault();
        return false;
      }
    };

    // تثبيت معالجات الأخطاء
    window.addEventListener('error', this.handleResizeObserverError, true);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection, true);

    // تخصيص console.error لتصفية الأخطاء
    this.overrideConsoleError();

    this.isInitialized = true;
  }

  /**
   * فحص إذا كان الخطأ متعلق بـ ResizeObserver
   */
  isResizeObserverError(error) {
    const errorMessage = error?.message || error?.toString() || '';
    return errorMessage.includes('ResizeObserver loop completed with undelivered notifications') ||
           errorMessage.includes('ResizeObserver loop limit exceeded');
  }

  /**
   * تخصيص console.error لتصفية أخطاء ResizeObserver
   */
  overrideConsoleError() {
    const originalError = console.error.bind(console);
    
    console.error = (...args) => {
      // فحص إذا كان أي من المعاملات يحتوي على خطأ ResizeObserver
      const hasResizeObserverError = args.some(arg => 
        this.isResizeObserverError(arg)
      );

      if (!hasResizeObserverError) {
        originalError(...args);
      }
    };
  }

  /**
   * إيقاف معالج الأخطاء وتنظيف الموارد
   */
  cleanup() {
    if (!this.isInitialized || typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('error', this.handleResizeObserverError, true);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection, true);
    
    this.isInitialized = false;
  }

  /**
   * إعادة تعيين معالج الأخطاء
   */
  reset() {
    this.cleanup();
    this.init();
  }
}

// إنشاء معالج شامل واحد
const resizeObserverErrorHandler = new ResizeObserverErrorHandler();

// تصدير المعالج للاستخدام في أماكن أخرى
export default resizeObserverErrorHandler;

// تصدير الكلاس للاستخدام المتقدم
export { ResizeObserverErrorHandler };
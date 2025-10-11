// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// 🛠️ معالج شامل لخطأ ResizeObserver في بيئة الاختبارات
global.ResizeObserver = global.ResizeObserver || 
  class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      // مكان فارغ لتجنب الأخطاء
    }
    unobserve() {
      // مكان فارغ لتجنب الأخطاء
    }
    disconnect() {
      // مكان فارغ لتجنب الأخطاء
    }
  };

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom'; // استيراد BrowserRouter

import './index.css';
import App from './App.jsx';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// 🛠️ استيراد معالج الأخطاء الشامل
import './utils/resizeObserverErrorHandler';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>  {/* لف التطبيق بـ BrowserRouter */}
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring الأداء في تطبيقك، مرر دالة
// لتسجيل النتائج (على سبيل المثال: reportWebVitals(console.log))
// أو إرسالها إلى نقطة تحليل. تعلم المزيد: https://bit.ly/CRA-vitals
reportWebVitals();

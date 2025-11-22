// src/components/HeaderSearch.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

import './HeaderSearch.css';

function HeaderSearch() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef(null);

  // 🔄 إغلاق لوحة البحث في الموبايل عند تغيير الصفحة
  useEffect(() => {
    setMobileOpen(false);
    setQuery('');
  }, [location.pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // 🔎 التوجيه إلى صفحة نتائج البحث
    // تأكد أن صفحة النتائج تقرأ param "query"
    navigate(`/search?q=${encodeURIComponent(q)}`);


  };

  const handleIconClick = () => {
    // لو شاشة صغيرة → نفتح/نغلق اللوحة
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        setMobileOpen((prev) => !prev);
        // تركيز في الحقل عند الفتح
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }
    }

    // في الديسكتوب فقط فوكس على الحقل
    inputRef.current?.focus();
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
    setQuery('');
  };

  return (
    <div
      className={`hs-wrapper ${mobileOpen ? 'hs-mobile-open' : ''}`}
      aria-label="بحث داخل المنصة"
    >
      {/* زر الأيقونة (يستخدم في الموبايل والديسكتوب) */}
      <button
        type="button"
        className="hs-icon-btn"
        onClick={handleIconClick}
        aria-label="فتح البحث"
      >
        <FiSearch />
      </button>

      {/* نفس الفورم يُستخدم في الديسكتوب والموبايل، والتصميم يعتمد على الـ CSS */}
      <form
        className="hs-form"
        role="search"
        method="get"
        onSubmit={handleSubmit}
      >
        <input
          ref={inputRef}
          type="search"
          name="query"
          className="hs-input"
          placeholder="ابحث عن طلب تبرع، متبرع، أو مدينة..."
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="حقل البحث عن طلبات التبرع"
        />
        <button type="submit" className="hs-submit" aria-label="تنفيذ البحث">
          <FiSearch />
        </button>

        {/* زر إغلاق يظهر فقط في الموبايل (بالـ CSS) */}
        <button
          type="button"
          className="hs-close-mobile"
          onClick={handleCloseMobile}
          aria-label="إغلاق البحث"
        >
          <FiX />
        </button>
      </form>
    </div>
  );
}

export default HeaderSearch;

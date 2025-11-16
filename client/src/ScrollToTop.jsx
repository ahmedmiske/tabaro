// src/ScrollToTop.jsx
import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * هذا الكومبوننت مسؤول عن إرجاع السكروول إلى أعلى الصفحة
 * عند كل تغيير في المسار (pathname)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // لو عندك حاوية سكروول داخلية مثل .page-wrapper
    const wrapper = document.querySelector(".page-wrapper");

    if (wrapper) {
      wrapper.scrollTop = 0;
    }

    // احتياط: إجبار سكروول الصفحة نفسها
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;

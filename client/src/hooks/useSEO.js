// client/src/hooks/useSEO.js
import { useEffect } from 'react';
export default function useSEO({
  title,
  description,
  canonical,
  lang = 'ar',
  dir = 'rtl',
  meta = {},        // { 'og:title': '...', 'twitter:card': '...' }
}) {
  useEffect(() => {
    // لغة واتجاه الصفحة
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    // العنوان
    if (title) document.title = title;

    // الوصف
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    // وسوم إضافية (OG/Twitter…)
    Object.entries(meta).forEach(([name, content]) => {
      // يدعم property (لـ OG) وname (لباقي الوسوم)
      const isOG = name.startsWith('og:');
      const selector = isOG
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;

      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (isOG) tag.setAttribute('property', name);
        else tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  }, [title, description, canonical, lang, dir, JSON.stringify(meta)]);
}

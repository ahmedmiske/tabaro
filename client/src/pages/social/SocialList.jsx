import React, { useEffect, useState } from 'react';
import { listSocialAds } from '../../services/api/socialAds.api.js';
import SocialFilters from '../../components/social/SocialFilters.jsx';
import SocialCard from '../../components/social/SocialCard.jsx';
import '../../styles/social/social.css';

const DEFAULT_FILTERS = { category: '', wilaya: '', city: '', q: '' };

function SocialList() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // يمكنك لاحقًا جلب الولايات/المدن من API
  const wilayas = ['نواكشوط', 'نواذيبو', 'اترارزة', 'الحوض الغربي', 'الحوض الشرقي'];
  const cities = ['تفرغ زينة', 'عرفات', 'لكصر', 'ازويرات', 'روصو'];

  const load = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await listSocialAds({
        status: 'Published',
        ...filters,
        page: 1,
        limit: 20,
      });
      setAds(data?.items || data || []);
    } catch (e) {
      setErr(e.message || 'حدث خطأ أثناء التحميل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters.category, filters.wilaya, filters.city, filters.q]);

  return (
    <section className="social-wrap" dir="rtl" aria-labelledby="social-title">
      <header className="social-header">
        <h1 id="social-title">الإعلانات الاجتماعية</h1>
        <p className="lead">منصة وطنية لنشر المبادرات والأفكار والوظائف وبلاغات المفقودين.</p>
      </header>

      <SocialFilters value={filters} onChange={setFilters} wilayas={wilayas} cities={cities} />

      {loading && <div className="state">جارِ التحميل…</div>}
      {err && <div className="state state--error">{err}</div>}

      {!loading && !err && (
        ads.length ? (
          <div className="social-grid">
            {ads.map((ad) => <SocialCard key={ad._id} ad={ad} />)}
          </div>
        ) : (
          <div className="state">لا توجد إعلانات مطابقة الآن.</div>
        )
      )}
    </section>
  );
}

export default SocialList;

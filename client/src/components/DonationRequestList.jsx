import React, { useEffect, useMemo, useState } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { Link } from 'react-router-dom';
import TitleMain from './TitleMain.jsx';
import FindeNot from './FindeNot';
import './DonationRequestList.css';

const DEFAULT_Q = {
  category: '',
  type: '',
  place: '',
  urgent: false,
  page: 1,
  limit: 12,
};

function DonationRequestList() {
  // بيانات الطلبات من الـ API
  const [items, setItems] = useState([]);

  // حالة الفلاتر
  const [q, setQ] = useState(DEFAULT_Q);

  // تحميل / خطأ / ميتا صفحات
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  // تحكم بفتح/غلق كل قائمة منسدلة
  const [openCategory, setOpenCategory] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openPlace, setOpenPlace] = useState(false);

  // ============ جلب البيانات ============
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q.category) params.set('category', q.category);
      if (q.type) params.set('type', q.type);
      if (q.place) params.set('place', q.place);
      if (q.urgent) params.set('urgent', '1');
      params.set('page', q.page);
      params.set('limit', q.limit);

      const res = await fetchWithInterceptors(
        `/api/donationRequests?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error(res.body?.message || 'فشل جلب البيانات');
      }

      const list = res.body?.data || [];
      const pagination =
        res.body?.pagination ||
        {
          total: list.length,
          pages: 1,
          page: q.page,
          limit: q.limit,
        };

      setItems(list);
      setMeta(pagination);
    } catch (err) {
      console.error(err);
      setError(err.message || 'تعذر تحميل القائمة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.page, q.category, q.type, q.place, q.urgent]);

  // ============ لوائح الخيارات الديناميكية ============
  const categories = useMemo(
    () => [...new Set(items.map(i => i.category).filter(Boolean))],
    [items]
  );

  const types = useMemo(() => {
    const source = q.category
      ? items.filter(i => i.category === q.category)
      : items;
    return [...new Set(source.map(i => i.type).filter(Boolean))];
  }, [items, q.category]);

  const places = useMemo(
    () => [...new Set(items.map(i => i.place).filter(Boolean))],
    [items]
  );

  // ============ أدوات ============
  const truncate = (txt, n = 110) => {
    if (!txt) return '—';
    return txt.length > n ? txt.slice(0, n) + '…' : txt;
  };

  const resetFilters = () => {
    setQ({ ...DEFAULT_Q });
    setOpenCategory(false);
    setOpenType(false);
    setOpenPlace(false);
  };

  // تحديث فلتر + إرجاع للصفحة 1
  const setFilter = (key, value) => {
    setQ(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  // عند اختيار عنصر من القائمة المنسدلة
  const selectCategory = (val) => {
    setFilter('category', val === q.category ? '' : val);
    setOpenCategory(false);
  };
  const selectType = (val) => {
    setFilter('type', val === q.type ? '' : val);
    setOpenType(false);
  };
  const selectPlace = (val) => {
    setFilter('place', val === q.place ? '' : val);
    setOpenPlace(false);
  };

  return (
    <section className="donation-requests-wrapper" dir="rtl">
      {/* ===== العنوان الرئيسي أعلى الصفحة ===== */}
      <header className="donation-header-block">
        <TitleMain
          title={
            <>
              الطلبات العامة للتبرع <span className="heart-emoji">💚</span>
            </>
          }
          subtitle="طلبات متنوعة: مساعدة اجتماعية / دعم مادي / مستلزمات / سكن / غذاء..."
          align="center"
          size="lg"
        />
      </header>

      {/* ===== الفلاتر ===== */}
      <div className="filter-bar-box">
        {/* 1. الأولوية (مستعجل فقط) */}
        <div className="filter-block priority-block">
          <div className="filter-block-label">الأولوية</div>

          <label className="mini-toggle" aria-label="مستعجل فقط">
            <input
              type="checkbox"
              checked={q.urgent}
              onChange={(e) => setFilter('urgent', e.target.checked)}
            />
            <span className="mini-toggle-ui"></span>
          </label>

          <div className="urgent-caption">
            <span className="sirene">🚨</span>
            <span>مستعجل فقط</span>
          </div>

          <button
            type="button"
            className="reset-btn"
            onClick={resetFilters}
          >
            مسح الفلاتر
          </button>
        </div>

        {/* 2. المكان */}
        <div className="filter-block">
          <div className="filter-block-label">المكان</div>

          <button
            type="button"
            className={`filter-chip dropdown-trigger ${openPlace ? 'open' : ''}`}
            onClick={() => {
              setOpenPlace(!openPlace);
              setOpenCategory(false);
              setOpenType(false);
            }}
          >
            <span className="filter-chip-text">
              {q.place ? q.place : 'كل الأماكن'}
            </span>
            <span className="caret">▾</span>
          </button>

          {openPlace && places.length > 0 && (
            <div className="dropdown-list">
              {places.map(p => (
                <button
                  type="button"
                  key={p}
                  className={
                    'dropdown-item ' + (q.place === p ? 'active' : '')
                  }
                  onClick={() => selectPlace(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="dropdown-item clear"
                onClick={() => selectPlace('')}
              >
                كل الأماكن
              </button>
            </div>
          )}
        </div>

        {/* 3. نوع الطلب */}
        <div className="filter-block">
          <div className="filter-block-label">نوع الطلب</div>

          <button
            type="button"
            className={`filter-chip dropdown-trigger ${openType ? 'open' : ''}`}
            disabled={!types.length}
            onClick={() => {
              if (!types.length) return;
              setOpenType(!openType);
              setOpenCategory(false);
              setOpenPlace(false);
            }}
          >
            <span className="filter-chip-text">
              {q.type ? q.type : 'كل الأنواع'}
            </span>
            <span className="caret">▾</span>
          </button>

          {openType && types.length > 0 && (
            <div className="dropdown-list">
              {types.map(t => (
                <button
                  type="button"
                  key={t}
                  className={
                    'dropdown-item ' + (q.type === t ? 'active' : '')
                  }
                  onClick={() => selectType(t)}
                >
                  {t}
                </button>
              ))}
              <button
                type="button"
                className="dropdown-item clear"
                onClick={() => selectType('')}
              >
                كل الأنواع
              </button>
            </div>
          )}
        </div>

        {/* 4. المجال */}
        <div className="filter-block">
          <div className="filter-block-label">المجال</div>

          <button
            type="button"
            className={`filter-chip dropdown-trigger ${openCategory ? 'open' : ''}`}
            onClick={() => {
              setOpenCategory(!openCategory);
              setOpenPlace(false);
              setOpenType(false);
            }}
          >
            <span className="filter-chip-text">
              {q.category ? q.category : 'كل المجالات'}
            </span>
            <span className="caret">▾</span>
          </button>

          {openCategory && categories.length > 0 && (
            <div className="dropdown-list">
              {categories.map(cat => (
                <button
                  type="button"
                  key={cat}
                  className={
                    'dropdown-item ' + (q.category === cat ? 'active' : '')
                  }
                  onClick={() => selectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                className="dropdown-item clear"
                onClick={() => selectCategory('')}
              >
                كل المجالات
              </button>
            </div>
          )}
        </div>
      </div>

      {/* خط واحد فاصل تحت الفلاتر */}
      <div className="single-divider" />

      {/* ===== عرض القائمة / تحميل / خطأ ===== */}
      {loading ? (
        <div className="state-box">
          <div className="spinner-ring" />
          <div className="state-text">جارٍ التحميل…</div>
        </div>
      ) : error ? (
        <div className="state-box error">{error}</div>
      ) : (
        <>
          <div className="donation-grid">
            {items.length === 0 ? (
              <FindeNot />
            ) : (
              items.map((item) => (
                <article
                  key={item._id}
                  className="donation-card"
                >
                  <div className="donation-card-inner">
                    {/* رأس البطاقة */}
                    <div className="donation-card-head-colored">
                      <div className="donation-head-right">
                        <div className="donation-cat">
                          {item.category || '—'}
                        </div>
                        <div className="donation-type">
                          {item.type || '—'}
                        </div>
                        <div className="donation-place">
                          {item.place || '—'}
                        </div>
                      </div>

                      <div
                        className={
                          'urgency-badge ' +
                          (item.isUrgent ? 'urgent' : 'normal')
                        }
                      >
                        {item.isUrgent ? 'مستعجل' : 'عادي'}
                      </div>
                    </div>

                    {/* مبلغ */}
                    {'amount' in item && (
                      <div className="donation-amount-row">
                        <span className="label">المبلغ المطلوب:</span>
                        <span className="value">
                          {item.amount ?? '—'}
                        </span>
                      </div>
                    )}

                    {/* الوصف */}
                    <div className="donation-desc">
                      {truncate(item.description)}
                    </div>

                    {/* فوتر */}
                    <div className="donation-card-footer">
                      <div className="donation-date">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              'ar-MA'
                            )
                          : ''}
                      </div>

                      <Link
                        to={`/donations/${item._id}`}
                        className="details-btn"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* pagination */}
          {items.length > 0 && (
            <div className="pagination-bar">
              <button
                className="pg-btn prev"
                disabled={q.page <= 1}
                onClick={() =>
                  setQ(prev => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
              >
                <span className="arrow">⬅</span>
                <span>السابقة</span>
              </button>

              <span className="pg-info">
                الصفحة {q.page} من {meta.pages || 1}
              </span>

              <button
                className="pg-btn next"
                disabled={q.page >= (meta.pages || 1)}
                onClick={() =>
                  setQ(prev => ({
                    ...prev,
                    page: Math.min(
                      prev.page + 1,
                      meta.pages || 1
                    ),
                  }))
                }
              >
                <span>التالية</span>
                <span className="arrow">➡</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DonationRequestList;

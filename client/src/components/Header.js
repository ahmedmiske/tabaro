import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown, FiSearch, FiShoppingCart, FiUser, FiBell,
  FiHeart, FiUsers, FiHelpCircle, FiDroplet, FiGrid, FiMenu, FiX, FiList
} from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Header.css';

function Header({ notifCount }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ===== حالة المستخدم + مزامنة فورية =====
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  const isAuthed = !!user;

  const syncUser = useCallback(() => {
    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); }
    catch { setUser(null); }
  }, []);

  useEffect(() => { syncUser(); }, [syncUser]);
  useEffect(() => { syncUser(); }, [location.key, syncUser]);
  useEffect(() => {
    const onFocus = () => syncUser();
    const onStorage = (e) => {
      if (!e.key || e.key === 'user' || e.key === 'token') syncUser();
    };
    const onAuthChanged = () => syncUser();

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', onAuthChanged);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', onAuthChanged);
    };
  }, [syncUser]);

  // اسم العرض + حرف الأفاتار
  const displayName = useMemo(() => {
    if (!user) return '';
    const fn = user.firstName || user.given_name || '';
    const ln = user.lastName || user.family_name || '';
    const full = `${fn} ${ln}`.trim();
    return full || user.username || user.email || 'الحساب';
  }, [user]);
  const avatarLetter = (displayName || 'ح').trim().charAt(0).toUpperCase();

  // ===== باقي الحالة =====
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);          // 'blood' | 'general' | 'campaigns' | 'about' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(
    Number.isFinite(notifCount) ? notifCount : 0
  );

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const onSubmit = (e) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    navigate(`/search?query=${encodeURIComponent(s)}`);
    setQ('');
    setOpen(null);
    setMobileOpen(false);
  };

  // إغلاق عند النقر خارج/زر Esc
  const rootRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) { setOpen(null); setMobileOpen(false); }
    };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setMobileOpen(false); } };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // ضبط ارتفاع الهيدر للميغا
  useEffect(() => {
    const el = document.querySelector('.eh-header');
    if (!el) return;
    const updateVar = () => el.style.setProperty('--header-height', `${Math.round(el.getBoundingClientRect().height)}px`);
    updateVar();
    window.addEventListener('resize', updateVar);
    return () => window.removeEventListener('resize', updateVar);
  }, []);

  // قفل تمرير الصفحة عند فتح الدرج
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // جلب عدد الإشعارات إن لم يصل prop
  useEffect(() => {
    let stop = false;
    let timer;
    const loadCount = async () => {
      try {
        const { body, ok } = await fetchWithInterceptors('/api/notifications');
        if (!ok) return;
        const list = body?.data || body || [];
        const unread = Array.isArray(list) ? list.filter(n => !n.read).length : 0;
        if (!stop) setBadgeCount(unread);
      } catch { /* silent */ }
    };

    if (!Number.isFinite(notifCount)) {
      loadCount();
      timer = setInterval(loadCount, 30000);
    } else {
      setBadgeCount(notifCount);
    }
    return () => { stop = true; if (timer) clearInterval(timer); };
  }, [notifCount]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setOpen(null);
    setMobileOpen(false);
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/login');
  };

  return (
    <header className="eh-header" dir="rtl" ref={rootRef}>
      <div className="eh-container">
        {/* الشعار + السطر التعريفي */}
        <Link to="/" className="eh-brand" aria-label="الرئيسية">
          <img src="/logo.png" alt="الشعار" />
          <div className="eh-brand-caption" aria-hidden="true">
            <span className="eh-brand-slogan">المنصة الوطنية للتبرع</span>
          </div>
        </Link>

        {/* زر الهامبرغر */}
        <button
          className="eh-burger"
          aria-label="فتح القائمة"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* القائمة الرئيسية (سطح المكتب) */}
        <nav className="eh-nav" role="menubar" aria-label="القائمة الرئيسية">
          <Link to="/" className={`eh-link ${isActive('/') ? 'active' : ''}`}>الرئيسية</Link>

          {/* التبرع بالدم */}
          <div
            className={`eh-item ${open==='blood' ? 'open' : ''}`}
            onMouseEnter={() => setOpen('blood')}
          >
            <button
              type="button"
              className={`eh-link ${isActive('/blood-donations') ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={open==='blood'}
              onClick={() => setOpen(prev => prev === 'blood' ? null : 'blood')}
            >
              التبرع بالدم <FiChevronDown className="eh-caret" />
            </button>
          </div>

          {/* تبرعات عامة */}
          <div
            className={`eh-item ${open==='general' ? 'open' : ''}`}
            onMouseEnter={() => setOpen('general')}
          >
            <button
              type="button"
              className={`eh-link ${isActive('/donations') ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={open==='general'}
              onClick={() => setOpen(prev => prev === 'general' ? null : 'general')}
            >
              تبرعات عامة <FiChevronDown className="eh-caret" />
            </button>
          </div>

          {/* حملات التبرع */}
          <div
            className={`eh-item ${open==='campaigns' ? 'open' : ''}`}
            onMouseEnter={() => setOpen('campaigns')}
          >
            <button
              type="button"
              className={`eh-link ${isActive('/campaigns') ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={open==='campaigns'}
              onClick={() => setOpen(prev => prev === 'campaigns' ? null : 'campaigns')}
            >
              حملات التبرع <FiChevronDown className="eh-caret" />
            </button>
          </div>

          {/* عن المنصة */}
          <div
            className={`eh-item ${open==='about' ? 'open' : ''}`}
            onMouseEnter={() => setOpen('about')}
          >
            <button
              type="button"
              className={`eh-link ${isActive('/about') ? 'active' : ''}`}
              aria-haspopup="true"
              aria-expanded={open==='about'}
              onClick={() => setOpen(prev => prev === 'about' ? null : 'about')}
            >
              عن المنصة <FiChevronDown className="eh-caret" />
            </button>
          </div>
        </nav>

        {/* أدوات يمين */}
        <div className="eh-actions">
          <form className="eh-search" role="search" onSubmit={onSubmit}>
            <input
              className="eh-search-input"
              type="search"
              placeholder="ابحث عن حالة/متبرّع/مدينة…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="بحث"
            />
            <button className="eh-search-btn" type="submit" aria-label="بحث">
              <FiSearch />
            </button>
          </form>

          <Link to="/cart" className="eh-iconbtn" title="سلة التبرعات">
            <FiShoppingCart />
          </Link>

          {!isAuthed ? (
            <Link to="/login" className="eh-login">
              <FiUser className="ms-1" /> تسجيل الدخول
            </Link>
          ) : (
            <div className="eh-user">
              <Link to="/notifications" className="eh-iconbtn eh-bell" aria-label="الإشعارات">
                <FiBell />
                { badgeCount > 0 && <span className="eh-badge">{badgeCount}</span> }
              </Link>

              <div className="eh-userchip" title={displayName}>
                <span className="eh-avatar" aria-hidden="true">{avatarLetter}</span>
                <span className="eh-username">{displayName}</span>
              </div>

              <button className="eh-logout" onClick={logout}>خروج</button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Mega: التبرع بالدم ===== */}
      <div
        className={`eh-mega ${open==='blood' ? 'open' : ''}`}
        onMouseEnter={() => setOpen('blood')}
        onMouseLeave={() => setOpen(null)}
      >
        <div className="eh-mega-wrap">
          <div className="eh-mega-grid">
            <Link to="/blood-donation" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiDroplet /></span>
              <span className="eh-mega-title">زر التبرع بالدم</span>
              <span className="eh-mega-sub">سجّل رغبتك بالتبرع الآن</span>
            </Link>
            <Link to="/blood-donation" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiList /></span>
              <span className="eh-mega-title">طلب التبرع</span>
              <span className="eh-mega-sub">إضافة طلب جديد</span>
            </Link>
            <Link to="/blood-donations" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiGrid /></span>
              <span className="eh-mega-title">قائمة الطلبات</span>
              <span className="eh-mega-sub">تصفّح وفلترة</span>
            </Link>
            <Link to="/donors/blood" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiUsers /></span>
              <span className="eh-mega-title">المتبرعون</span>
              <span className="eh-mega-sub">المتبرعون المسجّلون</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Mega: تبرعات عامة ===== */}
      <div
        className={`eh-mega ${open==='general' ? 'open' : ''}`}
        onMouseEnter={() => setOpen('general')}
        onMouseLeave={() => setOpen(null)}
      >
        <div className="eh-mega-wrap">
          <div className="eh-mega-grid">
            <Link to="/donation-requests" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiHeart /></span>
              <span className="eh-mega-title">تبرعات عامة</span>
              <span className="eh-mega-sub">ابدأ تبرعًا الآن</span>
            </Link>
            <Link to="/donation-requests" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiList /></span>
              <span className="eh-mega-title">طلب التبرع</span>
              <span className="eh-mega-sub">أنشئ طلبًا عامًا</span>
            </Link>
            <Link to="/donations" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiGrid /></span>
              <span className="eh-mega-title">قائمة الطلبات</span>
              <span className="eh-mega-sub">تصفية حسب النوع</span>
            </Link>
            <Link to="/donors/general" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiUsers /></span>
              <span className="eh-mega-title">المتبرعون</span>
              <span className="eh-mega-sub">المتبرعون العامّون</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Mega: حملات التبرع ===== */}
      <div
        className={`eh-mega ${open==='campaigns' ? 'open' : ''}`}
        onMouseEnter={() => setOpen('campaigns')}
        onMouseLeave={() => setOpen(null)}
      >
        <div className="eh-mega-wrap">
          <div className="eh-mega-grid">
            <Link to="/campaigns" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiGrid /></span>
              <span className="eh-mega-title">قائمة الحملات</span>
              <span className="eh-mega-sub">استكشف الحملات</span>
            </Link>
            <Link to="/campaigns/create" className="eh-mega-item" onClick={() => setOpen(null)}>
              <span className="eh-mega-icon"><FiHeart /></span>
              <span className="eh-mega-title">إنشاء حملة</span>
              <span className="eh-mega-sub">أطلق حملتك الآن</span>
            </Link>
          </div>
        </div>
      </div>

      {/* درج الموبايل/المتوسط — يغلق عند الضغط على الخلفية */}
      <div
        className={`eh-drawer ${mobileOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="قائمة الموبايل"
        aria-modal="true"
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      >
        <div className="eh-drawer-panel" onClick={(e)=>e.stopPropagation()}>
          <button
            className="eh-burger"
            aria-label="إغلاق القائمة"
            onClick={() => setMobileOpen(false)}
            style={{ marginInlineStart: 'auto', marginBottom: 8 }}
          >
            <FiX />
          </button>

          <form className="eh-drawer-search" role="search" onSubmit={onSubmit}>
            <input
              type="search"
              placeholder="ابحث…"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              aria-label="بحث في الموبايل"
            />
            <button type="submit"><FiSearch/></button>
          </form>

          <Link to="/" className="eh-drawer-link" onClick={()=>setMobileOpen(false)}>الرئيسية</Link>

          <details className="eh-drawer-group">
            <summary>التبرع بالدم</summary>
            <Link to="/donations/blood/request" onClick={()=>setMobileOpen(false)}>زر التبرع بالدم</Link>
            <Link to="/donations/blood/request" onClick={()=>setMobileOpen(false)}>طلب التبرع</Link>
            <Link to="/donations/blood" onClick={()=>setMobileOpen(false)}>قائمة الطلبات</Link>
            <Link to="/donors/blood" onClick={()=>setMobileOpen(false)}>المتبرعون</Link>
          </details>

          <details className="eh-drawer-group">
            <summary>تبرعات عامة</summary>
            <Link to="/donations/general/give" onClick={()=>setMobileOpen(false)}>تبرعات عامة</Link>
            <Link to="/donations/general/request" onClick={()=>setMobileOpen(false)}>طلب التبرع</Link>
            <Link to="/donations/general" onClick={()=>setMobileOpen(false)}>قائمة الطلبات</Link>
            <Link to="/donors/general" onClick={()=>setMobileOpen(false)}>المتبرعون</Link>
          </details>

          <details className="eh-drawer-group">
            <summary>حملات التبرع</summary>
            <Link to="/campaigns" onClick={()=>setMobileOpen(false)}>قائمة الحملات</Link>
            <Link to="/campaigns/create" onClick={()=>setMobileOpen(false)}>إنشاء حملة</Link>
          </details>

          <details className="eh-drawer-group">
            <summary>عن المنصة</summary>
            <Link to="/about" onClick={()=>setMobileOpen(false)}>من نحن</Link>
            <Link to="/about/team" onClick={()=>setMobileOpen(false)}>فريق العمل</Link>
            <Link to="/about/contact" onClick={()=>setMobileOpen(false)}>تواصل معنا</Link>
          </details>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  notifCount: PropTypes.number,
};

Header.defaultProps = {
  notifCount: null,
};

export default Header;

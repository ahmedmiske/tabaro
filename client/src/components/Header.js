import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown, FiSearch, FiShoppingCart, FiUser, FiBell,
  FiHeart, FiUsers, FiHelpCircle, FiDroplet, FiGrid, FiMenu, FiX, FiList,
  FiHome
} from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Header.css';

function Header({ notifCount }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ===== User state + instant sync =====
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  const isAuthed = !!user;

  const syncUser = useCallback(() => {
    if (typeof window === 'undefined') return;
    try { setUser(JSON.parse(localStorage.getItem('user') || 'null')); }
    catch { setUser(null); }
  }, []);

  useEffect(() => { syncUser(); }, [syncUser]);
  useEffect(() => { syncUser(); }, [location.key, syncUser]);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
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

  // Display name + avatar letter
  const displayName = useMemo(() => {
    if (!user) return '';
    const fn = user.firstName || user.given_name || '';
    const ln = user.lastName || user.family_name || '';
    const full = `${fn} ${ln}`.trim();
    return full || user.username || user.email || 'الحساب';
  }, [user]);
  const avatarLetter = (displayName || 'ح').trim().charAt(0).toUpperCase();

  // ===== Other state =====
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(Number.isFinite(notifCount) ? notifCount : 0);
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = useCallback((path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path)), [location.pathname]
  );

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    const s = q.trim();
    if (!s) return;
    navigate(`/search?query=${encodeURIComponent(s)}`);
    setQ('');
    setOpen(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [navigate, q]);

  // Close on outside click / ESC
  const rootRef = useRef(null);
  const prevFocusRef = useRef(null);
  const firstDrawerFocusableRef = useRef(null);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const onDocPointer = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) { 
        setOpen(null); 
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    const onKey = (e) => { 
      if (e.key === 'Escape') { 
        setOpen(null); 
        setMobileOpen(false); 
        setSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // تحديث ارتفاع الهيدر
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const el = rootRef.current;
    if (!el) return undefined;

    const updateHeaderHeight = () => {
      const height = Math.round(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    };

    updateHeaderHeight();
    const handleResize = () => updateHeaderHeight();
    window.addEventListener('resize', handleResize);
    const interval = setInterval(updateHeaderHeight, 2000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  // Lock page scroll when drawer is open + focus management
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    if (mobileOpen) {
      prevFocusRef.current = document.activeElement;
      body.style.overflow = 'hidden';
      setTimeout(() => firstDrawerFocusableRef.current?.focus(), 0);
    } else {
      body.style.overflow = prevOverflow || '';
      const prev = prevFocusRef.current;
      if (prev && typeof prev.focus === 'function') prev.focus();
    }
    return () => { body.style.overflow = prevOverflow || ''; };
  }, [mobileOpen]);

  // Fetch notifications count if prop not provided
  useEffect(() => {
    let stop = false;
    let timer;
    const ctrl = new AbortController();

    const loadCount = async () => {
      try {
        const { body, ok } = await fetchWithInterceptors('/api/notifications', { signal: ctrl.signal });
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
    return () => { stop = true; ctrl.abort(); if (timer) clearInterval(timer); };
  }, [notifCount]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:changed'));
    }
    setUser(null);
    setOpen(null);
    setMobileOpen(false);
    navigate('/login');
  };

  // ARIA ids for groups
  const bloodId = useId();
  const generalId = useId();
  const campaignsId = useId();
  const aboutId = useId();

  return (
    <header className="eh-header-modern" dir="rtl" ref={rootRef}>
      {/* الشريط العلوي */}
      <div className="eh-top-bar">
        <div className="eh-top-container">
          <div className="eh-top-left">
            <Link to="/" className="eh-top-link">
              <FiHome />
              <span>الرئيسية</span>
            </Link>
            <Link to="/about" className="eh-top-link">
              <span>عن المنصة</span>
            </Link>
          </div>
          
          <div className="eh-top-right">
            {!isAuthed ? (
              <Link to="/login" className="eh-login-btn">
                <FiUser />
                <span>تسجيل الدخول</span>
              </Link>
            ) : (
              <div className="eh-user-mini">
                <Link to="/notifications" className="eh-icon-mini" aria-label="الإشعارات">
                  <FiBell />
                  {badgeCount > 0 && <span className="eh-badge-mini">{badgeCount}</span>}
                </Link>
                <div className="eh-user-mini-info">
                  <span className="eh-avatar-mini">{avatarLetter}</span>
                  <span className="eh-username-mini">{displayName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* الشريط الرئيسي */}
      <div className="eh-main-bar">
        <div className="eh-main-container">
           {/* الشعار في المنتصف */}
          <div className="eh-brand-center">
            <Link to="/" className="eh-brand-modern">
              <div className="eh-logo-wrapper">
                <img src="/logo.png" alt="المنصة الوطنية للتبرع" />
              </div>
              <div className="eh-brand-text">
                <span className="eh-brand-title">المنصة الوطنية للتبرع</span>
              </div>
            </Link>
          </div>
          {/* القائمة اليسرى */}
          <nav className="eh-nav-left">
            <div className={`eh-nav-item ${open==='blood' ? 'open' : ''}`}>
              <button
                className={`eh-nav-link ${isActive('/blood-donations') ? 'active' : ''}`}
                onClick={() => setOpen(open === 'blood' ? null : 'blood')}
                onMouseEnter={() => setOpen('blood')}
              >
                <FiDroplet />
                <span>التبرع بالدم</span>
                <FiChevronDown className="eh-caret" />
              </button>
            </div>

            <div className={`eh-nav-item ${open==='general' ? 'open' : ''}`}>
              <button
                className={`eh-nav-link ${isActive('/donations') ? 'active' : ''}`}
                onClick={() => setOpen(open === 'general' ? null : 'general')}
                onMouseEnter={() => setOpen('general')}
              >
                <FiHeart />
                <span>تبرعات عامة</span>
                <FiChevronDown className="eh-caret" />
              </button>
            </div>
          </nav>

         

          {/* القائمة اليمنى */}
          <nav className="eh-nav-right">
            <div className={`eh-nav-item ${open==='campaigns' ? 'open' : ''}`}>
              <button
                className={`eh-nav-link ${isActive('/campaigns') ? 'active' : ''}`}
                onClick={() => setOpen(open === 'campaigns' ? null : 'campaigns')}
                onMouseEnter={() => setOpen('campaigns')}
              >
                <FiUsers />
                <span>حملات التبرع</span>
                <FiChevronDown className="eh-caret" />
              </button>
            </div>

            <div className="eh-nav-actions">
              <button 
                className={`eh-search-toggle ${searchOpen ? 'active' : ''}`}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="بحث"
              >
                <FiSearch />
              </button>
              
              <Link to="/cart" className="eh-cart-icon" aria-label="سلة التبرعات">
                <FiShoppingCart />
              </Link>
              
              {/* زر الهامبرغر - سيظهر فقط في التابلت والموبايل */}
              <button 
                className="eh-menu-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="فتح القائمة"
                aria-expanded={mobileOpen}
                aria-controls="mobile-drawer"
              >
                {mobileOpen ? <FiX /> : <FiMenu />}
              </button>
            </div>
          </nav>
        </div>

        {/* شريط البحث المنزلق */}
        <div className={`eh-search-slide ${searchOpen ? 'open' : ''}`}>
          <div className="eh-search-container">
            <form className="eh-search-form" onSubmit={onSubmit}>
              <input
                type="search"
                placeholder="ابحث عن حالة تبرع، متبرع، أو مدينة..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="eh-search-input"
                autoFocus
                ref={firstDrawerFocusableRef}
              />
              <button type="submit" className="eh-search-submit">
                <FiSearch />
              </button>
            </form>
            <button 
              className="eh-search-close"
              onClick={() => setSearchOpen(false)}
              aria-label="إغلاق البحث"
            >
              <FiX />
            </button>
          </div>
        </div>
      </div>

      {/* القوائم المنسدلة */}
      <div className="eh-mega-modern">
        {/* التبرع بالدم */}
        <div
          id="mega-blood"
          className={`eh-mega-panel ${open==='blood' ? 'open' : ''}`}
          onMouseEnter={() => setOpen('blood')}
          onMouseLeave={() => setOpen(null)}
          role="region"
          aria-labelledby={bloodId}
        >
          <div className="eh-mega-grid">
            <Link to="/blood-donation" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiDroplet />
              </div>
              <div className="eh-mega-content">
                <h4>زر التبرع بالدم</h4>
                <p>سجّل رغبتك بالتبرع الآن</p>
              </div>
            </Link>
            
            <Link to="/blood-donation" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiList />
              </div>
              <div className="eh-mega-content">
                <h4>طلب التبرع</h4>
                <p>إضافة طلب جديد</p>
              </div>
            </Link>
            
            <Link to="/blood-donations" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiGrid />
              </div>
              <div className="eh-mega-content">
                <h4>قائمة الطلبات</h4>
                <p>تصفّح وفلترة</p>
              </div>
            </Link>
            
            <Link to="/donors/blood" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiUsers />
              </div>
              <div className="eh-mega-content">
                <h4>المتبرعون</h4>
                <p>المتبرعون المسجّلون</p>
              </div>
            </Link>
          </div>
        </div>

        {/* تبرعات عامة */}
        <div
          id="mega-general"
          className={`eh-mega-panel ${open==='general' ? 'open' : ''}`}
          onMouseEnter={() => setOpen('general')}
          onMouseLeave={() => setOpen(null)}
          role="region"
          aria-labelledby={generalId}
        >
          <div className="eh-mega-grid">
            <Link to="/donation-requests" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiHeart />
              </div>
              <div className="eh-mega-content">
                <h4>تبرعات عامة</h4>
                <p>ابدأ تبرعًا الآن</p>
              </div>
            </Link>
            
            <Link to="/donation-requests" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiList />
              </div>
              <div className="eh-mega-content">
                <h4>طلب التبرع</h4>
                <p>أنشئ طلبًا عامًا</p>
              </div>
            </Link>
            
            <Link to="/donations" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiGrid />
              </div>
              <div className="eh-mega-content">
                <h4>قائمة الطلبات</h4>
                <p>تصفية حسب النوع</p>
              </div>
            </Link>
            
            <Link to="/donors/general" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiUsers />
              </div>
              <div className="eh-mega-content">
                <h4>المتبرعون</h4>
                <p>المتبرعون العامّون</p>
              </div>
            </Link>
          </div>
        </div>

        {/* حملات التبرع */}
        <div
          id="mega-campaigns"
          className={`eh-mega-panel ${open==='campaigns' ? 'open' : ''}`}
          onMouseEnter={() => setOpen('campaigns')}
          onMouseLeave={() => setOpen(null)}
          role="region"
          aria-labelledby={campaignsId}
        >
          <div className="eh-mega-grid">
            <Link to="/campaigns" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiGrid />
              </div>
              <div className="eh-mega-content">
                <h4>قائمة الحملات</h4>
                <p>استكشف الحملات</p>
              </div>
            </Link>
            
            <Link to="/campaigns/create" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon">
                <FiHeart />
              </div>
              <div className="eh-mega-content">
                <h4>إنشاء حملة</h4>
                <p>أطلق حملتك الآن</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* القائمة الجانبية للجوّال */}
      <div
        id="mobile-drawer"
        className={`eh-mobile-drawer ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        role="dialog"
        aria-label="قائمة الهاتف"
        aria-modal="true"
        aria-hidden={!mobileOpen}
      >
        <div className="eh-drawer-content" onClick={(e) => e.stopPropagation()}>
          <div className="eh-drawer-header">
            <div className="eh-user-drawer">
              {isAuthed ? (
                <>
                  <div className="eh-avatar-drawer">{avatarLetter}</div>
                  <div className="eh-user-info-drawer">
                    <div className="eh-username-drawer">{displayName}</div>
                    <button className="eh-logout-drawer" onClick={logout}>تسجيل الخروج</button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="eh-login-drawer" onClick={() => setMobileOpen(false)}>
                  <FiUser />
                  <span>تسجيل الدخول</span>
                </Link>
              )}
            </div>
            <button 
              className="eh-close-drawer"
              onClick={() => setMobileOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <FiX />
            </button>
          </div>

          <nav className="eh-drawer-nav" role="navigation" aria-label="القائمة الرئيسية">
            <Link to="/" className="eh-drawer-link" onClick={() => setMobileOpen(false)}>
              <FiHome />
              <span>الرئيسية</span>
            </Link>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title">
                <FiDroplet />
                <span>التبرع بالدم</span>
              </div>
              <Link to="/blood-donation" onClick={() => setMobileOpen(false)}>زر التبرع بالدم</Link>
              <Link to="/blood-donation" onClick={() => setMobileOpen(false)}>طلب التبرع</Link>
              <Link to="/blood-donations" onClick={() => setMobileOpen(false)}>قائمة الطلبات</Link>
              <Link to="/donors/blood" onClick={() => setMobileOpen(false)}>المتبرعون</Link>
            </div>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title">
                <FiHeart />
                <span>تبرعات عامة</span>
              </div>
              <Link to="/donation-requests" onClick={() => setMobileOpen(false)}>تبرعات عامة</Link>
              <Link to="/donation-requests" onClick={() => setMobileOpen(false)}>طلب التبرع</Link>
              <Link to="/donations" onClick={() => setMobileOpen(false)}>قائمة الطلبات</Link>
              <Link to="/donors/general" onClick={() => setMobileOpen(false)}>المتبرعون</Link>
            </div>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title">
                <FiUsers />
                <span>حملات التبرع</span>
              </div>
              <Link to="/campaigns" onClick={() => setMobileOpen(false)}>قائمة الحملات</Link>
              <Link to="/campaigns/create" onClick={() => setMobileOpen(false)}>إنشاء حملة</Link>
            </div>

            <Link to="/about" className="eh-drawer-link" onClick={() => setMobileOpen(false)}>
              <FiHelpCircle />
              <span>عن المنصة</span>
            </Link>
          </nav>
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
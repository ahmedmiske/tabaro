import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown, FiSearch, FiShoppingCart, FiUser,
  FiHeart, FiUsers, FiHelpCircle, FiDroplet, FiGrid, FiMenu, FiX, FiList
} from 'react-icons/fi';

import fetchWithInterceptors from '../services/fetchWithInterceptors.js';
import TopBar from './TopBar.jsx';
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
    const onStorage = (e) => { if (!e.key || e.key === 'user' || e.key === 'token') syncUser(); };
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

  // Display name + avatar
  const displayName = useMemo(() => {
    if (!user) return '';
    const fn = user.firstName || user.given_name || '';
    const full = `${fn}`.trim();
    return full || user.username || user.email || 'الحساب';
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (!user) return '';
    const raw = user.profileImage || '';
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw) || raw.startsWith('/uploads/')) return raw;
    return `/uploads/profileImages/${raw}`;
  }, [user]);

  const avatarLetter = (displayName || 'ح').trim().charAt(0).toUpperCase();

  // ===== Other state =====
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [badgeCount, setBadgeCount] = useState(Number.isFinite(notifCount) ? notifCount : 0);
  const [searchOpen, setSearchOpen] = useState(false);

  // Hide-on-scroll (mobile/tablet only)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // ===== Routing helpers: keep parent active when any sub-page is open =====
  const pathname = location.pathname;

  const bloodActive = useMemo(() => {
    return [
      '/blood', '/blood-', '/blooddon', '/ready/blood'
    ].some(prefix => pathname.startsWith(prefix))
    || ['/blood-donations','/blood-donation','/blood-donors'].some(p=> pathname.startsWith(p));
  }, [pathname]);

  const generalActive = useMemo(() => {
    return [
      '/donations', '/donation-requests', '/general-donors', '/ready/general'
    ].some(prefix => pathname.startsWith(prefix));
  }, [pathname]);

  const campaignsActive = useMemo(() => pathname.startsWith('/campaigns'), [pathname]);

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
        setOpen(null); setMobileOpen(false); setSearchOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(null); setMobileOpen(false); setSearchOpen(false); }
    };
    document.addEventListener('pointerdown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // تحديث ارتفاع الهيدر → variable for pushing content
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
    return () => { window.removeEventListener('resize', handleResize); clearInterval(interval); };
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

  // Fetch notifications count (unread) — ONLY if authenticated
  useEffect(() => {
    let stop = false;
    let timer;
    const ctrl = new AbortController();

    const token =
      (typeof window !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('authToken'))) || null;

    const loadCount = async () => {
      try {
        const { body, ok } = await fetchWithInterceptors('/api/notifications', { signal: ctrl.signal });
        if (!ok) return;
        const list = body?.data || body || [];
        const unread = Array.isArray(list)
          ? list.filter(n => n && (n.read === false || n.isRead === false || n.status === 'unread')).length
          : 0;
        if (!stop) setBadgeCount(unread);
      } catch {
        // ignore
      }
    };

    if (Number.isFinite(notifCount)) {
      setBadgeCount(notifCount);
      return () => {};
    }

    if (!token) {
      setBadgeCount(0);
      return () => {};
    }

    loadCount();
    timer = setInterval(loadCount, 20000);

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

  // ===== Hide on scroll (mobile/tablet) =====
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const goingDown = y > lastY;
        const thresholdPassed = y > 80;
        const isSmallScreen = window.matchMedia('(max-width: 1024px)').matches;

        const shouldHide =
          goingDown && thresholdPassed && !mobileOpen && !searchOpen && isSmallScreen;

        setIsHeaderHidden(!!shouldHide);
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileOpen, searchOpen]);

  return (
    <header
      className={`eh-header-modern ${isHeaderHidden ? 'is-hidden' : ''}`}
      dir="rtl"
      ref={rootRef}
      data-authed={isAuthed ? 'true' : 'false'}
    >
      {/* ✅ TopBar */}
      <TopBar
        isAuthed={isAuthed}
        displayName={displayName}
        avatarLetter={avatarLetter}
        avatarUrl={avatarUrl}
        badgeCount={badgeCount}
        onLogout={logout}
      />

      {/* الشريط الرئيسي */}
      <div className="eh-main-bar">
        <div className="eh-main-container">
          {/* الشعار في المنتصف */}
          <div className="eh-brand-center">
            <Link to="/" className="eh-brand-modern" onClick={() => setOpen(null)}>
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
                className={`eh-nav-link ${bloodActive ? 'active' : ''}`}
                onClick={() => setOpen(open === 'blood' ? null : 'blood')}
                onMouseEnter={() => setOpen('blood')}
                aria-expanded={open==='blood'}
                aria-controls="mega-blood"
                id={bloodId}
              >
                <FiDroplet /><span>التبرع بالدم</span><FiChevronDown className="eh-caret" />
              </button>
            </div>
            <div className={`eh-nav-item ${open==='general' ? 'open' : ''}`}>
              <button
                className={`eh-nav-link ${generalActive ? 'active' : ''}`}
                onClick={() => setOpen(open === 'general' ? null : 'general')}
                onMouseEnter={() => setOpen('general')}
                aria-expanded={open==='general'}
                aria-controls="mega-general"
                id={generalId}
              >
                <FiHeart /><span>تبرعات عامة</span><FiChevronDown className="eh-caret" />
              </button>
            </div>
            <div className={`eh-nav-item ${open==='campaigns' ? 'open' : ''}`}>
              <button
                className={`eh-nav-link ${campaignsActive ? 'active' : ''}`}
                onClick={() => setOpen(open === 'campaigns' ? null : 'campaigns')}
                onMouseEnter={() => setOpen('campaigns')}
                aria-expanded={open==='campaigns'}
                aria-controls="mega-campaigns"
                id={campaignsId}
              >
                <FiUsers /><span> مجتمعنا</span><FiChevronDown className="eh-caret" />
              </button>
            </div>
          </nav>

          {/* القائمة اليمنى */}
          <nav className="eh-nav-right">
            <div className="eh-nav-actions">
              <button
                className={`eh-search-toggle ${searchOpen ? 'active' : ''}`}
                onClick={() => { setSearchOpen(!searchOpen); setOpen(null); }}
                aria-label="بحث"
              >
                <FiSearch />
              </button>

              <Link to="/cart" className="eh-cart-icon" aria-label="سلة التبرعات" onClick={() => setOpen(null)}>
                <FiShoppingCart />
              </Link>

              {/* زر الهامبرغر */}
              <button
                className="eh-menu-toggle"
                onClick={() => { setMobileOpen(!mobileOpen); setOpen(null); }}
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
            <button className="eh-search-close" onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث">
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
            <Link to="/ready/blood" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiDroplet /></div>
              <div className="eh-mega-content"><h4>اعلان تبرع</h4><p>سجّل رغبتك بالتبرع الآن</p></div>
            </Link>

            <Link to="/blood-donation" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiList /></div>
              <div className="eh-mega-content"><h4>طلب التبرع</h4><p>إضافة طلب جديد</p></div>
            </Link>

            <Link to="/blood-donations" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiGrid /></div>
              <div className="eh-mega-content"><h4>قائمة الطلبات</h4><p>تصفّح وفلترة</p></div>
            </Link>

            <Link to="/blood-donors" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiUsers /></div>
              <div className="eh-mega-content"><h4>المتبرعون</h4><p>المتبرعون المسجّلون</p></div>
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
            <Link to="/ready/general" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiHeart /></div>
              <div className="eh-mega-content"><h4>اعلان تبرع</h4><p>ابدأ التبرع الآن</p></div>
            </Link>

            <Link to="/donation-requests" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiList /></div>
              <div className="eh-mega-content"><h4>طلب التبرع</h4><p>أنشئ طلبًا عامًا</p></div>
            </Link>

            <Link to="/donations" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiGrid /></div>
              <div className="eh-mega-content"><h4>قائمة الطلبات</h4><p>تصفية حسب النوع</p></div>
            </Link>

            <Link to="/general-donors" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiUsers /></div>
              <div className="eh-mega-content"><h4>المتبرعون</h4><p>المتبرعون العامّون</p></div>
            </Link>
          </div>
        </div>

         {/* الاعلانات الاجتماعية */}
        <div
          id="social-campaigns"
          className={`eh-mega-panel ${open==='campaigns' ? 'open' : ''}`}
          onMouseEnter={() => setOpen('campaigns')}
          onMouseLeave={() => setOpen(null)}
          role="region"
          aria-labelledby={campaignsId}
        >
          <div className="eh-mega-grid">
            <Link to="/social" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiGrid /></div>
              <div className="eh-mega-content"><h4>قائمة الاعلانات</h4><p>  استكشف المجتمع من حولك</p></div>
            </Link>
            <Link to="/social/new" className="eh-mega-card" onClick={() => setOpen(null)}>
              <div className="eh-mega-icon"><FiHeart /></div>
              <div className="eh-mega-content"><h4>إنشاء اعلان</h4><p>أطلق اعلانك الآن</p></div>
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
                  <div className="eh-avatar-drawer">
                    {avatarUrl ? <img src={avatarUrl} alt={displayName} className="eh-avatar-img" /> : avatarLetter}
                  </div>
                  <div className="eh-user-info-drawer">
                    <div className="eh-username-drawer">{displayName}</div>
                    <button className="eh-logout-drawer" onClick={logout}>تسجيل الخروج</button>
                  </div>
                </>
              ) : (
                <Link to="/login" className="eh-login-drawer" onClick={() => setMobileOpen(false)}>
                  <FiUser /><span>تسجيل الدخول</span>
                </Link>
              )}
            </div>
            <button className="eh-close-drawer" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة">
              <FiX />
            </button>
          </div>

          <nav className="eh-drawer-nav" role="navigation" aria-label="القائمة الرئيسية">
            <Link to="/" className="eh-drawer-link" onClick={() => setMobileOpen(false)}><span>الرئيسية</span></Link>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title"><FiDroplet /><span>التبرع بالدم</span></div>
              <Link to="/ready/blood" onClick={() => setMobileOpen(false)}>اعلان تبرع</Link>
              <Link to="/blood-donation" onClick={() => setMobileOpen(false)}>طلب التبرع</Link>
              <Link to="/blood-donations" onClick={() => setMobileOpen(false)}>قائمة الطلبات</Link>
              <Link to="/blood-donors" onClick={() => setMobileOpen(false)}>المتبرعون</Link>
            </div>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title"><FiHeart /><span>تبرعات عامة</span></div>
              <Link to="/ready/general" onClick={() => setMobileOpen(false)}>اعلان تبرع عام</Link>
              <Link to="/donation-requests" onClick={() => setMobileOpen(false)}>طلب التبرع</Link>
              <Link to="/donations" onClick={() => setMobileOpen(false)}>قائمة الطلبات</Link>
              <Link to="/general-donors" onClick={() => setMobileOpen(false)}>المتبرعون</Link>
            </div>

            <div className="eh-drawer-group">
              <div className="eh-drawer-group-title"><FiUsers /><span>حملات التبرع</span></div>
              <Link to="/campaigns" onClick={() => setMobileOpen(false)}>قائمة الحملات</Link>
              <Link to="/campaigns/create" onClick={() => setMobileOpen(false)}>إنشاء حملة</Link>
            </div>

            <Link to="/about" className="eh-drawer-link" onClick={() => setMobileOpen(false)}>
              <FiHelpCircle /><span>عن المنصة</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = { notifCount: PropTypes.number };
Header.defaultProps = { notifCount: null };

export default Header;

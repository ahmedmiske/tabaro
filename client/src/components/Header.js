import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiBell as Bell,
  FiChevronDown as ChevronDown,
  FiDroplet as Droplet,
  FiHeart as Heart,
  FiHome as Home,
  FiInfo as Info,
  FiLogOut as LogOut,
  FiMenu as Menu,
  FiPhone as Phone,
  FiSearch as Search,
  FiSettings as Settings,
  FiUsers as Users,
  FiUser as User,
  FiX as X,
} from "react-icons/fi";

/**
 * Tailwind-only Header component (no external CSS)
 * - Desktop XL+ (≥1280px): Full navigation, search bar, mega menus
 * - Tablet/Mobile (< 1280px): Hamburger menu with slide-in drawer
 * - Responsive: Hamburger menu works on tablets (768-1023px) and mobiles
 * - A11y: aria-* attributes, Esc to close, click-outside to dismiss popovers
 * 
 * Breakpoints:
 * - XS/SM/MD/LG (< 1280px): Hamburger menu visible, drawer navigation
 * - XL+ (≥ 1280px): Full horizontal navigation, search bar visible
 */
export default function HeaderTailwind({ user, notifications, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(null); // 'blood' | 'user' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const unreadCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0),
    [notifications]
  );

  const isBloodSection = useCallback(
    () => location.pathname.startsWith("/donations/blood") || location.pathname.startsWith("/donors"),
    [location.pathname]
  );

  const closeAll = () => {
    setDropdownOpen(null);
    setMobileOpen(false);
  };

  // click outside + Escape to close popovers & drawer
  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeAll();
    };
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const navItems = [
    { to: "/", label: "الرئيسية", icon: Home, exact: true },
    { to: "/about", label: "حول", icon: Info },
    { to: "/contact", label: "اتصل بنا", icon: Phone },
  ];

  const bloodItems = [
    { to: "/donations/blood/request", label: "طلب تبرع بالدم", icon: Heart },
    { to: "/donations/blood", label: "قائمة الطلبات", icon: Droplet },
    { to: "/donors/blood", label: "المتبرعون", icon: Users },
  ];

  const linkBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-gray-100/70 focus:outline-none focus:ring-2 focus:ring-primary/30";
  const linkActive = "text-primary-600 bg-primary-50 hover:bg-primary-50";
  const iconBtn =
    "relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-primary/30";
  const badge =
    "absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center";

  const handleLogout = async () => {
    try {
      if (typeof onLogout === "function") {
        await onLogout();
      } else {
        // Fallback: best-effort API
        await fetch("/api/users/logout", { method: "POST", credentials: "include" });
      }
      navigate("/");
    } catch (e) {
      // Non-blocking
      console.error("Logout error", e);
      navigate("/");
    }
  };

  return (
    <header ref={rootRef} className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: burger + brand */}
          <div className="flex items-center gap-2">
            {/* Mobile & Tablet burger */}
            <button
              type="button"
              className="xl:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="القائمة"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Brand */}
            <Link to="/" className="group flex items-center gap-3" aria-label="الرئيسية">
              <img src="/logoTabaro.png" alt="تبرع Tabaro" className="h-9 w-auto" />
              <span className="flex flex-col leading-tight">
                <strong className="text-base">تبرع Tabaro</strong>
                <span className="text-xs text-gray-500 group-hover:text-gray-700">منصة التبرع الرقمية</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop nav (only on very large screens) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={!!exact}
                className={({ isActive }) => `${linkBase} ${isActive ? linkActive : "text-gray-700"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            {/* Blood donation dropdown */}
            <div className="relative">
              <button
                type="button"
                className={`${linkBase} ${isBloodSection() ? linkActive : "text-gray-700"}`}
                aria-expanded={dropdownOpen === "blood"}
                aria-controls="blood-menu"
                onClick={() => setDropdownOpen(dropdownOpen === "blood" ? null : "blood")}
              >
                <Droplet className="h-4 w-4" />
                التبرع بالدم
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Mega menu */}
              <div
                id="blood-menu"
                className={`absolute left-1/2 z-40 mt-2 w-[640px] -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg transition [transform-origin:top_center] ${
                  dropdownOpen === "blood" ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                }`}
                role="menu"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {bloodItems.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group flex items-start gap-3 rounded-xl p-3 transition hover:bg-gray-50"
                      onClick={() => setDropdownOpen(null)}
                      role="menuitem"
                    >
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-gray-900">{label}</span>
                        <span className="truncate text-xs text-gray-500">انتقل إلى {label}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            {/* Search (desktop only - hidden on tablet for space) */}
            <div className="hidden xl:flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/30">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                className="w-56 bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
                placeholder="ابحث عن المتبرعين أو الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="بحث"
              />
            </div>

            {/* Notifications */}
            <Link to="/notifications" className={iconBtn} aria-label="الإشعارات">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className={badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-expanded={dropdownOpen === "user"}
                  aria-controls="user-menu"
                  onClick={() => setDropdownOpen(dropdownOpen === "user" ? null : "user")}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-bold">
                    {(user.username || "U").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline-block max-w-[120px] truncate">{user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* user menu */}
                <div
                  id="user-menu"
                  role="menu"
                  className={`absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg transition ${
                    dropdownOpen === "user" ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setDropdownOpen(null)}
                  >
                    <User className="h-4 w-4" /> الملف الشخصي
                  </Link>
                  <Link
                    to="/settings"
                    role="menuitem"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setDropdownOpen(null)}
                  >
                    <Settings className="h-4 w-4" /> الإعدادات
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50/70"
                  >
                    <LogOut className="h-4 w-4" /> تسجيل الخروج
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className={iconBtn} aria-label="تسجيل الدخول">
                  <User className="h-5 w-5" />
                </Link>
                <Link
                  to="/add-user"
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet drawer */}
      <div className={`xl:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-40 bg-gray-900/30 transition ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <aside
          className={`fixed inset-y-0 right-0 z-50 w-80 md:w-96 max-w-[85vw] translate-x-0 overflow-y-auto border-l border-gray-200 bg-white p-4 shadow-xl transition-transform ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">القائمة</span>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              className="w-full bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
              placeholder="ابحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="بحث في الموبايل"
            />
          </div>

          {/* Primary links */}
          <div className="space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            <details className="rounded-xl border border-gray-200">
              <summary className="flex cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2"><Droplet className="h-4 w-4" /> التبرع بالدم</span>
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="px-2 pb-2">
                {bloodItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? "bg-primary-50 text-primary-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </details>

            {!user && (
              <div className="mt-2 space-y-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <User className="h-4 w-4" /> تسجيل الدخول
                </Link>
                <Link
                  to="/add-user"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}

HeaderTailwind.propTypes = {
  user: PropTypes.shape({ username: PropTypes.string }),
  notifications: PropTypes.arrayOf(
    PropTypes.shape({ read: PropTypes.bool })
  ),
  onLogout: PropTypes.func,
};

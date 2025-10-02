import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronDown, FiSearch, FiUser, FiBell, FiHeart, 
  FiUsers, FiDroplet, FiMenu, FiX, FiSettings, FiLogOut, 
  FiHome, FiInfo, FiPhone, FiMail
} from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const Header = ({ user, setUser, notifications, setNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isActive = useCallback((pathname) => {
    if (pathname === '/' && location.pathname === '/') return true;
    return pathname !== '/' && location.pathname.startsWith(pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await fetchWithInterceptors('/api/users/logout', { method: 'POST' });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
        setDropdownOpen(null);
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification count
  const unreadCount = useMemo(() => 
    Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0, 
    [notifications]
  );

  // Navigation items
  const navItems = [
    { path: '/', label: 'الرئيسية', icon: FiHome },
    { path: '/about', label: 'حول', icon: FiInfo },
    { path: '/contact', label: 'اتصل بنا', icon: FiPhone }
  ];

  // Blood donation dropdown items
  const bloodDropdownItems = [
    { path: '/donations/blood/request', label: 'طلب تبرع بالدم', icon: FiHeart },
    { path: '/donations/blood', label: 'قائمة الطلبات', icon: FiDroplet },
    { path: '/donors/blood', label: 'المتبرعون', icon: FiUsers }
  ];

  return (
    <header 
      ref={rootRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 space-x-reverse group"
          >
            <div className="relative">
              <img 
                src="/logoTabaro.png" 
                alt="المنصة الوطنية للتبرع" 
                className="w-10 h-10 object-contain" 
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                المنصة الوطنية للتبرع
              </h1>
              <p className="text-xs text-gray-500 -mt-1">المنصة الوطنية للتبرع</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Blood Donation Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(dropdownOpen === 'blood' ? null : 'blood')}
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.includes('/donations/blood') || location.pathname.includes('/donors')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                }`}
              >
                <FiDroplet className="w-4 h-4" />
                <span>التبرع بالدم</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen === 'blood' ? 'rotate-180' : ''
                }`} />
              </button>

              {dropdownOpen === 'blood' && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  {bloodDropdownItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setDropdownOpen(null)}
                        className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3 space-x-reverse">
            
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt="صورة المستخدم"
                    className="w-8 h-8 rounded-full border-2 border-gray-200"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.username}
                  </span>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen === 'user' ? 'rotate-180' : ''
                  }`} />
                </button>

                {dropdownOpen === 'user' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(null)}
                      className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(null)}
                      className="flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>الإعدادات</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 space-x-reverse px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 space-x-reverse">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/add-user"
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-gray-200">
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن المتبرعين أو الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {/* Mobile Navigation Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 space-x-reverse px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Blood Donation Section */}
              <div className="pt-2 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  التبرع بالدم
                </div>
                {bloodDropdownItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 space-x-reverse px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Auth Buttons */}
              {!user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-3 py-3 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/add-user"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-3 py-3 text-center text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  user: PropTypes.object,
  setUser: PropTypes.func.isRequired,
  notifications: PropTypes.array,
  setNotifications: PropTypes.func
};

export default Header;
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

  const headerStyles = {
    position: 'sticky',
    top: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const flexContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '4rem'
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: 'inherit'
  };

  const logoIconStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    transition: 'all 0.3s ease'
  };

  const navStyles = {
    display: 'none',
    alignItems: 'center',
    gap: '0.25rem'
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };

  const buttonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const dropdownStyles = {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.5rem',
    width: '14rem',
    backgroundColor: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '0.5rem 0',
    zIndex: 10000
  };

  const mobileMenuStyles = {
    display: mobileMenuOpen ? 'block' : 'none',
    padding: '1rem 0',
    borderTop: '1px solid #e5e7eb'
  };

  return (
    <header ref={rootRef} style={headerStyles}>
      <div style={containerStyles}>
        <div style={flexContainerStyles}>
          
          {/* Logo */}
          <Link to="/" style={logoStyles}>
            <div style={logoIconStyles}>
              <img 
                src="/logoTabaro.png" 
                alt="المنصة الوطنية للتبرع" 
                style={{ 
                  width: '2.5rem', 
                  height: '2.5rem',
                  objectFit: 'contain'
                }} 
              />
            </div>
            <div style={{ display: window.innerWidth >= 640 ? 'block' : 'none' }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                background: 'linear-gradient(to right, #dc2626, #b91c1c)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                margin: 0
              }}>
                المنصة الوطنية للتبرع
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                margin: 0,
                marginTop: '-0.25rem'
              }}>
                المنصة الوطنية للتبرع
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav style={{ ...navStyles, '@media (min-width: 1024px)': { display: 'flex' } }}>
            {window.innerWidth >= 1024 && navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive(item.path) ? '#fef2f2' : 'transparent',
                    color: isActive(item.path) ? '#b91c1c' : '#374151',
                    border: isActive(item.path) ? '1px solid #fecaca' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.color = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#374151';
                    }
                  }}
                >
                  <Icon style={{ width: '1rem', height: '1rem' }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Blood Donation Dropdown */}
            {window.innerWidth >= 1024 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'blood' ? null : 'blood')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: location.pathname.includes('/donations/blood') || location.pathname.includes('/donors')
                      ? '#fef2f2' : 'transparent',
                    color: location.pathname.includes('/donations/blood') || location.pathname.includes('/donors')
                      ? '#b91c1c' : '#374151'
                  }}
                >
                  <FiDroplet style={{ width: '1rem', height: '1rem' }} />
                  <span>التبرع بالدم</span>
                  <FiChevronDown style={{
                    width: '1rem',
                    height: '1rem',
                    transform: dropdownOpen === 'blood' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>

                {dropdownOpen === 'blood' && (
                  <div style={dropdownStyles}>
                    {bloodDropdownItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setDropdownOpen(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            fontSize: '0.875rem',
                            color: '#374151',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#fef2f2';
                            e.target.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#374151';
                          }}
                        >
                          <Icon style={{ width: '1rem', height: '1rem' }} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right Section */}
          <div style={rightSectionStyles}>
            
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                ...buttonStyles,
                ':hover': {
                  color: '#dc2626',
                  backgroundColor: '#fef2f2'
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#dc2626';
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <FiSearch style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              style={{
                ...buttonStyles,
                position: 'relative',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#dc2626';
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <FiBell style={{ width: '1.25rem', height: '1.25rem' }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-0.25rem',
                  right: '-0.25rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  height: '1.25rem',
                  width: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(dropdownOpen === 'user' ? null : 'user')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <img
                    src={user.profileImage || '/default-avatar.png'}
                    alt="صورة المستخدم"
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      border: '2px solid #e5e7eb'
                    }}
                  />
                  <span style={{
                    display: window.innerWidth >= 768 ? 'block' : 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {user.username}
                  </span>
                  <FiChevronDown style={{
                    width: '1rem',
                    height: '1rem',
                    color: '#6b7280',
                    transform: dropdownOpen === 'user' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} />
                </button>

                {dropdownOpen === 'user' && (
                  <div style={{ ...dropdownStyles, width: '12rem' }}>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FiUser style={{ width: '1rem', height: '1rem' }} />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setDropdownOpen(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FiSettings style={{ width: '1rem', height: '1rem' }} />
                      <span>الإعدادات</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#dc2626',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'right'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#fef2f2';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <FiLogOut style={{ width: '1rem', height: '1rem' }} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: window.innerWidth >= 640 ? 'flex' : 'none',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Link
                  to="/login"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#374151';
                  }}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/add-user"
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                  }}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                ...buttonStyles,
                display: window.innerWidth >= 1024 ? 'none' : 'flex'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#dc2626';
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {mobileMenuOpen ? 
                <FiX style={{ width: '1.5rem', height: '1.5rem' }} /> : 
                <FiMenu style={{ width: '1.5rem', height: '1.5rem' }} />
              }
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div style={{ padding: '1rem 0', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                width: '1.25rem',
                height: '1.25rem'
              }} />
              <input
                type="text"
                placeholder="ابحث عن المتبرعين أو الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingRight: '2.5rem',
                  paddingLeft: '1rem',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  ':focus': {
                    outline: 'none',
                    borderColor: '#ef4444',
                    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)'
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        <div style={mobileMenuStyles}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Mobile Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: isActive(item.path) ? '#fef2f2' : 'transparent',
                    color: isActive(item.path) ? '#b91c1c' : '#374151',
                    border: isActive(item.path) ? '1px solid #fecaca' : '1px solid transparent'
                  }}
                >
                  <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Blood Donation Section */}
            <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                التبرع بالدم
              </div>
              {bloodDropdownItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fef2f2';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#374151';
                    }}
                  >
                    <Icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Buttons */}
            {!user && (
              <div style={{
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/add-user"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                  }}
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
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
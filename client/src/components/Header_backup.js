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

  // Escape key and click outside handling
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

  // تحديث عداد الإشعارات
  const unreadCount = useMemo(() => 
    Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0, 
    [notifications]
  );

  return (
    <header
      ref={rootRef}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(229, 231, 235, 0.3)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '0.75rem 0'
      }}
      className="eh-header"
    >
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        
        {/* الشعار */}
        <Link 
          to="/" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            padding: '0.5rem',
            borderRadius: '1rem',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))'
          }}
        >
          <div style={{
            position: 'relative',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            padding: '0.25rem'
          }}>
            <img
              src="/logoTabaro.png"
              alt="Tabaro Logo"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '0.5rem',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
          
          <div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              background: 'linear-gradient(to right, #059669, #10b981, #14b8a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>

            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontWeight: '600',
              margin: '-0.25rem 0 0 0'
            }}>
              المنصة الوطنية للتبرع ❤️
            </p>
          </div>
        </Link>

        {/* Navigation Desktop */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Link 
            to="/" 
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              color: isActive('/') ? 'white' : '#374151',
              background: isActive('/') ? 'linear-gradient(to right, #059669, #10b981)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            🏠 الرئيسية
          </Link>

          <Link 
            to="/about" 
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              color: isActive('/about') ? 'white' : '#374151',
              background: isActive('/about') ? 'linear-gradient(to right, #3b82f6, #06b6d4)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            ℹ️ حول
          </Link>

          {/* Blood Donations Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                background: (isActive('/blood') || isActive('/donations/blood')) ? 'linear-gradient(to right, #ef4444, #ec4899)' : 'transparent',
                color: (isActive('/blood') || isActive('/donations/blood')) ? 'white' : '#374151',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={() => setOpen('blood')}
              onClick={() => setOpen(prev => prev === 'blood' ? null : 'blood')}
            >
              <FiDroplet style={{ width: '1rem', height: '1rem' }} />
              💉 التبرع بالدم
              <FiChevronDown style={{ 
                width: '1rem', 
                height: '1rem',
                transform: open === 'blood' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </button>
            
            {/* Dropdown Menu */}
            {open === 'blood' && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '16rem',
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #e5e7eb',
                  padding: '0.5rem 0',
                  zIndex: 50
                }}
                onMouseEnter={() => setOpen('blood')}
                onMouseLeave={() => setOpen(null)}
              >
                <Link to="/donations/blood/request" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}>
                  <FiHeart style={{ marginLeft: '0.5rem', color: '#dc2626' }} />
                  طلب تبرع بالدم
                </Link>
                <Link to="/donations/blood" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}>
                  <FiDroplet style={{ marginLeft: '0.5rem', color: '#dc2626' }} />
                  قائمة الطلبات
                </Link>
                <Link to="/donors/blood" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}>
                  <FiUsers style={{ marginLeft: '0.5rem', color: '#dc2626' }} />
                  المتبرعون
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Search and User Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {/* Search Button */}
          <button
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <FiSearch style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            style={{
              position: 'relative',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: '#6b7280',
              transition: 'all 0.3s ease'
            }}
          >
            <FiBell style={{ width: '1.25rem', height: '1.25rem' }} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '0.75rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                minWidth: '1.25rem',
                textAlign: 'center'
              }}>
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setOpen(open === 'user' ? null : 'user')}
              >
                <img
                  src={user.profileImage || '/default-avatar.png'}
                  alt="صورة المستخدم"
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e5e7eb'
                  }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
                  {user.username}
                </span>
                <FiChevronDown style={{ 
                  width: '1rem', 
                  height: '1rem',
                  color: '#6b7280',
                  transform: open === 'user' ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }} />
              </button>

              {/* User Dropdown */}
              {open === 'user' && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '12rem',
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #e5e7eb',
                  padding: '0.5rem 0',
                  zIndex: 50
                }}>
                  <Link to="/profile" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    <FiUser style={{ width: '1rem', height: '1rem' }} />
                    الملف الشخصي
                  </Link>
                  <Link to="/settings" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#374151',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    <FiSettings style={{ width: '1rem', height: '1rem' }} />
                    الإعدادات
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#ef4444',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'right',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FiLogOut style={{ width: '1rem', height: '1rem' }} />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                to="/login"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease'
                }}
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/add-user"
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  color: 'white',
                  background: 'linear-gradient(to right, #059669, #10b981)',
                  transition: 'all 0.3s ease'
                }}
              >
                إنشاء حساب
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            style={{
              display: 'none',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer'
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <FiX style={{ width: '1.5rem', height: '1.5rem' }} />
            ) : (
              <FiMenu style={{ width: '1.5rem', height: '1.5rem' }} />
            )}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
          padding: '1rem',
          zIndex: 40
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="ابحث عن المتبرعين أو الطلبات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            {searchLoading && (
              <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>جاري البحث...</p>
            )}
            {searchResults.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                {searchResults.map((result, index) => (
                  <div key={index} style={{ padding: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    {result.name || result.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
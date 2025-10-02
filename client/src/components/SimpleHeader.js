import React, { useState } from "react";
import PropTypes from "prop-types";
import { FiHome, FiInfo, FiPhone, FiDroplet, FiHeart, FiUser, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";
import "./SimpleHeader900.css";

const SimpleHeader = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* الجانب الأيمن: شعار الموقع */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/logoTabaro.png" 
                alt="المنصة الوطنية للتبرع" 
                className="h-8 w-auto ml-2"
              />
              <div className="text-right">
                <h1 className="text-xl font-bold text-red-600">المنصة الوطنية للتبرع</h1>
              </div>
            </Link>
          </div>

          {/* القائمة الرئيسية */}
          <nav className="hidden nav-900 space-x-8 space-x-reverse">
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => 
                `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`
              }
            >
              <FiHome className="ml-1" />
              <span>الرئيسية</span>
            </NavLink>

            <NavLink 
              to="/blood-donation-info"
              className={({ isActive }) => 
                `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`
              }
            >
              <FiDroplet className="ml-1" />
              <span>التبرع بالدم</span>
            </NavLink>

            <NavLink 
              to="/general-donations"
              className={({ isActive }) => 
                `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`
              }
            >
              <FiHeart className="ml-1" />
              <span>التبرعات العامة</span>
            </NavLink>

            <NavLink 
              to="/about"
              className={({ isActive }) => 
                `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`
              }
            >
              <FiInfo className="ml-1" />
              <span>حول</span>
            </NavLink>

            <NavLink 
              to="/contact"
              className={({ isActive }) => 
                `flex items-center space-x-1 space-x-reverse px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`
              }
            >
              <FiPhone className="ml-1" />
              <span>اتصل بنا</span>
            </NavLink>
          </nav>

          {/* الجانب الأيسر: زر الهامبرغر + قسم المستخدم */}
          <div className="flex items-center space-x-3 space-x-reverse">
            {/* زر القائمة المحمولة */}
            <div className="burger-900">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                aria-expanded={mobileMenuOpen}
                aria-label="القائمة الرئيسية"
              >
                {mobileMenuOpen ? (
                  <FiX className="block h-6 w-6" />
                ) : (
                  <FiMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* قسم المستخدم */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {user ? (
                <div className="flex items-center space-x-2 user-900-space space-x-reverse">
                  <span className="hidden user-900-text text-sm text-gray-700">مرحباً، {user.username}</span>
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-1 space-x-reverse px-2 user-900-px py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser className="ml-1" />
                    <span className="hidden user-900-text">الملف الشخصي</span>
                  </Link>
                  <button 
                    onClick={onLogout}
                    className="flex items-center space-x-1 space-x-reverse px-2 user-900-px py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="ml-1" />
                    <span className="hidden user-900-text">تسجيل الخروج</span>
                  </button>
                </div>
              ) : (
                <div className="hidden login-900 items-center space-x-2 space-x-reverse">
                  <Link 
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link 
                    to="/add-user"
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* القائمة المحمولة */}
      <div className={`mobile-menu-900 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
          <NavLink 
            to="/" 
            end
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium ${
                isActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            <FiHome />
            <span>الرئيسية</span>
          </NavLink>

          <NavLink 
            to="/donations/blood"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium ${
                isActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            <FiDroplet />
            <span>التبرع بالدم</span>
          </NavLink>

          <NavLink 
            to="/general-donations"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium ${
                isActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            <FiHeart />
            <span>التبرعات العامة</span>
          </NavLink>

          <NavLink 
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium ${
                isActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            <FiInfo />
            <span>حول</span>
          </NavLink>

          <NavLink 
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => 
              `flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium ${
                isActive 
                  ? 'text-red-600 bg-red-50' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            <FiPhone />
            <span>اتصل بنا</span>
          </NavLink>

          {!user && (
            <div className="pt-2 border-t border-gray-200">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
              >
                <FiUser />
                <span>تسجيل الدخول</span>
              </Link>
              <Link 
                to="/add-user"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 space-x-reverse px-3 py-2 mt-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <span>إنشاء حساب</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

SimpleHeader.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  onLogout: PropTypes.func
};

export default SimpleHeader;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Button, NavDropdown, Badge } from 'react-bootstrap';
import {
  FaHome, FaBullhorn, FaDonate, FaHandHoldingHeart, FaTint,
  FaBullseye, FaUserShield, FaPlus, FaSignInAlt, FaUserCircle, FaBell
} from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetchWithInterceptors('/api/users/notifications/unread-count');
        if (res.ok) {
          setUnreadCount(res.body?.count || 0);
        }
      } catch (err) {
        console.error('فشل في جلب عدد الإشعارات:', err.message);
      }
    };

    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  return (
    <>
      <Navbar expand="xl" className="header">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end navabar-nav">
          <div className='login'>
            {!user ? (
              <>
                <Button
                  variant="outline-primary auth-button"
                  as={Link}
                  to="/add-user"
                  className={`auth-button ${location.pathname === '/add-user' ? 'active-link' : ''}`}
                >
                  <FaPlus className="auth-icon" /> انشاء حساب
                </Button>
                <Button
                  variant="outline-primary auth-button"
                  as={Link}
                  to="/login"
                  className={`auth-button ${location.pathname === '/login' ? 'active-link' : ''}`}
                >
                  <FaSignInAlt className="auth-icon" /> تسجيل الدخول
                </Button>
              </>
            ) : (
              <>
                <span style={{ marginRight: '5px', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.5rem' }}>
                  {user.firstName} 👋 مرحبًا
                </span>

                {/* زر الإشعارات */}
                <Button
                  variant="outline-warning auth-button"
                  as={Link}
                  to="/profile?view=notifications"
                  className="position-relative"
                >
                  <FaBell className="auth-icon" />
                  {unreadCount > 0 && (
                    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="outline-secondary auth-button"
                  as={Link}
                  to="/profile"
                  className={`auth-button ${location.pathname === '/profile' ? 'active-link' : ''}`}
                >
                  <FaUserCircle className="auth-icon" /> الصفحة الشخصية
                </Button>
                <Button variant="outline-danger auth-button" onClick={handleLogout}>
                  خروج
                </Button>
              </>
            )}
          </div>

          <Nav className='nav-header'>
            <Nav.Link as={Link} to="/" className={`link-nav nav-link ${location.pathname === '/' ? 'active-link' : ''}`}>
              <FaHome className="nav-icon home-icon" /> الرئيسية
            </Nav.Link>

            <Nav.Link as={Link} to="/campaigns" className={`link-nav nav-link ${location.pathname === '/campaigns' ? 'active-link' : ''}`}>
              <FaBullhorn className="nav-icon campaigns-icon" /> حملات الجمعيات
            </Nav.Link>

            <NavDropdown title={<><FaDonate className="nav-icon donation-icon" /> التبرعات</>} id="donation-dropdown" className="link-nav">
              <NavDropdown.Item as={Link} to="/donation-requests" className={location.pathname === '/donation-requests' ? 'active-link' : ''}>
                <FaHandHoldingHeart className="nav-icon request-icon" /> طلب تبرع
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donation-offers" className={location.pathname === '/donation-offers' ? 'active-link' : ''}>
                <FaHandHoldingHeart className="nav-icon offer-icon" /> عرض تبرع
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title={<><FaTint className="nav-icon blood-icon" /> التبرع بالدم</>} id="blood-dropdown" className="link-nav">
              <NavDropdown.Item as={Link} to="/blood-donation" className={location.pathname === '/blood-donation' ? 'active-link' : ''}>
                <FaHandHoldingHeart className="nav-icon request-icon" /> طلب تبرع بالدم
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/blood-donations" className={location.pathname === '/blood-donations' ? 'active-link' : ''}>
                <FaTint className="nav-icon blood-icon" /> قائمة طلبات الدم
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donors" className={location.pathname === '/donors' ? 'active-link' : ''}>
                <FaUserShield className="nav-icon users-icon" /> قائمة المتبرعين
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/social-ads" className={`link-nav nav-link ${location.pathname === '/social-ads' ? 'active-link' : ''}`}>
              <FaBullseye className="nav-icon social-icon" /> الإعلانات الاجتماعية
            </Nav.Link>

            {user?.userType === 'admin' && (
              <Nav.Link as={Link} to="/users" className={`link-nav nav-link ${location.pathname === '/users' ? 'active-link' : ''}`}>
                <FaUserShield className="nav-icon users-icon" /> إدارة المستخدمين
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>

        <Navbar.Brand className="logo">
          <img src="../logo.png" alt="logo" />
        </Navbar.Brand>
      </Navbar>
    </>
  );
}

export default Header;
// This component represents the header of the application. 
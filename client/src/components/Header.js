import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Navbar, Nav, Button, NavDropdown, Badge, Toast, ToastContainer
} from 'react-bootstrap';
import {
  FaHome, FaBullhorn, FaDonate, FaHandHoldingHeart, FaTint,
  FaBullseye, FaUserShield, FaPlus, FaSignInAlt, FaUserCircle, FaBell
} from 'react-icons/fa';
import socket from '../socket'; // ✅ من frontend
import { useAuth } from '../AuthContext';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessage, setNewMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ✅ جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetchWithInterceptors('/api/users/notifications/unread-count');
        if (res.ok) setUnreadCount(res.body?.count || 0);
      } catch (err) {
        console.error('❌ فشل في جلب الإشعارات:', err.message);
      }
    };

    if (user) fetchUnread();
  }, [user]);

  // ✅ استقبال رسالة جديدة عبر socket
  useEffect(() => {
    if (!user) return;

    const currentUserId = user._id;

    socket.on('receiveMessage', (message) => {
      if (message.sender === currentUserId) return;
      console.log('📥 Received message:', message); 
      setNewMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    });

    return () => socket.off('receiveMessage');
  }, [user]);

  return (
    <>
      {/* ✅ Toast للرسائل الجديدة */}
      <ToastContainer position="bottom-start" className="p-3">
        <Toast
          bg="info"
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          onClick={() => {
            if (newMessage?.sender) {
              navigate(`/chat/${newMessage.sender}`);
              setShowToast(false);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <Toast.Body className="text-white">
            💬 رسالة جديدة من: {newMessage?.senderName || 'مستخدم'}<br />
            <small>{newMessage?.content}</small>
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Navbar expand="xl" className="header">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end navabar-nav">
          <div className="login">
            {!user ? (
              <>
                <Button as={Link} to="/add-user" variant="outline-primary" className="auth-button">
                  <FaPlus className="auth-icon" /> انشاء حساب
                </Button>
                <Button as={Link} to="/login" variant="outline-primary" className="auth-button">
                  <FaSignInAlt className="auth-icon" /> تسجيل الدخول
                </Button>
              </>
            ) : (
              <>
                <span style={{ marginRight: '5px', color: 'var(--color-secondary)', fontWeight: 'bold', fontSize: '1.2rem', padding: '0.5rem' }}>
                  {user.firstName} 👋 مرحبًا
                </span>

                {/* ✅ زر الجرس */}
               <Button
  as={Link}
  to="/notifications"
  className="position-relative"
>
  <FaBell />
  {(unreadCount > 0 || newMessage) && (
    <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
      {unreadCount + (newMessage ? 1 : 0)}
    </Badge>
  )}
</Button>


                <Button
                  variant="outline-secondary auth-button"
                  as={Link}
                  to="/profile"
                >
                  <FaUserCircle className="auth-icon" /> الصفحة الشخصية
                </Button>
                <Button variant="outline-danger auth-button" onClick={handleLogout}>
                  خروج
                </Button>
              </>
            )}
          </div>

          <Nav className="nav-header">
            <Nav.Link as={Link} to="/" className={`link-nav nav-link ${location.pathname === '/' ? 'active-link' : ''}`}>
              <FaHome className="nav-icon home-icon" /> الرئيسية
            </Nav.Link>

            <Nav.Link as={Link} to="/campaigns" className={`link-nav nav-link ${location.pathname === '/campaigns' ? 'active-link' : ''}`}>
              <FaBullhorn className="nav-icon" /> حملات الجمعيات
            </Nav.Link>

            <NavDropdown title={<><FaDonate className="nav-icon" /> التبرعات</>} id="donation-dropdown" className="link-nav">
              <NavDropdown.Item as={Link} to="/donation-requests">
                <FaHandHoldingHeart className="nav-icon" /> طلب تبرع
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donation-offers">
                <FaHandHoldingHeart className="nav-icon" /> عرض تبرع
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown title={<><FaTint className="nav-icon" /> التبرع بالدم</>} id="blood-dropdown" className="link-nav">
              <NavDropdown.Item as={Link} to="/blood-donation">
                <FaHandHoldingHeart className="nav-icon" /> طلب تبرع بالدم
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/blood-donations">
                <FaTint className="nav-icon" /> قائمة طلبات الدم
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donors">
                <FaUserShield className="nav-icon" /> قائمة المتبرعين
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/social-ads" className={`link-nav nav-link ${location.pathname === '/social-ads' ? 'active-link' : ''}`}>
              <FaBullseye className="nav-icon" /> الإعلانات الاجتماعية
            </Nav.Link>

            {user?.userType === 'admin' && (
              <Nav.Link as={Link} to="/users" className="link-nav nav-link">
                <FaUserShield className="nav-icon" /> إدارة المستخدمين
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
// It includes navigation links, user authentication buttons, and a notification system.
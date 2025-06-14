import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { FaHome, FaBullhorn, FaDonate, FaHandHoldingHeart, FaTint, FaBullseye, FaUserShield, FaPlus, FaSignInAlt } from 'react-icons/fa';
import './Header.css';
// import InfoBar from './InfoBar';

function Header() {
  return (
    <>
      <Navbar expand="xl" className="header">
        <Navbar.Brand className="logo">
          <img src="../logo.png" alt="logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end navabar-nav">
          <Nav className='nav-header'>

            <Nav.Link as={Link} to="/" className="link-nav">
              <FaHome className="nav-icon home-icon" /> الرئيسية
            </Nav.Link>

            <Nav.Link as={Link} to="/campaigns" className="link-nav">
              <FaBullhorn className="nav-icon campaigns-icon" /> حملات الجمعيات
            </Nav.Link>

            <NavDropdown title={<><FaDonate className="nav-icon donation-icon" /> التبرعات</>} id="donation-dropdown" className="link-nav">
              <NavDropdown.Item as={Link} to="/donation-requests">
                <FaHandHoldingHeart className="nav-icon request-icon" /> طلب تبرع
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donation-offers">
                <FaHandHoldingHeart className="nav-icon offer-icon" /> عرض تبرع
              </NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/bloodDonation" className="link-nav">
              <FaTint className="nav-icon blood-icon" /> التبرع بالدم
            </Nav.Link>

            <Nav.Link as={Link} to="/social-ads" className="link-nav">
              <FaBullseye className="nav-icon social-icon" /> الإعلانات الاجتماعية
            </Nav.Link>

            <Nav.Link as={Link} to="/users" className="link-nav">
              <FaUserShield className="nav-icon users-icon" /> إدارة المستخدمين
            </Nav.Link>
          </Nav>

          {/* أزرار الحساب */}
          <div className='login'>
             <Button variant="outline-primary auth-button" as={Link} to="/addUserPage">
                <FaPlus className="auth-icon" /> انشاء حساب
             </Button>
             <Button variant="outline-primary auth-button" as={Link} to="/login">
                <FaSignInAlt className="auth-icon" /> تسجيل الدخول
             </Button>
          </div>
          
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}

export default Header;

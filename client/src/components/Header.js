import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Button } from 'react-bootstrap';
import './Header.css';
import Notifications from './Notifications'; // Ensure this path is correct
// import InfoBar from './InfoBar';

function Header() {
return (
  <>
 <Navbar expand="lg" className="header">
<Navbar.Brand className="logo"> <img src="../logo.png" alt="logo" /> 
 </Navbar.Brand> 

    <div className="notifications">
        <span className="notification-icon">🔔</span>
        {/* Optionally show count */}
        {/* <span className="notification-count">{unreadCount}</span> */}
        {/* <Notifications /> */}
    </div>
    <Button variant="outline-primary auth-button " as={Link} to="/addUserPage">
      انشاء حساب
    </Button>
    <Button variant="outline-primary auth-button " as={Link} to="/login">
     تسجيل الدخول
    </Button>
    
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
      <Nav className='nav-header'>
        <Nav.Link as={Link} to="/" className="link-nav">الرئيسية</Nav.Link>
        <Nav.Link as={Link} to="/users">إدارة المستخدمين</Nav.Link>
        <Nav.Link as={Link} to="/content">عناوين</Nav.Link>
        <Nav.Link as={Link} to="/content">الخدمات</Nav.Link>
        <Nav.Link as={Link} to="/donation">حالات التبرع</Nav.Link>
        <Nav.Link as={Link} to="/bloodDonation">التبرع بالدم</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Navbar>
</>

);
}

export default Header;


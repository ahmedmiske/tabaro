import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import './Header.css';

function Header() {
  return (
    <Navbar bg="green" expand="lg" className="header">
      <Navbar.Brand className="logo">
        <img src="../logo.png" alt="logo" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className='nav-header'>
          <Nav.Link as={Link} to="/" className="text-white link-nav">الرئيسية</Nav.Link>
          <Nav.Link as={Link} to="/users">إدارة المستخدمين</Nav.Link>
          <Nav.Link as={Link} to="/content" className="text-white ">عناوين </Nav.Link>
          <Nav.Link as={Link} to="/content" className="text-white ">الخدمات </Nav.Link>
          <Nav.Link as={Link} to="/content" className="text-white ">حالات التبرع  </Nav.Link>
          <Nav.Link as={Link} to="/content" className="text-white ">التبرع بالدم </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;


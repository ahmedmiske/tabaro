import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Login.css';
import loginImg from './login.jpeg'; 
import Donor from '../components/Donor'; // استيراد المكون Donor

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false); // حالة للتحقق مما إذا كان المستخدم قد سجل دخوله

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/users');
      const users = await response.json();
      const user = users.find(user => user.username === username && user.password === password);
      if (user) {
        localStorage.setItem('token', JSON.stringify(user)); // token
        setLoggedIn(true); // 
      } else {
        setError('أعد المحاولة مرة أخرى،المعلومات التي تم ادخالها ليست صحيحة');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
    setLoading(false);
  };

  // 
  if (loggedIn) {
    return <Donor />;
  }

  return (
    <div className='page-loging'>
        <div className="page-login-img">
             <img src={loginImg}  alt="img_login" />
        </div>
        <div className="login-container">
         <h2>تسجيل الدخول</h2>
         <Form onSubmit={handleSubmit} className='form-login'>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="username">
          <Form.Label>اسم المستخدم</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            required
            className='input-login'
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>كلمة المرور</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            required
             className='input-login'
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading} className='button-login'>
          {loading ? <Spinner animation="border" size="sm" /> : 'تسجيل الدخول'}
        </Button>
        <div className="signup-link">
          <span>ليس لديك حساب؟ </span>
          <Button variant="link" as={Link} to="/addUserPage" className="signup-button">إنشاء حساب</Button>
        </div>
      </Form>
        </div>
       
    </div>
  
  );
}

export default Login;

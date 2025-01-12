import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import loginImg from './login.jpeg';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function Login() {
  const [loginInput, setLoginInput] = useState(''); // يمكن أن يكون اسم المستخدم أو رقم الهاتف
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithInterceptors('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginInput: loginInput, // استخدام loginInput هنا للإشارة إلى اسم المستخدم أو رقم الهاتف
          password: password
        })
      });
      const data = response.body;
      if (response.ok) {
<<<<<<< HEAD
        localStorage.setItem('token', data.token);
        navigate('/profile'); // تغيير المسار إلى لوحة التحكم أو أي صفحة تريد الانتقال إليها بعد الدخول
=======
        navigate('/dashboard'); // تغيير المسار إلى لوحة التحكم أو أي صفحة تريد الانتقال إليها بعد الدخول
>>>>>>> 4f3015be34616ee4108c4183a81e3e297c1e5bd9
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (error) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className='login-page'>
      <div className="login-img">
        <img src={loginImg} alt="Login" />
      </div>
      <div className="login-container">
        <h2>تسجيل الدخول</h2>
        <Form onSubmit={handleSubmit} className='form-login'>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="loginInput">
            <Form.Label>اسم المستخدم أو رقم الهاتف</Form.Label>
            <Form.Control
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="أدخل اسم المستخدم أو رقم الهاتف"
              required
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
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'تسجيل الدخول'}
          </Button>
          <div className="signup-link">
            <span>ليس لديك حساب؟ </span>
            <Button variant="link" as={Link} to="/addUserPage">إنشاء حساب</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;

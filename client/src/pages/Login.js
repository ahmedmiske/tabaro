import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import loginImg from './login.jpeg';
import fetchWithInterceptors from '../services/fetchWithInterceptors.js';
import { useAuth } from '../AuthContext'; // ✅ إضافة السياق

function Login() {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ استخدام دالة login من السياق

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchWithInterceptors('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginInput: loginInput.trim(), password })
      });

      if (response.ok) {
        const user = response.body?.user;
        if (user) {
          login(user);            // ✅ تحديث السياق لتحديث الحالة في جميع المكونات
          navigate('/profile');  // ✅ التوجيه بعد تسجيل الدخول
        } else {
          setError('البيانات غير مكتملة. الرجاء المحاولة لاحقًا.');
        }
      } else {
        setError(response.body?.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      setError('خطأ في الشبكة. حاول مرة أخرى.');
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
          {error && (
            <Alert variant="danger" className="w-100 text-center" dismissible onClose={() => setError('')}>
              ❌ {error}
            </Alert>
          )}

          <Form.Group controlId="loginInput" className='input'>
            <Form.Label>اسم المستخدم أو رقم الهاتف</Form.Label>
            <div className="input-with-icon">
              <Form.Control
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="أدخل اسم المستخدم أو رقم الهاتف"
                required
              />
            </div>
          </Form.Group>

          <Form.Group controlId="password" className='input'>
            <Form.Label>كلمة المرور</Form.Label>
            <div className="input-with-icon">
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading} className="mt-2 w-100">
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="ms-2" /> جاري الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>

          <div className="signup-link d-flex justify-content-between w-100 mt-3">
            <Link to="/reset-password" className="text-decoration-none text-danger">
              هل نسيت كلمة السر؟
            </Link>
            <Link to="/add-user" className="btn btn-outline-secondary btn-sm">
              إنشاء حساب جديد
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;

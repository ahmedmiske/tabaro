import React, { useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import './Login.css';
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
      const response = await fetch('http://localhost:5000/users');
      const users = await response.json();
      const user = users.find(user => user.username === username && user.password === password);
      if (user) {
        localStorage.setItem('token', JSON.stringify(user)); // يمكنك استخدام التوكن بدلاً من تفاصيل المستخدم
        setLoggedIn(true); // تعيين حالة تسجيل الدخول إلى true عند نجاح الدخول
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
    setLoading(false);
  };

  // إذا قام المستخدم بتسجيل الدخول بنجاح، سيتم توجيهه إلى المكون Donor
  if (loggedIn) {
    return <Donor />;
  }

  return (
    <div className="login-container">
      <h2>تسجيل الدخول</h2>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group controlId="username">
          <Form.Label>اسم المستخدم</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
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
      </Form>
    </div>
  );
}

export default Login;

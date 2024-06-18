import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <Container className="text-center d-flex align-items-center justify-content-center vh-100">
        <Card className="p-4 bg-light card-landing">
          <Card.Body>
            <Card.Title as="h1">مرحبًا بكم في منصة تبرع</Card.Title>
            <Card.Text>
              إنضم الينا في رحلة العطاء والتغيير. تبرعاتكم نصنع الفرق وتحدث التأثير.
            </Card.Text>
            <Card.Text>
              نحن نضمن لك اتصالًا مباشرًا وآمنًا بين المتبرع والمتعفف.
            </Card.Text>
            <Card.Text>
              معا نتابع تبرعك خطوة بخطوة، يمكنك التأكد أن تبرعاتك تصل لمن يستحقها بموثوقية وشفافية.
            </Card.Text>
            <Link to="/register">
              <Button variant="primary" className='btn-go'>ابدأ الآن</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className='btn-go'>تسجيل الدخول</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LandingPage;

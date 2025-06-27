import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-page">
      <Container className="text-center d-flex align-items-center justify-content-center vh-100 container-landing">
        <Card className="card-landing shadow-lg p-4">
          <Card.Body>
            <Card.Title as="h1" className="landing-title">مرحباً بكم في <span className="highlight">منصة تبرع</span></Card.Title>
            <Card.Text className="lead-text">
              إنضم إلينا في رحلة العطاء و التغيير. تبرعكم يصنع الفرق ويحدث التأثير.
            </Card.Text>
            <Card.Text>
              نحن جسر نضمن اتصالاً مباشرًا وآمنًا بين المتبرع والمتعفف.
            </Card.Text>
            <Card.Text>
              معا تتابع تبرع خطوة بخطوة وبصفة مباشرة وآمنًة
            </Card.Text>
            <div className='link-card'>
              <Link to="/add-user">
                <Button className='btn-go btn-main'>ابدأ الآن</Button>
              </Link>
              <Link to="/login">
                <Button className='btn-go btn-secondary'>تسجيل الدخول</Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default LandingPage;

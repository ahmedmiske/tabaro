import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import CarouselComponent from '../components/CarouselComponent';

import './LandingPage.css';

function LandingPage() {
  return (
    <>

    <div className="landing-page">
   
      <Container className="text-center d-flex align-items-center justify-content-center vh-100 container-landing">
      <CarouselComponent  className='carousel-landing'/>
        <Card className="p-4 card-landing">
          <Card.Body>
            <Card.Title as="h1">مرحبًا بكم في منصة تبرع</Card.Title>
            <Card.Text>
              إنضم الينا في رحلة العطاء والتغيير. تبرعاتكم تصنع الفرق وتحدث التأثير.
            </Card.Text>
            <Card.Text>
              نحن نضمن لك اتصالًا مباشرًا وآمنًا بين المتبرع والمتعفف.
            </Card.Text>
            <Card.Text>
              معا نتابع تبرعك خطوة بخطوة، يمكنك التأكد أن تبرعاتك تصل لمن يستحقها بموثوقية وشفافية.
            </Card.Text>
            <div className='link-card'>
              <Link as={Link} to="/register">
                <Button className='btn-go' variant="primary">ابدأ الآن</Button>
              </Link>
              <Link to="/login">
                <Button className='btn-go' variant="secondary">تسجيل الدخول</Button>
              </Link>
            </div>
      
          </Card.Body>
        </Card>
      </Container>
    </div>
    </>
  );
}

export default LandingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import './LandingPage.css';
import About from '../components/About';

function LandingPage() {
  return (
    <>
      {/* القسم العلوي */}
      <div className="landing-page" id="top">
        <Container className="text-center container-landing">
          <Card className="card-landing shadow-lg">
            <Card.Body>
              <Card.Title as="h1" className="landing-title">
                تواصل مباشر بين <span className="highlight">المتبرع والمتعفف</span>
              </Card.Title>
              <Card.Text className="lead-text">
                معًا… نصل الخير بمن يستحق.
              </Card.Text>
              <Card.Text className="lead-text">
                الجسر الذي يربط الخير بأهله.
              </Card.Text>
              <div className="link-card">
                <Link to="/add-user">
                  <Button className="go-landing">ابدأ رحلتك الآن</Button>
                </Link>
                <Link to="/login">
                  <Button className="log-landing btn-secondary">تسجيل الدخول</Button>
                </Link>
              </div>
              {/* سهم التمرير للأسفل */}
              <div className="scroll-down">
                <Link to="#about-section" className="scroll-link">
                  <i className="fas fa-chevron-down"></i>
                </Link>
                </div>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* القسم التعريفي */}
      <section className="about-section" id="about">
      <About />
      </section>
    </>
  );
}

export default LandingPage;

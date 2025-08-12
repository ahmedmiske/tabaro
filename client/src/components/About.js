import React from "react";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import "./About.css";

function About() {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate("/donations");
  };

  const cardProps = {
    role: "button",
    tabIndex: 0,
    onClick: handleCardClick,
    onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && handleCardClick(),
    className: "info-card clickable",
  };

  return (
    <div className="about-container">
      <Container>
        <div className="about-definition">
          <h1>عن منصة تبرع</h1>
          <p>
            منصة تبرع تجمع بين من يرغب في العطاء ومن يسعى للدعم، عبر تواصل مباشر وآمن.
            نسهل خطوات التبرع ونضاعف أثره في المجتمع.
          </p>
          <p>
            المنصة تتيح فرصة لكل من يحتاج التبرع (دم/مالي/عيني)، ونشر{" "}
            <strong>الإعلانات الاجتماعية</strong>، وكذلك تنظيم{" "}
            <strong>حملات الجمعيات والمؤسسات الاجتماعية</strong> لزيادة الأثر والوصول.
          </p>
        </div>

        <div className="about-content">
          <Row xs={1} md={3} className="g-3">
            <Col>
              <Card {...cardProps} aria-label="اذهب إلى صفحة التبرعات - التبرع بالدم">
                <Card.Body>
                  <Card.Title as="h4">تبرع بالدم</Card.Title>
                  <p>ساعد في إنقاذ الأرواح من خلال التبرع بالدم بسهولة وأمان.</p>
                  <Button variant="outline-primary" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card {...cardProps} aria-label="اذهب إلى صفحة التبرعات - التبرع المالي">
                <Card.Body>
                  <Card.Title as="h4">تبرع مالي</Card.Title>
                  <p>ادعم المبادرات والمحتاجين بمساهمات مالية مباشرة.</p>
                  <Button variant="outline-primary" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card {...cardProps} aria-label="اذهب إلى صفحة التبرعات - التبرع العيني">
                <Card.Body>
                  <Card.Title as="h4">تبرع عيني</Card.Title>
                  <p>قدم ما تستطيع من ملابس، طعام أو أدوات للمساهمة في الخير.</p>
                  <Button variant="outline-primary" size="sm">استكشف الطلبات</Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>

        {/* قسم التواصل */}
        <div className="about-contact mt-5">
          <h2>التواصل</h2>
          <p>
            لديك سؤال، إعلان اجتماعي، أو ترغب بإطلاق حملة لجمعية/مؤسسة؟ يسعدنا تواصلك.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Button as={Link} to="/contact" variant="primary">
              صفحة التواصل
            </Button>
            <Button
              variant="outline-secondary"
              href="mailto:contact@tabaroua.org"
            >
              بريد: contact@tabaroua.org
            </Button>
            <Button
              variant="outline-success"
              href="https://wa.me/0000000000"
              target="_blank"
              rel="noopener noreferrer"
            >
              واتساب مباشر
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default About;

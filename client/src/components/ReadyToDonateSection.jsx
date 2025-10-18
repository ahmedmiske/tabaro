import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './ReadyToDonateSection.css';

const ReadyToDonateSection = () => {
  return (
    <section className="ready-to-donate-section" id="ready-to-donate">
      <Container>
        <div className="section-header text-center mb-5">
          <h2 className="section-title large-title">
            <i className="fas fa-hands-helping me-3"></i>
            كن جزءاً من رحلة الخير
          </h2>
          <p className="section-subtitle">
            انضم إلى مجتمع المتبرعين وساهم في إنقاذ الأرواح
          </p>
        </div>

        <Row className="g-4">
          {/* بطاقة التبرع بالدم */}
          <Col lg={6} md={12}>
            <Card className="donate-card blood-card h-100">
              <Card.Body className="p-4">
                <div className="card-icon blood-icon">
                  <i className="fas fa-droplet"></i>
                </div>
                <h4 className="card-title">التبرع بالدم</h4>
                <p className="card-description">
                  كن بطلاً حقيقياً وساهم في إنقاذ حياة المرضى المحتاجين لنقل الدم
                </p>
                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>آمن وسريع</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>فحص مجاني</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تأثير فوري</span>
                  </div>
                </div>
                <a 
                  href="#ready-blood" 
                  className="btn-ready blood-ready"
                >
                  <i className="fas fa-droplet me-2"></i>
                  أنا مستعد للتبرع بالدم
                </a>
              </Card.Body>
            </Card>
          </Col>

          {/* بطاقة التبرع العام */}
          <Col lg={6} md={12}>
            <Card className="donate-card general-card h-100">
              <Card.Body className="p-4">
                <div className="card-icon general-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <h4 className="card-title">التبرع العام</h4>
                <p className="card-description">
                  ساعد في توفير الاحتياجات الأساسية من مال ومواد وجهد تطوعي
                </p>
                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تبرع مالي</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تبرع عيني</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>عمل تطوعي</span>
                  </div>
                </div>
                <a 
                  href="#ready-general" 
                  className="btn-ready general-ready"
                >
                  <i className="fas fa-heart me-2"></i>
                  أنا مستعد للتبرع العام
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* إحصائيات سريعة */}
        <Row className="stats-row mt-5 pt-4">
          <Col md={3} sm={6} className="text-center mb-3">
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">متبرع مسجل</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">حياة تم إنقاذها</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">مدينة مشاركة</div>
            </div>
          </Col>
          <Col md={3} sm={6} className="text-center mb-3">
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">خدمة متواصلة</div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ReadyToDonateSection;
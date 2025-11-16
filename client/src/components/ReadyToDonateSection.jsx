// src/components/ReadyToDonateSection.jsx
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./ReadyToDonateSection.css";

const ReadyToDonateSection = () => {
  return (
    <section
      className="ready-to-donate-section"
      id="ready-to-donate"
      aria-labelledby="ready-title"
    >
      <Container>
        {/* الهيدر */}
        <div className="section-header text-center mb-5 reveal" data-animate="up">
          <div className="ready-badge">
            <span className="badge-dot" />
            <span className="badge-text">جاهز لتكون جزءاً من الحل؟</span>
          </div>

          <h2 className="section-title large-title" id="ready-title">
            <i className="fas fa-hands-helping me-3"></i>
            كن جزءاً من رحلة الخير
          </h2>
          <p className="section-subtitle">
            انضم إلى مجتمع المتبرعين وساهم في إنقاذ الأرواح عبر مسارات تبرع
            واضحة وآمنة
          </p>
        </div>

        {/* ===== نوعا التبرع ===== */}
        <Row className="g-4">
          {/* بطاقة التبرع بالدم */}
          <Col lg={6} md={12}>
            <Card
              className="donate-card blood-card h-100 reveal"
              data-animate="up"
            >
              <Card.Body className="p-4">
                <div className="card-icon blood-icon">
                  <i className="fas fa-droplet"></i>
                </div>

                <h4 className="card-title">التبرع بالدم</h4>
                <p className="card-description">
                  كن بطلاً حقيقياً وساهم في إنقاذ حياة المرضى المحتاجين لنقل الدم
                  في حالات الطوارئ والعلاج الطويل.
                </p>

                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>مسار منظم لطلبات تبرع الدم</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تواصل مباشر مع أصحاب الطلبات</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>إشعارات لحالات الاستعجال القريبة منك</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to="/ready/blood" className="btn-ready blood-ready">
                    <i className="fas fa-droplet me-2"></i>
                    أنا مستعد للتبرع بالدم
                  </Link>
                  <span className="btn-note">
                    يمكنك استكشاف الفرص أولاً قبل إنشاء حساب
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* بطاقة التبرع العام */}
          <Col lg={6} md={12}>
            <Card
              className="donate-card general-card h-100 reveal"
              data-animate="up"
            >
              <Card.Body className="p-4">
                <div className="card-icon general-icon">
                  <i className="fas fa-heart"></i>
                </div>

                <h4 className="card-title">التبرع العام</h4>
                <p className="card-description">
                  ساعد في توفير الاحتياجات الأساسية من مال ومواد وجهد تطوعي
                  لدعم الأفراد والعائلات والمبادرات المجتمعية.
                </p>

                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تبرعات مالية لحالات عاجلة ومحددة</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>تبرعات عينية: ملابس، طعام، أدوات، وغيرها</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>فرص تطوع ميداني ورقمي حسب وقتك</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to="/ready/general" className="btn-ready general-ready">
                    <i className="fas fa-heart me-2"></i>
                    أنا مستعد للتبرع العام
                  </Link>
                  <span className="btn-note">
                    اختر نوع التبرع المناسب في الخطوة القادمة
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ===== إحصائيات سريعة ===== */}
        <Row className="stats-row mt-5 pt-4">
          <Col
            md={3}
            sm={6}
            className="text-center mb-3 reveal"
            data-animate="up"
          >
            <div className="stat-item">
              <div className="stat-number">1000+</div>
              <div className="stat-label">متبرع مسجل</div>
              <p className="stat-helper">أشخاص مستعدون للعطاء في أي وقت</p>
            </div>
          </Col>
          <Col
            md={3}
            sm={6}
            className="text-center mb-3 reveal"
            data-animate="up"
          >
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">حياة تم إنقاذها</div>
              <p className="stat-helper">بفضل تبرعاتكم واستجابتكم السريعة</p>
            </div>
          </Col>
          <Col
            md={3}
            sm={6}
            className="text-center mb-3 reveal"
            data-animate="up"
          >
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">مدينة مشاركة</div>
              <p className="stat-helper">شبكة تبرع تتوسع يومًا بعد يوم</p>
            </div>
          </Col>
          <Col
            md={3}
            sm={6}
            className="text-center mb-3 reveal"
            data-animate="up"
          >
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">خدمة متواصلة</div>
              <p className="stat-helper">يمكنك التبرع أو الطلب في أي وقت</p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ReadyToDonateSection;

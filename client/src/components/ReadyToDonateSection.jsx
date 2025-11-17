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
        <Row className="g-4 mb-5">
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

        {/* ===== طلبات التبرع ===== */}
        <Row className="g-4">
          {/* بطاقة طلب تبرع بالدم */}
          <Col lg={6} md={12}>
            <Card
              className="donate-card request-blood-card h-100 reveal"
              data-animate="up"
            >
              <Card.Body className="p-4">
                <div className="card-icon request-blood-icon">
                  <i className="fas fa-hand-holding-medical"></i>
                </div>

                <h4 className="card-title">طلب تبرع بالدم</h4>
                <p className="card-description">
                  هل أنت بحاجة إلى متبرع بالدم؟ أنشئ طلباً وصِل مع المتبرعين المستعدين في منطقتك لمساعدتك.
                </p>

                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>حدد فصيلة الدم المطلوبة والكمية</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>وصول سريع للمتبرعين في منطقتك</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>إشعارات فورية عند توفر متبرعين</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to="/ready/blood" className="btn-ready request-blood-ready">
                    <i className="fas fa-hand-holding-medical me-2"></i>
                    إنشاء طلب تبرع بالدم
                  </Link>
                  <span className="btn-note">
                    سيتم نشر طلبك ليراه المتبرعون المستعدون
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* بطاقة طلب تبرع عام */}
          <Col lg={6} md={12}>
            <Card
              className="donate-card request-general-card h-100 reveal"
              data-animate="up"
            >
              <Card.Body className="p-4">
                <div className="card-icon request-general-icon">
                  <i className="fas fa-hand-holding-heart"></i>
                </div>

                <h4 className="card-title">طلب تبرع عام</h4>
                <p className="card-description">
                  هل تحتاج لمساعدة مالية أو عينية أو تطوعية؟ اعرض حالتك وتواصل مع المتبرعين الراغبين بالدعم.
                </p>

                <div className="card-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>طلبات مالية أو عينية أو جهد تطوعي</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>شرح تفصيلي لحالتك واحتياجاتك</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>مجتمع متعاون جاهز للمساعدة</span>
                  </div>
                </div>

                <div className="card-actions">
                  <Link to="/ready/general" className="btn-ready request-general-ready">
                    <i className="fas fa-hand-holding-heart me-2"></i>
                    إنشاء طلب تبرع عام
                  </Link>
                  <span className="btn-note">
                    حدد نوع المساعدة التي تحتاجها في الخطوة التالية
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        
      </Container>
    </section>
  );
};

export default ReadyToDonateSection;

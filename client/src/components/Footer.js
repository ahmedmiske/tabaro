import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const ministries = [
    { name: "رئاسة الجمهورية", url: "https://www.presidence.mr" },
    { name: "وزارة الصحة", url: "https://www.sante.gov.mr" },
    { name: "وزارة الشؤون الإسلامية", url: "https://www.islamique.gov.mr" },
    { name: "وزارة الداخلية", url: "https://www.interieur.gov.mr" },
    { name: "وزارة التعليم", url: "https://www.education.gov.mr" },
    { name: "وزارة المالية", url: "https://www.finances.gov.mr" }
  ];

  return (
    <footer className="modern-footer" dir="rtl" lang="ar" aria-label="تذييل الموقع — المنصة الوطنية للتبرع">
      <Container>
        <div className="footer-top">
          <Row className="align-items-start">
            {/* Brand */}
            <Col md={5} sm={12} className="mb-4">
              <div className="f-brand">
                <div className="f-brand-row">
                  <div className="f-logo">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="6" fill="#059669"/>
                      <path d="M7 12l3 3 7-8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="f-brand-texts">
                    <h3 className="f-title">المنصة الوطنية للتبرع</h3>
                    <p className="f-sub">الجمهورية الإسلامية الموريتانية</p>
                  </div>
                </div>
                <p className="f-desc">
                  منصة رسمية موحدة لتنسيق وتنظيم أنشطة التبرع والعمل الخيري — شفافية، أمان، وتواصل مباشر مع الجهات المعنية.
                </p>
                <div className="f-actions">
                  <Link to="/donate" className="btn-primary">تبرع الآن</Link>
                  <Link to="/volunteer" className="btn-ghost">التطوع</Link>
                </div>
              </div>
            </Col>

            {/* Services */}
            <Col md={2} sm={6} className="mb-4">
              <div className="f-section">
                <h4 className="f-section-title">الخدمات</h4>
                <ul className="f-list">
                  <li><Link to="/blood-donation">التبرع بالدم</Link></li>
                  <li><Link to="/financial-donation">التبرع المالي</Link></li>
                  <li><Link to="/donations">التبرع العيني</Link></li>
                  <li><Link to="/campaigns">الحملات</Link></li>
                </ul>
              </div>
            </Col>

            {/* Ministries */}
            <Col md={3} sm={6} className="mb-4">
              <div className="f-section">
                <h4 className="f-section-title">الوزارات الشريكة</h4>
                <ul className="f-list small">
                  {ministries.map((m, idx) => (
                    <li key={idx}>
                      <a href={m.url} target="_blank" rel="noopener noreferrer">{m.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Contact */}
            <Col md={2} sm={12} className="mb-4">
              <div className="f-section">
                <h4 className="f-section-title">تواصل</h4>
                <address className="f-contact">
                  <div className="f-contact-row">📍 نواكشوط، تفرغ زينة</div>
                  <div className="f-contact-row">📞 <a href="tel:+22245250000">+222 45 25 00 00</a></div>
                  <div className="f-contact-row">✉️ <a href="mailto:info@donation.gov.mr">info@donation.gov.mr</a></div>
                </address>
                <div className="f-social">
                  <a href="#" aria-label="فيسبوك" title="فيسبوك">🔵</a>
                  <a href="#" aria-label="تويتر" title="تويتر">🐦</a>
                  <a href="#" aria-label="إنستغرام" title="إنستغرام">📸</a>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <Row className="align-items-center">
            <Col md={6} sm={12}>
              <div className="f-copy">© {currentYear} المنصة الوطنية للتبرع — جميع الحقوق محفوظة</div>
            </Col>
            <Col md={6} sm={12} className="text-md-end">
              <div className="f-legal">
                <Link to="/privacy">سياسة الخصوصية</Link>
                <Link to="/terms">الشروط</Link>
                <Link to="/accessibility">إمكانية الوصول</Link>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

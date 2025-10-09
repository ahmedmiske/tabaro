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
                    <img src="/logoTabaro.png" alt="شعار المنصة الوطنية للتبرع" />
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
                  <Link to="/login?next=%2Fblood-donation" className="btn-primary">تبرع الآن</Link>
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
                  <a href="#" aria-label="فيسبوك" title="فيسبوك">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="تويتر" title="تويتر">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="إنستغرام" title="إنستغرام">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" aria-label="يوتيوب" title="يوتيوب">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
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

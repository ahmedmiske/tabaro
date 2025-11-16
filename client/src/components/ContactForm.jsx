// src/components/ContactForm.jsx
import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./ContactForm.css";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "", agree: false });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const rules = {
    name: (v) => v.trim().length >= 3,
    email: (v) => /^\S+@\S+\.\S+$/.test(v),
    message: (v) => v.trim().length >= 20,
    agree: (v) => v === true,
  };

  const errors = {
    name: !rules.name(form.name) ? "الاسم يجب أن لا يقل عن 3 أحرف." : "",
    email: !rules.email(form.email) ? "رجاءً أدخل بريدًا إلكترونيًا صالحًا." : "",
    message: !rules.message(form.message) ? "الرسالة يجب أن لا تقل عن 20 حرفًا." : "",
    agree: !rules.agree(form.agree) ? "يجب الموافقة على الشروط قبل الإرسال." : "",
  };

  const isValid = Object.values(errors).every((e) => e === "");

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true, agree: true });
    if (!isValid) return;
    // TODO: إرسال إلى API
    setSent(true);
  };

  return (
    <section className="contact-form-section" aria-labelledby="form-title">
      <div className="form-header">
        
          <img
            src={require("../images/contactanos.png")}
            alt="تواصل معنا"
            className="divider-img"
          />
      </div>

      <div className="form-container">
        {!sent ? (
          <Form noValidate onSubmit={handleSubmit} className="simple-form">
            <div className="form-grid">
              <div className="form-field">
                <Form.Label htmlFor="name">الاسم الكامل</Form.Label>
                <Form.Control
                  id="name"
                  name="name"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.name && !!errors.name}
                  required
                  minLength={3}
                  className="form-input"
                />
                <Form.Control.Feedback type="invalid" className="error-message">
                  {errors.name}
                </Form.Control.Feedback>
              </div>

              <div className="form-field">
                <Form.Label htmlFor="email">البريد الإلكتروني</Form.Label>
                <Form.Control
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && !!errors.email}
                  required
                  className="form-input"
                />
                <Form.Control.Feedback type="invalid" className="error-message">
                  {errors.email}
                </Form.Control.Feedback>
              </div>

              <div className="form-field full-width">
                <Form.Label htmlFor="message">رسالتك</Form.Label>
                <Form.Control
                  as="textarea"
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="اكتب رسالتك هنا..."
                  value={form.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.message && !!errors.message}
                  required
                  minLength={20}
                  className="form-textarea"
                />
                <Form.Control.Feedback type="invalid" className="error-message">
                  {errors.message}
                </Form.Control.Feedback>
              </div>
            </div>

            <div className="agreement-section">
              <Form.Check
                id="agree"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.agree && !!errors.agree}
                required
                className="agreement-checkbox"
              />
              <Form.Label htmlFor="agree" className="agreement-label">
                أوافق على <Link to="/terms" className="terms-link">الشروط والأحكام</Link> وسياسة الخصوصية
              </Form.Label>
              <Form.Control.Feedback type="invalid" className="error-message">
                {errors.agree}
              </Form.Control.Feedback>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={!isValid}>
                إرسال الرسالة
              </button>
              <Link to="/add-user" className="secondary-btn">
                إنشاء حساب جديد
              </Link>
            </div>
          </Form>
        ) : (
          <div className="success-state">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h4>تم استلام رسالتك بنجاح</h4>
              <p>سنقوم بالرد عليك في أقرب وقت ممكن</p>
            </div>
            <div className="success-buttons">
              <Link to="/add-user" className="submit-btn">
                إنشاء حساب جديد
              </Link>
              <Link to="/donations" className="secondary-btn">
                تصفح التبرعات
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContactForm;

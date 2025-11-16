// src/pages/ReadyToDonateGeneralPage.jsx
import React, { useState, useMemo } from "react";
import { Form, Alert } from "react-bootstrap";
import { FiHeart, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";              // 👈 مهم
import fetchWithInterceptors from "../services/fetchWithInterceptors";
import { GENERAL_CATEGORY_OPTIONS } from "../constants/donationCategories";
import "./ReadyToDonateGeneralPage.css";

// نفس التحقق المستعمل في باقي المشروع (موريتانيا: 8 أرقام ويبدأ بـ 2 أو 3 أو 4)
const validatePhone = (v) => /^(2|3|4)\d{7}$/.test((v || "").trim());

export default function ReadyToDonateGeneralPage() {
  const [form, setForm] = useState({
    city: "",
    category: "money",
    note: "",
    phone: "",
    whatsapp: "",
  });

  const [touched, setTouched] = useState({
    city: false,
    category: false,
    phone: false,
    whatsapp: false,
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // صورة الخلفية
  const bgCandidates = useMemo(
    () => ["/images/tabar6.jpg", "/images/tabar5.jpg", "/images/fundo-about.png"],
    []
  );
  const bgUrl = useMemo(() => bgCandidates[0], [bgCandidates]);

  // حساب الأخطاء
  const computeErrors = (values) => {
    const e = {};

    if (!values.city.trim()) e.city = "هذا الحقل مطلوب";
    if (!values.category) e.category = "اختر نوع التبرع";

    const phoneValid = validatePhone(values.phone);
    const whatsappValid = validatePhone(values.whatsapp);

    if (values.phone && !phoneValid)
      e.phone = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";
    if (values.whatsapp && !whatsappValid)
      e.whatsapp = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";

    // لابد من هاتف أو واتساب واحد صحيح على الأقل
    if (!phoneValid && !whatsappValid) {
      e.contact = "يجب إدخال رقم هاتف أو واتساب واحد على الأقل بشكل صحيح.";
    }

    return e;
  };

  // التحقق الفوري عند الكتابة
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const newErrors = computeErrors({ ...form, [name]: value });
    setErrors(newErrors);
  };

  // التحقق عند الإرسال
  const validateForm = () => {
    const e = computeErrors(form);
    setTouched({
      city: true,
      category: true,
      phone: true,
      whatsapp: true,
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    const payload = {
      type: "general",
      city: form.city.trim(),
      note: form.note,
      extra: { category: form.category },
      contactMethods: [
        { method: "phone", number: form.phone.trim() },
        { method: "whatsapp", number: form.whatsapp.trim() },
      ],
    };

    try {
      const res = await fetchWithInterceptors("/api/ready-to-donate-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res?.ok) {
        setMsg("✅ تم تسجيل استعدادك للتبرع العام.");
        setSuccess(true);
        setForm({
          city: "",
          category: "money",
          note: "",
          phone: "",
          whatsapp: "",
        });
        setErrors({});
        setTouched({
          city: false,
          category: false,
          phone: false,
          whatsapp: false,
        });
      } else {
        setMsg("❌ تعذّر الإرسال. حاول لاحقًا.");
        setSuccess(false);
      }
    } catch {
      setMsg("❌ تعذّر الإرسال. حاول لاحقًا.");
      setSuccess(false);
    }
  };

  return (
    <div className="ready-general-row" >
      {/* الهيرو / الصورة */}
      <section
        className="general-hero"
        style={{
          backgroundImage: `url(${bgUrl})`,
        }}
      >
        <div className="hero-content">
          <h1 className="fw-bold mb-2">
            <FiHeart className="me-2" /> مستعد للتبرع العام
          </h1>
          <p className="mb-3">مساهمتك تحدث فرقًا حقيقيًا في حياة الناس.</p>
        </div>
      </section>

      {/* الفورم */}
      <div className="form-side">
        <div className="form-container">
          <div className="form-title">سجّل استعدادك للتبرع</div>
          <div className="form-header">املأ البيانات التالية لتسجيل استعدادك</div>

          {msg && (
            <Alert
              variant={msg.startsWith("✅") ? "success" : "danger"}
              className="mb-3"
            >
              {msg}
            </Alert>
          )}

          {!success && (
            <Form onSubmit={submit} className="donation-form">
              <div className="form-grid">
                {/* المدينة */}
                <div className="form-field">
                  <label className="form-label" htmlFor="city">
                    المدينة
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.city && errors.city ? { borderColor: "#e53e3e" } : {}
                    }
                  />
                  {touched.city && errors.city && (
                    <span className="error-message">{errors.city}</span>
                  )}
                </div>

                {/* نوع التبرع */}
                <div className="form-field">
                  <label className="form-label" htmlFor="category">
                    نوع التبرع
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.category && errors.category
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  >
                    {GENERAL_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <span className="error-message">{errors.category}</span>
                  )}
                </div>

                {/* الهاتف */}
                <div className="form-field">
                  <label className="form-label" htmlFor="phone">
                    الهاتف
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.phone && errors.phone
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  />
                  {touched.phone && errors.phone && (
                    <span className="error-message">{errors.phone}</span>
                  )}
                </div>

                {/* واتساب */}
                <div className="form-field">
                  <label className="form-label" htmlFor="whatsapp">
                    واتساب
                  </label>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.whatsapp && errors.whatsapp
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  />
                  {touched.whatsapp && errors.whatsapp && (
                    <span className="error-message">{errors.whatsapp}</span>
                  )}
                </div>

                {/* خطأ عام لوسائل التواصل */}
                {errors.contact && (
                  <div className="form-field full-width">
                    <span className="error-message">{errors.contact}</span>
                  </div>
                )}

                {/* الملاحظة */}
                <div className="form-field full-width">
                  <label className="form-label" htmlFor="note">
                    ملاحظة (اختياري)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={form.note}
                    onChange={onChange}
                    className="form-textarea"
                    rows={3}
                    placeholder="أي معلومات إضافية تريد إضافتها..."
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  <FiCheck className="me-2" /> تأكيد التسجيل
                </button>
              </div>
            </Form>
          )}

          {success && (
            <div className="success-next">
              <h4 className="mt-3">🎉 تم التسجيل بنجاح</h4>

              {/* غيّر المسارات حسب الراوتر عندك إن لزم */}
              <Link to="/donations" className="next-btn">
                عرض طلبات التبرع
              </Link>

              <Link to="/ready-donors" className="next-btn secondary">
                رؤية قائمة المتبرعين الجاهزين
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

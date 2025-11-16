// src/pages/ReadyToDonateBloodPage.jsx
import React, { useState } from "react";
import { Form, Alert } from "react-bootstrap";
import {
  FiDroplet,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiFileText,
  FiCheck,
} from "react-icons/fi";
import { Link } from "react-router-dom";           // 👈 جديد
import fetchWithInterceptors from "../services/fetchWithInterceptors";
import "./ReadyToDonateBloodPage.css";

const placesList = [
  "ألاك","أمباني","امبود","آمرج","انتيكان","أوجفت","أطار","باسكنو","بابابي","باركيول",
  "بير أم أكرين","بوكي","بومديد","بوتلميت","تفرغ زينة","تجكجة","تمبدغة","توجنين","تيارت",
  "تيشيت","جلوار (بوغور)","جكني","دار النعيم","روصو","الرياض","الزويرات","السبخة","الشامي",
  "شنقيط","الطويل","الطينطان","عرفات","عدل بكرو","فديرك","كرمسين","كرو","كنكوصة","كوبني",
  "كيهيدي","كيفة","لكصر","لكصيبة","لعيون","مال","مقامة","مقطع لحجار","المذرذرة","المجرية",
  "الميناء","مونكل","نواذيبو","نواكشوط","النعمة","وادان","واد الناقة","ولد ينج","ولاتة",
  "ومبو","سيليبابي","تامشكط","أكجوجت",
];

const bloodTypes = ["A+","A-","B+","B-","AB+","AB-","O+","O-","غير معروف"];
const validatePhone = (v) => /^(2|3|4)\d{7}$/.test((v || "").trim());

export default function ReadyToDonateBloodPage() {
  const bgUrl = "/images/tabar5.jpg";

  const [form, setForm] = useState({
    location: "",
    bloodType: "",
    note: "",
    phone: "",
    whatsapp: "",
  });

  const [touched, setTouched] = useState({
    location: false,
    bloodType: false,
    phone: false,
    whatsapp: false,
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const computeErrors = (values) => {
    const e = {};

    if (!values.location.trim()) e.location = "هذا الحقل مطلوب";
    if (!values.bloodType) e.bloodType = "الرجاء اختيار فصيلة الدم";

    const phoneValid = validatePhone(values.phone);
    const whatsappValid = validatePhone(values.whatsapp);

    if (values.phone && !phoneValid)
      e.phone = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";
    if (values.whatsapp && !whatsappValid)
      e.whatsapp = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";

    if (!phoneValid && !whatsappValid)
      e.contact = "يجب إدخال رقم هاتف أو واتساب واحد على الأقل بشكل صحيح.";

    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(computeErrors({ ...form, [name]: value }));
  };

  const validateForm = () => {
    const e = computeErrors(form);
    setTouched({
      location: true,
      bloodType: true,
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
      type: "blood",
      location: form.location,
      bloodType: form.bloodType,
      note: form.note,
      contactMethods: [
        { method: "phone", number: form.phone },
        { method: "whatsapp", number: form.whatsapp },
      ],
    };

    try {
      await fetchWithInterceptors("/api/ready-to-donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setMsg("✅ تم تسجيل استعدادك للتبرع بالدم بنجاح.");
      setSuccess(true);

      setForm({ location: "", bloodType: "", note: "", phone: "", whatsapp: "" });
      setErrors({});
      setTouched({ location: false, bloodType: false, phone: false, whatsapp: false });
    } catch (err) {
      setMsg("❌ حدث خطأ أثناء الإرسال. حاول لاحقًا.");
    }
  };

  return (
    <div className="ready-blood-row">
      {/* الصورة */}
      <section
        className="general-hero"
        style={{ backgroundImage: `url(${bgUrl})` }}
      >
        <div className="hero-content">
          <h1 className="fw-blood mb-2">
            <FiDroplet className="me-2" /> مستعد للتبرع بالدم
          </h1>
          <p className="pBlood">تبرعك قد ينقذ حياة أحدهم.</p>
        </div>
      </section>

      {/* الفورم */}
      <div className="form-side">
        <div className="form-container">
          <div className="form-title">سجّل استعدادك للتبرع</div>
          <div className="form-header">املأ البيانات التالية</div>

          {msg && (
            <Alert variant={msg.startsWith("✅") ? "success" : "danger"}>
              {msg}
            </Alert>
          )}

          {!success && (
            <Form onSubmit={submit} className="donation-form">
              <div className="form-grid">
                {/* الموقع */}
                <div className="form-field">
                  <label className="form-label">
                    <FiMapPin className="me-2" /> الموقع
                  </label>
                  <input
                    list="locations"
                    name="location"
                    value={form.location}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.location && errors.location
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  />
                  <datalist id="locations">
                    {placesList.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  {touched.location && errors.location && (
                    <span className="error-message">{errors.location}</span>
                  )}
                </div>

                {/* فصيلة الدم */}
                <div className="form-field">
                  <label className="form-label">
                    <FiDroplet className="me-2" /> فصيلة الدم
                  </label>
                  <select
                    name="bloodType"
                    value={form.bloodType}
                    onChange={onChange}
                    className="form-input"
                    style={
                      touched.bloodType && errors.bloodType
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  >
                    <option value="">-- اختر الفصيلة --</option>
                    {bloodTypes.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {touched.bloodType && errors.bloodType && (
                    <span className="error-message">{errors.bloodType}</span>
                  )}
                </div>

                {/* الهاتف */}
                <div className="form-field">
                  <label className="form-label">
                    <FiPhone className="me-2" /> الهاتف
                  </label>
                  <input
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
                  <label className="form-label">
                    <FiMessageCircle className="me-2" /> واتساب
                  </label>
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={onChange}
                    className="form-input"
                    style=
                    {
                      touched.whatsapp && errors.whatsapp
                        ? { borderColor: "#e53e3e" }
                        : {}
                    }
                  />
                  {touched.whatsapp && errors.whatsapp && (
                    <span className="error-message">{errors.whatsapp}</span>
                  )}
                </div>

                {errors.contact && (
                  <div className="form-field full-width">
                    <span className="error-message">{errors.contact}</span>
                  </div>
                )}

                {/* الملاحظة */}
                <div className="form-field full-width">
                  <label className="form-label">
                    <FiFileText className="me-2" /> ملاحظة (اختياري)
                  </label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={onChange}
                    className="form-textarea"
                    rows={4}
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

              <Link to="/blood-requests" className="next-btn">
                عرض طلبات تبرع الدم
              </Link>

              <Link to="/blood-donors" className="next-btn secondary">
                نادي المتبرعين بالدم
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

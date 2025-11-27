// src/pages/ReadyToDonateBloodPage.jsx
import React, { useState, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";
import {
  FiDroplet,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiFileText,
  FiCheck,
  FiCalendar,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import fetchWithInterceptors from "../services/fetchWithInterceptors";
import "./ReadyToDonateBloodPage.css";

const bloodTypes = ["A+","A-","B+","B-","AB+","AB-","O+","O-","غير معروف"];
const validatePhone = (v) => /^(2|3|4)\d{7}$/.test((v || "").trim());

export default function ReadyToDonateBloodPage() {
  const bgUrl = "/images/tabar5.jpg";
  const todayStr = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const [form, setForm] = useState({
    location: "",        // بلدية / مكان التوفر داخل موريتانيا (إجباري)
    bloodType: "",
    phone: "",
    whatsapp: "",
    availableUntil: "",  // آخر أجل لمهلة التبرع (إجباري)
    note: "",            // وصف مختصر للتبرع
  });

  const [touched, setTouched] = useState({
    location: false,
    bloodType: false,
    phone: false,
    whatsapp: false,
    availableUntil: false,
    note: false,
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // ========= تحميل الولايات/المقاطعات/البلديات من الباكند =========
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  useEffect(() => {
    const extractArray = (response) => {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (Array.isArray(response.body)) return response.body;
      if (Array.isArray(response.data)) return response.data;
      if (response.body && Array.isArray(response.body.items)) return response.body.items;
      return [];
    };

    const fetchOptions = async (endpoint, setter) => {
      try {
        const response = await fetchWithInterceptors(endpoint);
        const list = extractArray(response);
        setter(list);
      } catch (err) {
        console.error("خطأ في تحميل", endpoint, err);
        setter([]);
      }
    };

    fetchOptions("/api/wilayas", setWilayaOptions);
    fetchOptions("/api/moughataas", setMoughataaOptions);
    fetchOptions("/api/communes", setCommuneOptions);
  }, []);

  const normalize = (value) =>
    typeof value === "string" ? value.trim() : "";

  const findCommuneByName = (name) =>
    communeOptions.find((c) => normalize(c?.name_ar) === normalize(name));

  const selectedCommune = findCommuneByName(form.location);

  const selectedMoughataa = selectedCommune
    ? moughataaOptions.find(
        (m) => m.code === selectedCommune.code.slice(0, 4)
      )
    : null;

  const selectedWilaya = selectedCommune
    ? wilayaOptions.find(
        (w) => w.code === selectedCommune.code.slice(0, 2)
      )
    : null;

  // ===================== التحقق من الأخطاء =====================
  const computeErrors = (values) => {
    const e = {};

    // ✅ المكان إلزامي ومربوط ببلدية حقيقية
    if (!values.location || !values.location.trim()) {
      e.location = "الرجاء إدخال اسم البلدية.";
    } else if (!findCommuneByName(values.location)) {
      e.location = "الرجاء اختيار بلدية من القائمة المقترحة.";
    }

    // فصيلة الدم إلزامية
    if (!values.bloodType) e.bloodType = "الرجاء اختيار فصيلة الدم";

    // آخر أجل للتبرع إلزامي ويجب أن يكون من اليوم فصاعدًا
    if (!values.availableUntil) {
      e.availableUntil = "الرجاء اختيار آخر أجل لتوفر التبرع.";
    } else if (values.availableUntil < todayStr) {
      e.availableUntil = "يجب اختيار تاريخ اليوم أو تاريخًا لاحقًا.";
    }

    const phoneValid = validatePhone(values.phone);
    const whatsappValid = validatePhone(values.whatsapp);

    if (values.phone && !phoneValid)
      e.phone = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";
    if (values.whatsapp && !whatsappValid)
      e.whatsapp = "رقم غير صالح (8 أرقام ويبدأ بـ 2 أو 3 أو 4)";

    // يجب وجود وسيلة تواصل واحدة صحيحة على الأقل
    if (!phoneValid && !whatsappValid)
      e.contact = "يجب إدخال رقم هاتف أو واتساب واحد على الأقل بشكل صحيح.";

    return e;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(computeErrors(next));
  };

  const validateForm = () => {
    const e = computeErrors(form);
    setTouched({
      location: true,
      bloodType: true,
      phone: true,
      whatsapp: true,
      availableUntil: true,
      note: true,
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    const payload = {
      type: "blood",
      location: form.location,               // بلدية حقيقية
      bloodType: form.bloodType,
      availableUntil: form.availableUntil,   // يُرسل للباكند
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

      setForm({
        location: "",
        bloodType: "",
        phone: "",
        whatsapp: "",
        availableUntil: "",
        note: "",
      });
      setErrors({});
      setTouched({
        location: false,
        bloodType: false,
        phone: false,
        whatsapp: false,
        availableUntil: false,
        note: false,
      });
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
              {/* 1. المكان (البلدية) */}
              <div className="form-field">
                <label className="form-label">
                  <FiMapPin className="me-2" /> البلدية داخل موريتانيا (إجباري)
                </label>
                <input
                  list="communesList"
                  name="location"
                  value={form.location}
                  onChange={onChange}
                  className="form-input"
                  placeholder="اكتب أو اختر اسم البلدية (مثال: عرفات، تفرغ زينة...)"
                  style={
                    touched.location && errors.location
                      ? { borderColor: "#e53e3e" }
                      : {}
                  }
                />
                <datalist id="communesList">
                  {communeOptions.map((c) => (
                    <option key={c.code} value={c.name_ar} />
                  ))}
                </datalist>

                {touched.location && errors.location && (
                  <span className="error-message">{errors.location}</span>
                )}

                {normalize(form.location) && selectedCommune && (
                  <div className="location-preview-box">
                    <span className="location-chip">
                      الولاية:&nbsp;
                      <strong>{selectedWilaya?.name_ar || "—"}</strong>
                    </span>
                    <span className="location-chip">
                      المقاطعة:&nbsp;
                      <strong>{selectedMoughataa?.name_ar || "—"}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* 2. فصيلة الدم */}
              <div className="form-field">
                <label className="form-label">
                  <FiDroplet className="me-2 icon-blood" /> فصيلة الدم
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

              {/* 3. الهاتف */}
              <div className="form-field">
                <label className="form-label">
                  <FiPhone className="me-2 icon-phone" /> الهاتف
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

              {/* 4. واتساب */}
              <div className="form-field">
                <label className="form-label">
                  <FiMessageCircle className="me-2 icon-whatsapp" /> واتساب
                </label>
                <input
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

              {/* رسالة خطأ لوسيلة التواصل */}
              {errors.contact && (
                <div className="form-field">
                  <span className="error-message">{errors.contact}</span>
                </div>
              )}

              {/* 5. آخر أجل لمهلة التبرع */}
              <div className="form-field">
                <label className="form-label">
                  <FiCalendar className="me-2 icon-date" /> آخر أجل لمهلة التبرع
                </label>
                <input
                  type="date"
                  name="availableUntil"
                  value={form.availableUntil}
                  onChange={onChange}
                  min={todayStr}
                  className="form-input"
                  style={
                    touched.availableUntil && errors.availableUntil
                      ? { borderColor: "#e53e3e" }
                      : {}
                  }
                />
                {touched.availableUntil && errors.availableUntil && (
                  <span className="error-message">{errors.availableUntil}</span>
                )}
              </div>

              {/* 6. وصف مختصر للتبرع */}
              <div className="form-field">
                <label className="form-label">
                  <FiFileText className="me-2" /> وصف مختصر للتبرع (اختياري)
                </label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="مثال: متوفر في الفترة المسائية، أقبل الاتصال الهاتفي فقط..."
                />
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

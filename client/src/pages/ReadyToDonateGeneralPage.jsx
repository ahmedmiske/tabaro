// src/pages/ReadyToDonateGeneralPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Form, Alert } from "react-bootstrap";
import {
  FiHeart,
  FiDroplet,
  FiCheck,
  FiMapPin,
  FiPhone,
  FiMessageCircle,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import fetchWithInterceptors from "../services/fetchWithInterceptors";
import { GENERAL_CATEGORY_OPTIONS } from "../constants/donationCategories";
import "./ReadyToDonateGeneralPage.css";

// ✅ رقم عام: يصلح لأي دولة (أرقام فقط، من 6 إلى 15 رقم)
const validatePhone = (v) => /^[0-9]{6,15}$/.test((v || "").trim());

export default function ReadyToDonateGeneralPage() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    // الموقع
    locationMode: "none",      // none | mr | abroad
    locationMr: "",            // بلدية/مدينة داخل موريتانيا
    locationAbroadCity: "",    // مدينة خارج موريتانيا
    locationAbroadCountry: "", // دولة خارج موريتانيا

    // ✅ الخيار المسبق = المساعدات المالية
    category: "financial_aid",
    note: "",
    phone: "",
    whatsapp: "",
    availableUntil: "",        // تاريخ انتهاء العرض (إجباري)
  });

  const [touched, setTouched] = useState({
    locationMode: false,
    locationMr: false,
    locationAbroadCity: false,
    locationAbroadCountry: false,
    category: false,
    phone: false,
    whatsapp: false,
    availableUntil: false,
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // ========= بيانات الولايات/المقاطعات/البلديات =========
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  useEffect(() => {
    const extractArray = (res) => {
      if (!res) return [];
      if (Array.isArray(res)) return res;
      if (Array.isArray(res.body)) return res.body;
      if (Array.isArray(res.data)) return res.data;
      if (res.body && Array.isArray(res.body.items)) return res.body.items;
      return [];
    };

    const fetchList = async (endpoint, setter) => {
      try {
        const res = await fetchWithInterceptors(endpoint);
        setter(extractArray(res));
      } catch (err) {
        console.error("خطأ في تحميل", endpoint, err);
        setter([]);
      }
    };

    fetchList("/api/wilayas", setWilayaOptions);
    fetchList("/api/moughataas", setMoughataaOptions);
    fetchList("/api/communes", setCommuneOptions);
  }, []);

  const normalize = (v) => (v || "").trim();

  const selectedCommune = useMemo(
    () =>
      communeOptions.find(
        (c) => normalize(c?.name_ar) === normalize(form.locationMr)
      ) || null,
    [communeOptions, form.locationMr]
  );

  const selectedMoughataa = useMemo(() => {
    if (!selectedCommune?.code) return null;
    const mCode = selectedCommune.code.slice(0, 4);
    return moughataaOptions.find((m) => m.code === mCode) || null;
  }, [selectedCommune, moughataaOptions]);

  const selectedWilaya = useMemo(() => {
    if (!selectedCommune?.code) return null;
    const wCode = selectedCommune.code.slice(0, 2);
    return wilayaOptions.find((w) => w.code === wCode) || null;
  }, [selectedCommune, wilayaOptions]);

  // صورة الخلفية
  const bgCandidates = useMemo(
    () => ["/images/tabar6.jpg", "/images/tabar5.jpg", "/images/fundo-about.png"],
    []
  );
  const bgUrl = useMemo(() => bgCandidates[0], [bgCandidates]);

  // ✅ ترتيب خيارات التبرع بحيث تظهر "المساعدات المالية" أولاً
  const categoryOptions = useMemo(() => {
    const copy = [...GENERAL_CATEGORY_OPTIONS];
    return copy.sort((a, b) => {
      if (a.value === "financial_aid") return -1;
      if (b.value === "financial_aid") return 1;
      return 0;
    });
  }, []);

  // ======== حساب الأخطاء ========
  const computeErrors = (values) => {
    const e = {};

    // نوع التبرع
    if (!values.category) e.category = "اختر نوع التبرع";

    // تاريخ انتهاء العرض (إجباري)
    if (!values.availableUntil) {
      e.availableUntil = "الرجاء اختيار تاريخ انتهاء العرض.";
    } else if (values.availableUntil < todayStr) {
      e.availableUntil = "يجب اختيار تاريخ اليوم أو تاريخًا لاحقًا.";
    }

    // أرقام الهاتف/الواتساب (دولية)
    const phoneValid = validatePhone(values.phone);
    const whatsappValid = validatePhone(values.whatsapp);

    if (values.phone && !phoneValid)
      e.phone = "رقم غير صالح (أرقام فقط، بين 6 و 15 رقماً).";
    if (values.whatsapp && !whatsappValid)
      e.whatsapp = "رقم غير صالح (أرقام فقط، بين 6 و 15 رقماً).";

    // لابد من هاتف أو واتساب واحد صحيح على الأقل
    if (!phoneValid && !whatsappValid) {
      e.contact = "يجب إدخال رقم هاتف أو واتساب واحد على الأقل بشكل صحيح.";
    }

    return e;
  };

  // التحقق الفوري عند الكتابة
  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(computeErrors(next));
  };

  // التحقق عند الإرسال
  const validateForm = () => {
    const e = computeErrors(form);
    setTouched({
      locationMode: true,
      locationMr: true,
      locationAbroadCity: true,
      locationAbroadCountry: true,
      category: true,
      phone: true,
      whatsapp: true,
      availableUntil: true,
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    // تجهيز حقل الموقع حسب الاختيار (اختياري دائما)
    let location = "";
    let city = "";
    let country = "";

    if (form.locationMode === "mr") {
      location = normalize(form.locationMr);
      city = selectedCommune?.name_ar || normalize(form.locationMr);
      country = "موريتانيا";
    } else if (form.locationMode === "abroad") {
      city = normalize(form.locationAbroadCity);
      country = normalize(form.locationAbroadCountry);
      location = [city, country].filter(Boolean).join(" - ");
    }

    // تجهيز وسائل التواصل (لا نرسل الفارغة)
    const contactMethods = [];
    if (form.phone.trim()) {
      contactMethods.push({ method: "phone", number: form.phone.trim() });
    }
    if (form.whatsapp.trim()) {
      contactMethods.push({ method: "whatsapp", number: form.whatsapp.trim() });
    }

    const payload = {
      type: "general",
      locationMode: form.locationMode,
      location,
      city,
      country,
      availableUntil: form.availableUntil,
      note: form.note,
      extra: { category: form.category },
      contactMethods,
    };

    try {
      const res = await fetchWithInterceptors("/api/ready-to-donate-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res?.ok) {
        setMsg("تم تسجيل استعدادك للتبرع العام بنجاح.");
        setSuccess(true);

        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // إعادة ضبط القيم (مع إبقاء نوع التبرع الافتراضي)
        setForm({
          locationMode: "none",
          locationMr: "",
          locationAbroadCity: "",
          locationAbroadCountry: "",
          category: "financial_aid",
          note: "",
          phone: "",
          whatsapp: "",
          availableUntil: "",
        });
        setErrors({});
        setTouched({
          locationMode: false,
          locationMr: false,
          locationAbroadCity: false,
          locationAbroadCountry: false,
          category: false,
          phone: false,
          whatsapp: false,
          availableUntil: false,
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
    <div className="ready-general-row">
      {/* الهيرو / الصورة — تختفي بعد النجاح */}
      {!success && (
        <section
          className="general-hero"
        >
          <div className="hero-content">
            <h1 className="hero-title-general">
              <FiDroplet className="me-2 icon-blood" /> مستعد للتبرع العام
            </h1>
            <p className="hero-desc-blood">مساهمتك تحدث فرقًا حقيقيًا في حياة الناس.</p>
          </div>

        </section>
      )}

      {/* الجانب الأيمن / الفورم أو رسالة النجاح */}
      <div className="form-side" style={success ? { maxWidth: "900px", margin: "0 auto" } : {}}>
        <div className="form-container">
          {!success && (
            <>
              <div className="form-title">سجّل استعدادك للتبرع</div>
              <div className="form-header">
                املأ البيانات التالية لتسجيل استعدادك
              </div>
            </>
          )}

          {/* Alert فقط للأخطاء، لا نعرضه عند النجاح */}
          {msg && !success && (
            <Alert
              variant={msg.startsWith("تم تسجيل") ? "success" : "danger"}
              className="mb-3"
            >
              {msg}
            </Alert>
          )}

          {/* ========= الفورم ========= */}
          {!success && (
            <Form onSubmit={submit} className="donation-form">
              {/* 1. معلومات المكان (اختياري) */}
              <div className="form-field">
                <label className="form-label">
                  <FiMapPin className="me-2" /> الموقع (اختياري)
                </label>
                <div className="location-mode-options mb-2">
                  <Form.Check
                    inline
                    type="radio"
                    id="loc-none"
                    name="locationMode"
                    value="none"
                    label="لا أريد تحديد الموقع الآن"
                    checked={form.locationMode === "none"}
                    onChange={onChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="loc-mr"
                    name="locationMode"
                    value="mr"
                    label="داخل موريتانيا"
                    checked={form.locationMode === "mr"}
                    onChange={onChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="loc-abroad"
                    name="locationMode"
                    value="abroad"
                    label="خارج موريتانيا"
                    checked={form.locationMode === "abroad"}
                    onChange={onChange}
                  />
                </div>

                {form.locationMode === "mr" && (
                  <>
                    <small className="text-muted d-block mb-1">
                      اختر البلدية (أو المدينة) داخل موريتانيا. سيتم ربطها آليًا
                      بالولاية والمقاطعة إن وُجدت في القائمة.
                    </small>
                    <input
                      list="communesList"
                      name="locationMr"
                      value={form.locationMr}
                      onChange={onChange}
                      className="form-input"
                      placeholder="مثال: عرفات، تفرغ زينة..."
                    />
                    <datalist id="communesList">
                      {communeOptions.map((c) => (
                        <option key={c.code} value={c.name_ar} />
                      ))}
                    </datalist>

                    {normalize(form.locationMr) && selectedCommune && (
                      <div className="location-preview-box">
                        <span className="location-chip">
                          الولاية:&nbsp;
                          <strong>{selectedWilaya?.name_ar || "—"}</strong>
                        </span>
                        <span className="location-chip">
                          المقاطعة:&nbsp;
                          <strong>{selectedMoughataa?.name_ar || "—"}</strong>
                        </span>
                        <span className="location-chip">
                          البلدية:&nbsp;
                          <strong>{selectedCommune?.name_ar || "—"}</strong>
                        </span>
                      </div>
                    )}
                  </>
                )}

                {form.locationMode === "abroad" && (
                  <>
                    <small className="text-muted d-block mb-1">
                      يمكنك تحديد المدينة والدولة (اختياري).
                    </small>
                    <div className="location-abroad-row">
                      <input
                        name="locationAbroadCity"
                        value={form.locationAbroadCity}
                        onChange={onChange}
                        className="form-input mb-2"
                        placeholder="المدينة (مثال: فيتوريا، باريس...)"
                      />
                      <input
                        name="locationAbroadCountry"
                        value={form.locationAbroadCountry}
                        onChange={onChange}
                        className="form-input"
                        placeholder="الدولة (مثال: إسبانيا، فرنسا...)"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* 2. نوع التبرع */}
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
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {touched.category && errors.category && (
                  <span className="error-message">{errors.category}</span>
                )}
              </div>

              {/* 3. الهاتف */}
              <div className="form-field">
                <label className="form-label" htmlFor="phone">
                  <FiPhone className="me-2" /> الهاتف
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

              {/* 4. واتساب */}
              <div className="form-field">
                <label className="form-label" htmlFor="whatsapp">
                  <FiMessageCircle className="me-2" /> واتساب
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

                {/* حقل رفع ملف أو صورة */}
                <div className="form-field">
                  <label className="form-label" htmlFor="attachment">
                    📎 أرفق ملف أو صورة (اختياري)
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    accept="image/*,application/pdf"
                    capture="environment"
                    className="form-input"
                  />
                </div>

              {/* خطأ عام لوسائل التواصل */}
              {errors.contact && (
                <div className="form-field">
                  <span className="error-message">{errors.contact}</span>
                </div>
              )}

              {/* 5. تاريخ انتهاء العرض */}
              <div className="form-field">
                <label className="form-label" htmlFor="availableUntil">
                  <FiCalendar className="me-2" /> تاريخ انتهاء العرض
                </label>
                <input
                  type="date"
                  id="availableUntil"
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

              {/* 6. ملاحظة */}
              <div className="form-field">
                <label className="form-label" htmlFor="note">
                  <FiFileText className="me-2" /> وصف مختصر للعرض (اختياري)
                </label>
                <textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={onChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="مثال: مساعدة مالية عاجلة، توزيع ملابس وأثاث في الحي، دعم محظرة معينة..."
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  <FiCheck className="me-2" /> تأكيد التسجيل
                </button>
              </div>
            </Form>
          )}

          {/* ========= واجهة النجاح ========= */}
          {success && (
            <div className="success-next text-center">
              <div className="success-icon mb-3">
                <FiCheck size={50} className="text-success" />
              </div>
              <h3 className="mb-2">تم تسجيل استعدادك للتبرع 🎉</h3>
              <p className="text-muted mb-4">
                شكرًا لعطائك. يمكن الآن للمحتاجين أو الجهات الخيرية التواصل معك
                حسب بيانات الاتصال التي أدخلتها.
              </p>

              <div className="d-flex flex-wrap justify-content-center gap-3">
                <Link to="/donations" className="btn btn-primary btn-lg">
                  عرض طلبات التبرع
                </Link>
                <Link to="/general-donors" className="btn btn-outline-success btn-lg">
                  رؤية قائمة المتبرعين الجاهزين
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => {
                    setSuccess(false);
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                >
                  تسجيل عرض جديد
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

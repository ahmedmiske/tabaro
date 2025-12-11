// src/components/ReadyToDonateBlood.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import fetchWithInterceptors from "../services/fetchWithInterceptors";

// -----------------------------------------
//  بيانات الدم
// -----------------------------------------
const bloodTypes = ["A+","A-","B+","B-","AB+","AB-","O+","O-","غير معروف"];

// -----------------------------------------
//  تحقق من رقم موريتاني صحيح
// -----------------------------------------
const validatePhone = (v) => /^(2|3|4)\d{7}$/.test((v || "").trim());

// 🔤 دالّة مساعدة للاسم بالعربية
const getNameAr = (obj) =>
  (obj &&
    (obj.name_ar ||
      obj.nameAr ||
      obj.arabicName ||
      obj.labelAr ||
      obj.label ||
      obj.name ||
      obj.nomAr)) ||
  "";

// للتطبيع النصي
const normalize = (str) => (str || "").toString().trim().toLowerCase();

export default function ReadyToDonateBlood() {
  // -----------------------------------------
  //  STATES
  // -----------------------------------------
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    location: "",
    bloodType: "",
    availableUntil: "",   // ✅ تاريخ انتهاء الاستعداد
    note: "",
    phone: "",
    whatsapp: "",
  });

  const [touched, setTouched] = useState({
    location: false,
    bloodType: false,
    availableUntil: false,
    phone: false,
    whatsapp: false,
  });

  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState("");

  // خيارات الولاية / المقاطعة / البلدية من الباكند
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  // -----------------------------------------
  //  ربط الموقع بالبلدية/المقاطعة/الولاية من قاعدة البيانات
  // -----------------------------------------
  const selectedCommune = useMemo(() => {
    const loc = normalize(form.location);
    if (!loc) return null;
    return (
      communeOptions.find(
        (c) =>
          normalize(c.name_ar) === loc ||
          normalize(c.nameAr) === loc ||
          normalize(c.nomAr) === loc ||
          normalize(c.label) === loc
      ) || null
    );
  }, [form.location, communeOptions]);

  const selectedMoughataa = useMemo(() => {
    if (!selectedCommune) return null;
    const code =
      selectedCommune.moughataaCode ||
      selectedCommune.moughataa_code ||
      selectedCommune.moughataa;
    if (!code) return null;
    return (
      moughataaOptions.find(
        (m) =>
          m.code === code ||
          m.moughataaCode === code ||
          m.moughataa_code === code
      ) || null
    );
  }, [selectedCommune, moughataaOptions]);

  const selectedWilaya = useMemo(() => {
    if (!selectedCommune) return null;
    const communeCode = selectedCommune.code || "";
    if (!communeCode) return null;
    const wilayaCode = communeCode.slice(0, 2);
    return wilayaOptions.find((w) => w.code === wilayaCode) || null;
  }, [selectedCommune, wilayaOptions]);

  const locationLabel = useMemo(() => {
    if (!selectedCommune) return form.location || "";
    const parts = [
      getNameAr(selectedCommune),
      selectedMoughataa ? getNameAr(selectedMoughataa) : "",
      selectedWilaya ? getNameAr(selectedWilaya) : "",
    ].filter(Boolean);
    return parts.join(" - ");
  }, [form.location, selectedCommune, selectedMoughataa, selectedWilaya]);

  // -----------------------------------------
  //  فتح / إغلاق المودال عبر الهاش
  // -----------------------------------------
  const openModal = () => {
    setShow(true);
    if (window.location.hash !== "#ready-blood") {
      window.history.pushState(null, "", "#ready-blood");
    }
  };

  const closeModal = () => {
    setShow(false);
    if (window.location.hash === "#ready-blood") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#ready-blood") setShow(true);
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);

    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  // -----------------------------------------
  //  تحميل البلديات / المقاطعات / الولايات من الباكند
  // -----------------------------------------
  useEffect(() => {
    const extractArray = (response) => {
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (Array.isArray(response.body)) return response.body;
      if (Array.isArray(response.data)) return response.data;
      if (response.body && Array.isArray(response.body.items))
        return response.body.items;
      return [];
    };

    const fetchOptions = async (endpoint, setter) => {
      try {
        const res = await fetchWithInterceptors(endpoint);
        const list = extractArray(res);
        setter(list);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error loading", endpoint, err);
        setter([]);
      }
    };

    fetchOptions("/api/wilayas", setWilayaOptions);
    fetchOptions("/api/moughataas", setMoughataaOptions);
    fetchOptions("/api/communes", setCommuneOptions);
  }, []);

  // -----------------------------------------
  //  دالة حساب الأخطاء
  // -----------------------------------------
  const computeErrors = (values) => {
    const e = {};

    if (!values.location.trim()) e.location = "الموقع مطلوب";

    if (!values.bloodType) e.bloodType = "فصيلة الدم مطلوبة";

    if (!values.availableUntil) {
      e.availableUntil = "تاريخ انتهاء الاستعداد مطلوب";
    } else {
      const d = new Date(values.availableUntil);
      if (Number.isNaN(d.getTime())) {
        e.availableUntil = "تاريخ غير صالح";
      }
    }

    const phoneValid = validatePhone(values.phone);
    const whatsappValid = validatePhone(values.whatsapp);

    if (values.phone && !phoneValid)
      e.phone = "الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.";

    if (values.whatsapp && !whatsappValid)
      e.whatsapp = "الرقم يجب أن يكون 8 أرقام ويبدأ بـ 2 أو 3 أو 4.";

    if (!phoneValid && !whatsappValid)
      e.contact = "يجب إدخال رقم هاتف أو واتساب واحد على الأقل بشكل صحيح.";

    return e;
  };

  // -----------------------------------------
  //  التحقق الفوري عند الكتابة
  // -----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    const newErrors = computeErrors({ ...form, [name]: value });
    setErrors(newErrors);
  };

  // -----------------------------------------
  //  التحقق عند الإرسال
  // -----------------------------------------
  const validateForm = () => {
    const e = computeErrors(form);
    setTouched({
      location: true,
      bloodType: true,
      availableUntil: true,
      phone: true,
      whatsapp: true,
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // -----------------------------------------
  //  SUBMIT
  // -----------------------------------------
  const submit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;

    const finalLocation = (locationLabel || form.location || "").trim();

    const contactMethods = [];
    if (form.phone && validatePhone(form.phone)) {
      contactMethods.push({
        method: "phone",
        number: form.phone.trim(),
      });
    }
    if (form.whatsapp && validatePhone(form.whatsapp)) {
      contactMethods.push({
        method: "whatsapp",
        number: form.whatsapp.trim(),
      });
    }

    const payload = {
      type: "blood",
      location: finalLocation,
      bloodType: form.bloodType,
      availableUntil: form.availableUntil, // ✅ مهم للباكند
      note: form.note,
      contactMethods,
    };

    // أكواد/أسماء إضافية (اختياري)
    if (selectedCommune) {
      payload.communeNameAr = getNameAr(selectedCommune);
    }
    if (selectedMoughataa) {
      payload.moughataaNameAr = getNameAr(selectedMoughataa);
    }
    if (selectedWilaya) {
      payload.wilayaNameAr = getNameAr(selectedWilaya);
    }

    try {
      await fetchWithInterceptors("/api/ready-to-donate-blood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setOk("✅ تم تسجيل استعدادك للتبرع بنجاح.");

      setForm({
        location: "",
        bloodType: "",
        availableUntil: "",
        note: "",
        phone: "",
        whatsapp: "",
      });
      setErrors({});
      setTouched({
        location: false,
        bloodType: false,
        availableUntil: false,
        phone: false,
        whatsapp: false,
      });

      setTimeout(() => {
        setOk("");
        closeModal();
      }, 900);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("ReadyToDonateBlood submit error:", err);
      setOk("❌ حدث خطأ. حاول لاحقًا.");
    }
  };

  // -----------------------------------------
  //  UI
  // -----------------------------------------
  return (
    <>
      {/* CARD BUTTON */}
      <div
        className="card border-0 shadow-sm p-3 d-flex align-items-center justify-content-between flex-row"
        style={{ borderRadius: 16 }}
      >
        <div>
          <div className="fw-bold fs-5 mb-1">زر التبرّع بالدم</div>
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-underline"
            onClick={openModal}
          >
            سجّل رغبتك الآن
          </button>
        </div>

        <Button className="px-4 py-2" onClick={openModal}>
          <i className="fa-solid fa-droplet ms-2"></i> أنا مستعد للتبرع
        </Button>
      </div>

      {/* MODAL */}
      <Modal show={show} onHide={closeModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>استعداد للتبرع بالدم</Modal.Title>
        </Modal.Header>

        <Form onSubmit={submit}>
          <Modal.Body>
            {ok && (
              <Alert variant={ok.startsWith("✅") ? "success" : "danger"}>
                {ok}
              </Alert>
            )}

            {/* LOCATION */}
            <Form.Group className="mb-3">
              <Form.Label>الموقع (المدينة / البلدية داخل موريتانيا)</Form.Label>
              <Form.Control
                list="ready-communes"
                name="location"
                value={form.location}
                onChange={handleChange}
                isInvalid={touched.location && !!errors.location}
                placeholder="اكتب أو اختر اسم المدينة / البلدية (مثال: عرفات، تفرغ زينة...)"
              />
              <datalist id="ready-communes">
                {communeOptions.map((c) => (
                  <option key={c.code} value={c.name_ar} />
                ))}
              </datalist>
              {touched.location && errors.location && (
                <div className="text-danger small mt-1">{errors.location}</div>
              )}

              {normalize(form.location) && selectedCommune && (
                <div className="mt-2 small text-muted">
                  <span className="me-2">
                    <strong>المقاطعة:</strong>{" "}
                    {getNameAr(selectedMoughataa) || "—"}
                  </span>
                  <span>
                    <strong>الولاية:</strong>{" "}
                    {getNameAr(selectedWilaya) || "—"}
                  </span>
                </div>
              )}
            </Form.Group>

            {/* BLOOD TYPE */}
            <Form.Group className="mb-3">
              <Form.Label>فصيلة الدم</Form.Label>
              <Form.Select
                name="bloodType"
                value={form.bloodType}
                onChange={handleChange}
                isInvalid={touched.bloodType && !!errors.bloodType}
              >
                <option value="">-- اختر --</option>
                {bloodTypes.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </Form.Select>
              {touched.bloodType && errors.bloodType && (
                <div className="text-danger small mt-1">
                  {errors.bloodType}
                </div>
              )}
            </Form.Group>

            {/* AVAILABLE UNTIL */}
            <Form.Group className="mb-3">
              <Form.Label>آخر أجل لمهلة التبرع</Form.Label>
              <Form.Control
                type="date"
                name="availableUntil"
                value={form.availableUntil}
                onChange={handleChange}
                isInvalid={touched.availableUntil && !!errors.availableUntil}
              />
              {touched.availableUntil && errors.availableUntil && (
                <div className="text-danger small mt-1">
                  {errors.availableUntil}
                </div>
              )}
            </Form.Group>

            {/* PHONE */}
            <Form.Group className="mb-3">
              <Form.Label>الهاتف</Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={handleChange}
                isInvalid={touched.phone && !!errors.phone}
                placeholder="8 أرقام ويبدأ بـ 2 أو 3 أو 4"
              />
              {touched.phone && errors.phone && (
                <div className="text-danger small mt-1">{errors.phone}</div>
              )}
            </Form.Group>

            {/* WHATSAPP */}
            <Form.Group className="mb-3">
              <Form.Label>واتساب</Form.Label>
              <Form.Control
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                isInvalid={touched.whatsapp && !!errors.whatsapp}
                placeholder="8 أرقام ويبدأ بـ 2 أو 3 أو 4"
              />
              {touched.whatsapp && errors.whatsapp && (
                <div className="text-danger small mt-1">
                  {errors.whatsapp}
                </div>
              )}
            </Form.Group>

            {/* GLOBAL CONTACT ERROR */}
            {errors.contact && (
              <div className="text-danger mb-2 small">{errors.contact}</div>
            )}

            {/* NOTE */}
            <Form.Group>
              <Form.Label>وصف مختصر للتبرع (اختياري)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={form.note}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              إلغاء
            </Button>
            <Button type="submit">تأكيد عرض التبرع</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

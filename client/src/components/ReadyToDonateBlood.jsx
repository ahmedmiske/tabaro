// src/components/ReadyToDonateBlood.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Modal } from "react-bootstrap";
import fetchWithInterceptors from "../services/fetchWithInterceptors";

// -----------------------------------------
//  بيانات الاختيار
// -----------------------------------------
const placesList = [
  "ألاك","أمباني","امبود","آمرج","انتيكان","أوجفت","أطار","باسكنو","بابابي","باركيول",
  "بير أم أكرين","بوكي","بومديد","بوتلميت","تفرغ زينة","تجكجة","تمبدغة","توجنين","تيارت",
  "تيشيت","جلوار (بوغور)","جكني","دار النعيم","روصو","الرياض","الزويرات","السبخة","الشامي",
  "شنقيط","الطويل","الطينطان","عرفات","عدل بكرو","فديرك","كرمسين","كرو","كنكوصة","كوبني",
  "كيهيدي","كيفة","لكصر","لكصيبة","لعيون","مال","مقامة","مقطع لحجار","المذرذرة","المجرية",
  "الميناء","مونكل","نواذيبو","نواكشوط","النعمة","وادان","واد الناقة","ولد ينج","ولاتة","ومبو",
  "سيليبابي","تامشكط","أكجوجت"
];

const bloodTypes = ["A+","A-","B+","B-","AB+","AB-","O+","O-","غير معروف"];

// -----------------------------------------
//  تحقق من رقم موريتاني صحيح
// -----------------------------------------
const validatePhone = (v) => /^(2|3|4)\d{7}$/.test((v || "").trim());

export default function ReadyToDonateBlood() {

  // -----------------------------------------
  //  STATES
  // -----------------------------------------
  const [show, setShow] = useState(false);

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
  const [ok, setOk] = useState("");

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
  //  دالة حساب الأخطاء
  // -----------------------------------------
  const computeErrors = (values) => {
    const e = {};

    if (!values.location.trim()) e.location = "الموقع مطلوب";
    if (!values.bloodType) e.bloodType = "فصيلة الدم مطلوبة";

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

    const payload = {
      type: "blood",
      location: form.location.trim(),
      bloodType: form.bloodType,
      note: form.note,
      contactMethods: [
        { method: "phone", number: form.phone.trim() },
        { method: "whatsapp", number: form.whatsapp.trim() },
      ],
    };

    try {
      await fetchWithInterceptors("/api/ready-to-donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setOk("✅ تم تسجيل استعدادك للتبرع بنجاح.");

      setForm({ location: "", bloodType: "", note: "", phone: "", whatsapp: "" });
      setErrors({});
      setTouched({ location: false, bloodType: false, phone: false, whatsapp: false });

      setTimeout(() => {
        setOk("");
        closeModal();
      }, 900);

    } catch (err) {
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
            {ok && <Alert variant="success">{ok}</Alert>}

            {/* LOCATION */}
            <Form.Group className="mb-3">
              <Form.Label>الموقع</Form.Label>
              <Form.Control
                list="ready-locations"
                name="location"
                value={form.location}
                onChange={handleChange}
                isInvalid={touched.location && !!errors.location}
              />
              <datalist id="ready-locations">
                {placesList.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
              {touched.location && errors.location && (
                <div className="text-danger small">{errors.location}</div>
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
                <div className="text-danger small">{errors.bloodType}</div>
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
                <div className="text-danger small">{errors.phone}</div>
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
                <div className="text-danger small">{errors.whatsapp}</div>
              )}
            </Form.Group>

            {/* GLOBAL CONTACT ERROR */}
            {errors.contact && (
              <div className="text-danger mb-2 small">{errors.contact}</div>
            )}

            {/* NOTE */}
            <Form.Group>
              <Form.Label>ملاحظة (اختياري)</Form.Label>
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
            <Button type="submit">تأكيد التسجيل</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

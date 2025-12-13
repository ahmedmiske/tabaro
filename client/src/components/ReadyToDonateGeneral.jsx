// src/components/ReadyToDonateGeneral.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp, FaCheck } from 'react-icons/fa';

import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { GENERAL_CATEGORY_META } from '../constants/donationCategories';

// ===== Helpers =====
const validatePhone = (v) => /^[0-9]{6,15}$/.test((v || '').trim());

const getNameAr = (obj) =>
  (obj &&
    (obj.name_ar ||
      obj.nameAr ||
      obj.arabicName ||
      obj.labelAr ||
      obj.label ||
      obj.name ||
      obj.nomAr)) ||
  '';

const normalize = (value) =>
  typeof value === 'string' ? value.trim() : '';

const extractArray = (response) => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.body)) return response.body;
  if (Array.isArray(response.data)) return response.data;
  if (response.body && Array.isArray(response.body.items))
    return response.body.items;
  return [];
};

export default function ReadyToDonateGeneral() {
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    // الموقع
    locationMode: 'mr', // mr | abroad | none
    communeName: '', // اسم البلدية داخل موريتانيا
    outsideAddress: '',
    outsideCity: '',
    outsideCountry: '',

    // نوع الاستعداد
    donationType: 'financial', // financial | inkind
    category: 'financial_aid',
    amount: '',

    availableUntil: '',
    note: '',
    phone: '',
    whatsapp: '',
  });

  const [errors, setErrors] = useState({});
  const [ok, setOk] = useState('');

  // بيانات الولايات/المقاطعات/البلديات
  const [wilayaOptions, setWilayaOptions] = useState([]);
  const [moughataaOptions, setMoughataaOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);

  // افتح المودال تلقائيًا عند #ready-general
  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === '#ready-general') setShow(true);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  // تحميل خيارات الموقع (نفس منطق طلب الدم)
  useEffect(() => {
    const fetchOptions = async (endpoint, setter) => {
      try {
        const response = await fetchWithInterceptors(endpoint);
        const list = extractArray(response);
        setter(list);
      } catch (err) {
        console.error('خطأ في تحميل', endpoint, err);
        setter([]);
      }
    };

    fetchOptions('/api/wilayas', setWilayaOptions);
    fetchOptions('/api/moughataas', setMoughataaOptions);
    fetchOptions('/api/communes', setCommuneOptions);
  }, []);

  // ----- اختيار البلدية داخل موريتانيا -----
  const findCommuneByName = (name) =>
    communeOptions.find(
      (c) => normalize(c?.name_ar) === normalize(name),
    );

  const selectedCommune = useMemo(
    () => findCommuneByName(form.communeName),
    [form.communeName, communeOptions],
  );

  const selectedMoughataa = useMemo(() => {
    if (!selectedCommune) return null;
    return moughataaOptions.find(
      (m) => m.code === selectedCommune.code?.slice(0, 4),
    );
  }, [selectedCommune, moughataaOptions]);

  const selectedWilaya = useMemo(() => {
    if (!selectedCommune) return null;
    return wilayaOptions.find(
      (w) => w.code === selectedCommune.code?.slice(0, 2),
    );
  }, [selectedCommune, wilayaOptions]);

  // النص النهائي للموقع الذي نخزّنه في DB
  const locationLabel = useMemo(() => {
    if (form.locationMode === 'mr' && selectedCommune) {
      const parts = [
        getNameAr(selectedCommune),
        selectedMoughataa ? getNameAr(selectedMoughataa) : '',
        selectedWilaya ? getNameAr(selectedWilaya) : '',
      ].filter(Boolean);
      return parts.join(' - ');
    }

    if (form.locationMode === 'abroad') {
      const parts = [
        form.outsideAddress,
        form.outsideCity,
        form.outsideCountry,
      ].map((p) => (p || '').trim()).filter(Boolean);
      return parts.join(' - ');
    }

    return '';
  }, [
    form.locationMode,
    form.communeName,
    form.outsideAddress,
    form.outsideCity,
    form.outsideCountry,
    selectedCommune,
    selectedMoughataa,
    selectedWilaya,
  ]);

  // ----- Handlers -----
  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const setField = (name, value) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const validate = () => {
    const e = {};

    // الموقع
    if (form.locationMode === 'mr') {
      if (!form.communeName.trim()) {
        e.communeName = 'البلدية مطلوبة';
      } else if (!selectedCommune) {
        e.communeName = 'الرجاء اختيار بلدية من القائمة المقترحة';
      }
    } else if (form.locationMode === 'abroad') {
      if (!form.outsideCountry.trim()) e.outsideCountry = 'الدولة مطلوبة';
      if (!form.outsideCity.trim()) e.outsideCity = 'المدينة مطلوبة';
    }

    // نوع التبرع
    if (!form.category) e.category = 'نوع التبرع مطلوب';
    if (!form.donationType) e.donationType = 'حقل مطلوب';

    if (form.donationType === 'financial') {
      const amt = Number(form.amount);
      if (!form.amount || Number.isNaN(amt) || amt <= 0) {
        e.amount = 'القيمة المالية مطلوبة ويجب أن تكون رقمًا أكبر من 0';
      }
    }

    // التاريخ
    if (!form.availableUntil) e.availableUntil = 'تاريخ الانتهاء مطلوب';

    // وسائل التواصل
    const phoneOk = form.phone && validatePhone(form.phone);
    const waOk = form.whatsapp && validatePhone(form.whatsapp);

    if (!phoneOk && !waOk) {
      e.contact = 'يجب إدخال هاتف أو واتساب واحد صحيح على الأقل (6–15 رقم).';
    }
    if (form.phone && !phoneOk) e.phone = 'رقم غير صالح (6–15 رقم).';
    if (form.whatsapp && !waOk) e.whatsapp = 'رقم غير صالح (6–15 رقم).';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // تحديد قيم city و country المناسبة
    let cityDb = '';
    let countryDb = '';

    if (form.locationMode === 'mr') {
      cityDb = getNameAr(selectedCommune) || form.communeName;
      countryDb = 'موريتانيا';
    } else if (form.locationMode === 'abroad') {
      cityDb = form.outsideCity.trim();
      countryDb = form.outsideCountry.trim();
    }

    const contactMethods = [];
    if (form.phone && validatePhone(form.phone)) {
      contactMethods.push({
        method: 'phone',
        number: form.phone.trim(),
      });
    }
    if (form.whatsapp && validatePhone(form.whatsapp)) {
      contactMethods.push({
        method: 'whatsapp',
        number: form.whatsapp.trim(),
      });
    }

    const payload = {
      type: 'general',
      locationMode: form.locationMode,
      location: locationLabel,
      city: cityDb,
      country: countryDb,
      availableUntil: form.availableUntil,
      note: form.note,

      extra: {
        donationType: form.donationType,
        category: form.category,
        ...(form.donationType === 'financial'
          ? { amount: Number(form.amount) }
          : {}),
      },

      contactMethods,
    };

    try {
      const res = await fetchWithInterceptors(
        '/api/ready-to-donate-general',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (res.ok) {
        setOk('✅ تم تسجيل استعدادك للتبرع العام.');
        setErrors({});
        // إعادة تعيين الحقول
        setForm({
          locationMode: 'mr',
          communeName: '',
          outsideAddress: '',
          outsideCity: '',
          outsideCountry: '',
          donationType: 'financial',
          category: 'financial_aid',
          amount: '',
          availableUntil: '',
          note: '',
          phone: '',
          whatsapp: '',
        });
        setTimeout(() => setShow(false), 1200);
      } else {
        setOk(
          res?.body?.error ||
            res?.body?.message ||
            '❌ تعذّر الإرسال. حاول لاحقًا.',
        );
      }
    } catch (err) {
      console.error(err);
      setOk('❌ تعذّر الإرسال. حاول لاحقًا.');
    }
  };

  // خيارات الفئات (من الميتا إن وُجد، وإلا fallback بسيط)
  const categoryOptions =
    GENERAL_CATEGORY_META
      ? Object.entries(GENERAL_CATEGORY_META)
      : [
          ['financial_aid', 'مساعدة مالية عامة'],
          ['medical_support', 'دعم علاجي/طبي'],
          ['food', 'مواد غذائية'],
          ['clothes_furniture', 'ملابس/أثاث'],
          ['education', 'تعليم'],
          ['other', 'أخرى'],
        ];

  return (
    <>
      {/* كارت فتح المودال */}
      <div
        className="card border-0 shadow-sm p-3 d-flex align-items-center justify-content-between flex-row"
        style={{ borderRadius: 16 }}
      >
        <div>
          <div className="fw-bold fs-5 mb-1">زر التبرّع العام</div>
          <a
            href="#ready-general"
            className="text-decoration-underline"
            onClick={(e) => {
              e.preventDefault();
              setShow(true);
            }}
          >
            سجّل استعدادك للتبرّع الآن
          </a>
        </div>
        <Button className="px-4 py-2" onClick={() => setShow(true)}>
          <i className="fa-regular fa-heart ms-2" /> أنا مستعد للتبرع
        </Button>
      </div>

      {/* المودال الرئيسي */}
      <Modal show={show} onHide={() => setShow(false)} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>استعداد للتبرع العام</Modal.Title>
        </Modal.Header>

        <Form onSubmit={submit}>
          <Modal.Body>
            {ok && (
              <Alert
                variant={ok.startsWith('✅') ? 'success' : 'danger'}
              >
                {ok}
              </Alert>
            )}

            {/* اختيار وضع الموقع */}
            <Form.Group className="mb-3">
              <Form.Label>الموقع</Form.Label>
              <div className="d-flex gap-3 mb-2">
                <Form.Check
                  type="radio"
                  id="loc-mr"
                  label="داخل موريتانيا"
                  name="locationMode"
                  checked={form.locationMode === 'mr'}
                  onChange={() => setField('locationMode', 'mr')}
                />
                <Form.Check
                  type="radio"
                  id="loc-abroad"
                  label="خارج موريتانيا"
                  name="locationMode"
                  checked={form.locationMode === 'abroad'}
                  onChange={() => setField('locationMode', 'abroad')}
                />
                <Form.Check
                  type="radio"
                  id="loc-none"
                  label="لا أرغب في تحديد الموقع الآن"
                  name="locationMode"
                  checked={form.locationMode === 'none'}
                  onChange={() => setField('locationMode', 'none')}
                />
              </div>
            </Form.Group>

            {form.locationMode === 'mr' && (
              <Form.Group className="mb-3">
                <Form.Label className="d-flex align-items-center gap-2">
                  <FiMapPin />
                  <span>البلدية داخل موريتانيا *</span>
                </Form.Label>
                <Form.Control
                  list="ready-general-communes-list"
                  name="communeName"
                  value={form.communeName}
                  onChange={onChange}
                  placeholder="اكتب أو اختر اسم البلدية (مثال: عرفات، تيارت، النعمة ...)"
                  isInvalid={!!errors.communeName}
                />
                <datalist id="ready-general-communes-list">
                  {communeOptions.map((c) => (
                    <option key={c.code} value={c.name_ar} />
                  ))}
                </datalist>
                <Form.Control.Feedback type="invalid">
                  {errors.communeName}
                </Form.Control.Feedback>

                {normalize(form.communeName) && selectedCommune && (
                  <div className="mt-2 small">
                    <div>
                      الولاية:{' '}
                      <strong>
                        {getNameAr(selectedWilaya) || '—'}
                      </strong>
                    </div>
                    <div>
                      المقاطعة:{' '}
                      <strong>
                        {getNameAr(selectedMoughataa) || '—'}
                      </strong>
                    </div>
                    <div className="mt-1 text-muted">
                      سيتم حفظ الموقع كالتالي:{' '}
                      <strong>{locationLabel}</strong>
                    </div>
                  </div>
                )}
              </Form.Group>
            )}

            {form.locationMode === 'abroad' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>الدولة *</Form.Label>
                  <Form.Control
                    name="outsideCountry"
                    value={form.outsideCountry}
                    onChange={onChange}
                    isInvalid={!!errors.outsideCountry}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.outsideCountry}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>المدينة *</Form.Label>
                  <Form.Control
                    name="outsideCity"
                    value={form.outsideCity}
                    onChange={onChange}
                    isInvalid={!!errors.outsideCity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.outsideCity}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>العنوان (اختياري)</Form.Label>
                  <Form.Control
                    name="outsideAddress"
                    value={form.outsideAddress}
                    onChange={onChange}
                    placeholder="مثال: شارع، حي، رقم منزل ..."
                  />
                </Form.Group>

                {locationLabel && (
                  <div className="small text-muted mb-2">
                    سيتم حفظ الموقع كالتالي:{' '}
                    <strong>{locationLabel}</strong>
                  </div>
                )}
              </>
            )}

            {/* نوع التبرع */}
            <Form.Group className="mb-3">
              <Form.Label>نوع الاستعداد للتبرع *</Form.Label>
              <Form.Select
                name="donationType"
                value={form.donationType}
                onChange={onChange}
                isInvalid={!!errors.donationType}
              >
                <option value="financial">مساعدة مالية</option>
                <option value="inkind">مساعدة عينية / خدمات</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.donationType}
              </Form.Control.Feedback>
            </Form.Group>

            {/* الفئة */}
            <Form.Group className="mb-3">
              <Form.Label>مجال التبرع *</Form.Label>
              <Form.Select
                name="category"
                value={form.category}
                onChange={onChange}
                isInvalid={!!errors.category}
              >
                {categoryOptions.map(([key, meta]) => {
                  const label = typeof meta === 'string'
                    ? meta
                    : meta?.labelAr || meta?.label || key;
                  return (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.category}
              </Form.Control.Feedback>
            </Form.Group>

            {/* المبلغ المالي إن كان التبرع مالي */}
            {form.donationType === 'financial' && (
              <Form.Group className="mb-3">
                <Form.Label>القيمة التقريبية للمساعدة (اختياري لكن مفضل)</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  step="0.01"
                  name="amount"
                  value={form.amount}
                  onChange={onChange}
                  isInvalid={!!errors.amount}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            {/* التاريخ */}
            <Form.Group className="mb-3">
              <Form.Label>صالح حتى تاريخ *</Form.Label>
              <Form.Control
                type="date"
                name="availableUntil"
                value={form.availableUntil}
                onChange={onChange}
                isInvalid={!!errors.availableUntil}
              />
              <Form.Control.Feedback type="invalid">
                {errors.availableUntil}
              </Form.Control.Feedback>
            </Form.Group>

            {/* وسائل التواصل */}
            <Form.Group className="mb-3">
              <Form.Label>
                <span className="d-inline-flex align-items-center gap-2">
                  <FiPhone /> هاتف للتواصل
                </span>
              </Form.Label>
              <Form.Control
                name="phone"
                value={form.phone}
                onChange={onChange}
                isInvalid={!!errors.phone}
                placeholder="مثال: 00223999 أو 28900000"
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                <span className="d-inline-flex align-items-center gap-2">
                  <FaWhatsapp /> واتساب
                </span>
              </Form.Label>
              <Form.Control
                name="whatsapp"
                value={form.whatsapp}
                onChange={onChange}
                isInvalid={!!errors.whatsapp}
                placeholder="مثال: 32000000"
              />
              <Form.Control.Feedback type="invalid">
                {errors.whatsapp}
              </Form.Control.Feedback>
            </Form.Group>

            {errors.contact && (
              <div className="text-danger small mb-2">
                {errors.contact}
              </div>
            )}

            {/* ملاحظة */}
            <Form.Group>
              <Form.Label>ملاحظة (اختياري)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="note"
                value={form.note}
                onChange={onChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              إلغاء
            </Button>
            <Button type="submit" variant="success">
              <FaCheck className="ms-1" />
              تأكيد التسجيل
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

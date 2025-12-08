// src/pages/ReadyToDonateBloodDetails.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Card,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
} from 'react-bootstrap';
import {
  FiDroplet,
  FiMapPin,
  FiCalendar,
  FiPhone,
  FiMessageCircle,
  FiArrowRight,
} from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
// import './ReadyBloodDetails.css';

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

const ReadyToDonateBloodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // إيقاف / تفعيل النشر
  const [stopAlert, setStopAlert] = useState(null);
  const [showStopBox, setShowStopBox] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [stopLoading, setStopLoading] = useState(false);

  // المستخدم الحالي من localStorage
  const me = useMemo(
    () => JSON.parse(localStorage.getItem('user') || '{}'),
    [],
  );

  // تحميل التفاصيل
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetchWithInterceptors(`/api/ready-to-donate/${id}`);
        const data = res?.body?.data || res?.body || res?.data;
        setOffer(data || null);
      } catch (e) {
        console.error('ready blood details error:', e);
        setError(
          e?.body?.message ||
            e?.message ||
            'تعذر تحميل تفاصيل عرض الاستعداد للتبرع بالدم.',
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // وسائل التواصل
  const contactPhone = useMemo(
    () =>
      (offer?.contactMethods || []).find((m) => m.method === 'phone')
        ?.number || '',
    [offer],
  );

  const contactWhatsapp = useMemo(
    () =>
      (offer?.contactMethods || []).find((m) => m.method === 'whatsapp')
        ?.number || '',
    [offer],
  );

  // حالة العرض وملّاكه
  const status = offer?.status || 'active';
  const createdBy = offer?.createdBy || {};
  const isOwner =
    createdBy &&
    String(createdBy._id || createdBy) === String(me._id || me.id || '');

  const isStillValid = useMemo(() => {
    if (!offer) return false;
    if (status !== 'active') return false;
    if (!offer.availableUntil) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(offer.availableUntil);
    return !Number.isNaN(end.getTime()) && end >= today;
  }, [offer, status]);

  const closedReason = offer?.closedReason || '';
  const closedAt = offer?.closedAt ? new Date(offer.closedAt) : null;

  // إيقاف / تفعيل النشر
  const handleStopPublish = async (ev) => {
    if (ev) ev.preventDefault();

    const willPause = status === 'active';

    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      willPause
        ? 'هل أنت متأكد من رغبتك في إيقاف نشر هذا العرض؟ لن يظهر في القوائم العامة.'
        : 'هل تريد إعادة تفعيل هذا العرض ليظهر من جديد في القوائم؟',
    );
    if (!ok) return;

    try {
      setStopLoading(true);
      setStopAlert(null);

      const res = await fetchWithInterceptors(
        `/api/ready-to-donate/${id}/stop`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: stopReason }),
        },
      );

      if (res.ok) {
        const updated = res.body?.data || res.body || res.data || null;
        if (updated) setOffer(updated);

        setStopAlert({
          type: 'success',
          text: willPause
            ? 'تم إيقاف نشر هذا العرض بنجاح.'
            : 'تمت إعادة تفعيل هذا العرض.',
        });
        setShowStopBox(false);
      } else {
        setStopAlert({
          type: 'danger',
          text:
            res.body?.message ||
            'تعذر تحديث حالة العرض، حاول لاحقًا.',
        });
      }
    } catch (err) {
      console.error('stop ready blood error:', err);
      setStopAlert({
        type: 'danger',
        text: 'حدث خطأ أثناء تحديث حالة العرض.',
      });
    } finally {
      setStopLoading(false);
    }
  };

  // ======= الـ UI =======

  if (loading) {
    return (
      <Container className="ready-blood-details-page py-5" dir="rtl">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">جاري تحميل تفاصيل عرض الاستعداد...</p>
        </div>
      </Container>
    );
  }

  if (error || !offer) {
    return (
      <Container className="ready-blood-details-page py-5" dir="rtl">
        <Card className="rgd-error-card">
          <Card.Body className="text-center">
            <Alert variant="danger" className="mb-4">
              {error || 'العرض غير موجود.'}
            </Alert>
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
            >
              <FiArrowRight className="ms-1" />
              رجوع
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="ready-blood-details-page py-5" dir="rtl">
      <Card className="rgd-card">
        <div className="rgd-card-header d-flex justify-content-between align-items-center">
          <h2 className="rgd-title">عرض استعداد التبرع بالدم</h2>
          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            <FiArrowRight className="ms-1" />
            رجوع
          </Button>
        </div>

        <Card.Body>
          {/* تنبيهات حالة العرض */}
          {status !== 'active' && (
            <Alert variant="warning" className="mb-3 small">
              هذا العرض موقوف حاليًا ولن يظهر في قائمة المتبرعين.
              {closedReason && (
                <>
                  <br />
                  <strong>سبب الإيقاف:</strong> {closedReason}
                </>
              )}
              {closedAt && (
                <div className="mt-1 text-muted">
                  تم الإيقاف بتاريخ:{' '}
                  {closedAt.toLocaleString('ar-MA')}
                </div>
              )}
            </Alert>
          )}

          {stopAlert && (
            <Alert
              variant={stopAlert.type}
              className="mb-3 small"
              onClose={() => setStopAlert(null)}
              dismissible
            >
              {stopAlert.text}
            </Alert>
          )}

          {/* ملخص سريع */}
          <Row className="rgd-summary-row mt-2 g-3">
            <Col xs={12} md={4}>
              <div className="rgd-summary-box">
                <div className="rgd-summary-icon">
                  <FiMapPin />
                </div>
                <div className="rgd-summary-label">الموقع</div>
                <div className="rgd-summary-value">
                  {offer.location || '—'}
                </div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="rgd-summary-box">
                <div className="rgd-summary-icon">
                  <FiDroplet />
                </div>
                <div className="rgd-summary-label">فصيلة الدم</div>
                <div className="rgd-summary-value">
                  {offer.bloodType || '—'}
                </div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="rgd-summary-box">
                <div className="rgd-summary-icon">
                  <FiCalendar />
                </div>
                <div className="rgd-summary-label">متاح حتى</div>
                <div className="rgd-summary-value">
                  {offer.availableUntil
                    ? formatDate(offer.availableUntil)
                    : 'بدون تاريخ انتهاء'}
                </div>
              </div>
            </Col>
          </Row>

          {/* حالة العرض حسب التاريخ */}
          <div
            className={`rgd-status-box mt-4 ${
              isStillValid ? 'active' : 'expired'
            }`}
          >
            {isStillValid
              ? 'هذا العرض ساري المفعول إلى تاريخ الانتهاء.'
              : 'انتهت مدة هذا العرض أو تم إيقافه.'}
          </div>

          {/* تفاصيل إضافية */}
          {offer.note && (
            <section className="rgd-section mt-4">
              <h5 className="rgd-section-title">
                تفاصيل العرض
              </h5>
              <p className="rgd-section-text">{offer.note}</p>
            </section>
          )}

          {/* إدارة حالة العرض لصاحب الإعلان */}
          {isOwner && (
            <section className="rgd-section mt-4">
              <h5 className="rgd-section-title">
                إدارة حالة العرض
              </h5>

              {status === 'active' ? (
                <>
                  <p className="small text-muted mb-2">
                    يمكنك إيقاف نشر هذا العرض في أي وقت، وسيتم
                    نقله إلى العروض غير النشطة.
                  </p>

                  {!showStopBox && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowStopBox(true)}
                    >
                      ⛔ إيقاف نشر العرض
                    </Button>
                  )}

                  {showStopBox && (
                    <form
                      onSubmit={handleStopPublish}
                      className="mt-3"
                    >
                      <div className="mb-2">
                        <label className="small fw-bold">
                          سبب إيقاف العرض (اختياري)
                        </label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={stopReason}
                          onChange={(e) =>
                            setStopReason(e.target.value)
                          }
                          placeholder="مثال: تم التبرع بالفعل، أو تعذر الحضور..."
                        />
                      </div>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <Button
                          type="submit"
                          variant="danger"
                          size="sm"
                          disabled={stopLoading}
                        >
                          {stopLoading
                            ? 'جارٍ الإيقاف...'
                            : 'تأكيد إيقاف العرض'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            setShowStopBox(false);
                            setStopReason('');
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <p className="small text-muted mb-1">
                    هذا العرض موقوف حاليًا.
                  </p>
                  <Button
                    variant="outline-success"
                    size="sm"
                    disabled={stopLoading}
                    onClick={handleStopPublish}
                  >
                    {stopLoading
                      ? 'جارٍ التفعيل...'
                      : 'إعادة تفعيل العرض'}
                  </Button>
                </>
              )}
            </section>
          )}

          {/* التواصل */}
          <section className="rgd-section mt-4">
            <h5 className="rgd-section-title">
              التواصل مع المتبرع
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {/* محادثة داخلية لاحقًا إذا أردت */}
              {/* <Button variant="outline-success">
                <FiMessageCircle className="ms-1" />
                <Link
                  to={`/chat/${offer._id}`}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  محادثة عبر النظام
                </Link>
              </Button> */}

              {contactWhatsapp && (
                <Button
                  variant="success"
                  as="a"
                  href={`https://wa.me/${contactWhatsapp.replace(
                    /[^\d]/g,
                    '',
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiMessageCircle className="ms-1" />
                  واتساب
                </Button>
              )}

              {contactPhone && (
                <Button
                  variant="outline-success"
                  as="a"
                  href={`tel:${contactPhone}`}
                >
                  <FiPhone className="ms-1" />
                  اتصال هاتفي
                </Button>
              )}

              {!contactPhone && !contactWhatsapp && (
                <span className="text-muted">
                  لم يحدّد صاحب العرض أي وسيلة تواصل.
                </span>
              )}
            </div>
          </section>

          {/* فوتر */}
          <div className="rgd-footer mt-4 d-flex flex-wrap gap-2">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(-1)}
            >
              <FiArrowRight className="ms-1" />
              رجوع
            </Button>
            <Link
              to="/blood-donors"
              className="btn go-to-list-btn"
            >
              الذهاب إلى قائمة المتبرعين بالدم
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReadyToDonateBloodDetails;

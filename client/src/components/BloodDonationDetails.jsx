import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  Card,
  Spinner,
  Table,
  Alert,
  Form,
  Modal,
} from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { assetUrl } from '../utils/urls';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import useTicker from '../hooks/useTicker';
import { formatRemaining } from '../utils/time';

import './BloodDonationDetails.css';

/* ============ أدوات مساعدة بسيطة ============ */

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** نجوم تقييم بسيطة */
function RatingStars({ value = 0, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const score = hover || value;

  return (
    <div
      role="radiogroup"
      aria-label="التقييم"
      dir="ltr"
      style={{ display: 'inline-flex', gap: 6 }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={score === n}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange?.(n)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: 22,
            lineHeight: 1,
            color: score >= n ? '#FFC107' : '#E0E0E0',
          }}
          title={`${n} / 5`}
          aria-label={`${n} من 5`}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
}

RatingStars.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

/* حالة عرض التبرع */
const statusLabel = (s) =>
  ({
    pending: 'قيد الاستلام',
    accepted: 'تم القبول',
    fulfilled: 'تم التنفيذ',
    rated: 'تم التقييم',
  }[s] || 'قيد الاستلام');

const statusVariant = (s) =>
  ({
    pending: 'warning',
    accepted: 'info',
    fulfilled: 'primary',
    rated: 'secondary',
  }[s] || 'warning');

/* صورة البروفايل */
function resolveAvatar(src) {
  if (!src) return '/default-avatar.png';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/uploads/')) return assetUrl(src);
  return assetUrl(`/uploads/profileImages/${src}`);
}

/* تنظيف الـ path */
const toForward = (s) => String(s || '').replace(/\\/g, '/');

/* كشف PDF */
function isPdfDoc(d) {
  const bag = [d?.mime, d?.mimetype, d?.url, d?.path, d?.name]
    .filter(Boolean)
    .map(String)
    .join(' ')
    .toLowerCase();

  return bag.includes('application/pdf') || /\.pdf($|\?)/i.test(bag);
}

/* تطبيع وثائق الطلب */
function normalizeDocuments(req) {
  const buckets = [
    ...(Array.isArray(req?.documents) ? req.documents : []),
    ...(Array.isArray(req?.proofDocuments) ? req.proofDocuments : []),
    ...(Array.isArray(req?.attachments) ? req.attachments : []),
    ...(Array.isArray(req?.files) ? req.files : []),
  ];

  return buckets
    .map((d) => {
      const raw = toForward(
        typeof d === 'string' ? d : d.path || d.url || d.src || '',
      );
      if (!raw) return null;

      const url = assetUrl(raw);
      const name = (typeof d === 'string' ? d : d.name || raw)
        .split('/')
        .pop() || 'document';

      const mime =
        typeof d === 'string'
          ? /\.pdf($|\?)/i.test(d)
            ? 'application/pdf'
            : ''
          : d.mime ||
            d.mimetype ||
            (/\.pdf($|\?)/i.test(raw) ? 'application/pdf' : '');

      return {
        url,
        path: raw,
        name,
        mime,
      };
    })
    .filter(Boolean);
}

/* تطبيع وثائق عرض المتبرّع */
function normalizeOfferDocuments(ofr) {
  if (!ofr) return [];
  const buckets = [
    ...(Array.isArray(ofr?.files) ? ofr.files : []),
    ...(Array.isArray(ofr?.proofFiles) ? ofr.proofFiles : []),
    ...(Array.isArray(ofr?.documents) ? ofr.documents : []),
    ...(Array.isArray(ofr?.attachments) ? ofr.attachments : []),
  ];

  return buckets
    .map((d) => {
      const rawPath = toForward(
        typeof d === 'string' ? d : d.path || d.url || d.src || '',
      );
      if (!rawPath) return null;

      const url = assetUrl(rawPath);
      const name =
        (typeof d === 'string'
          ? d
          : d.name || d.originalName || rawPath
        )
          .split('/')
          .pop() || 'document';

      const mime =
        typeof d === 'string'
          ? /\.pdf($|\?)/i.test(rawPath)
            ? 'application/pdf'
            : ''
          : d.mime ||
            d.mimetype ||
            (/\.pdf($|\?)/i.test(rawPath) ? 'application/pdf' : '');

      return { url, path: rawPath, name, mime };
    })
    .filter(Boolean);
}

/* وسائل تواصل مرتبطة بالطلب نفسه */
function normalizeRequestContacts(req) {
  const fromReq = Array.isArray(req?.contactMethods) ? req.contactMethods : [];

  return fromReq
    .filter((it) => it?.method && it?.number)
    .map((it) => ({
      method: it.method,
      label: it.method === 'whatsapp' ? 'واتساب' : 'الهاتف',
      icon: it.method === 'whatsapp' ? '🟢' : '📞',
      value: it.number,
    }));
}

/* وسائل تواصل لشخص */
function personContacts(person) {
  const out = [];
  if (person?.phoneNumber) {
    out.push({
      icon: '📱',
      label: 'الهاتف',
      value: person.phoneNumber,
    });
  }
  if (person?.email) {
    out.push({
      icon: '✉️',
      label: 'البريد',
      value: person.email,
    });
  }
  return out;
}

/* ============ المكوّن الرئيسي ============ */

export default function BloodDonationDetails() {
  const { id } = useParams();
  const q = useQuery();
  const defaultTab = q.get('tab') || 'offers';

  const [tab, setTab] = useState(defaultTab);
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const [msg, setMsg] = useState('');
  const [proposedTime, setProposedTime] = useState('');

  // 🔹 حالة مودال التقييم (لصاحب الطلب)
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateOffer, setRateOffer] = useState(null);
  const [rateValue, setRateValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  // 🔹 توسيع/إخفاء تفاصيل عرض معيّن
  const [expandedOfferId, setExpandedOfferId] = useState(null);

  // 🔹 إظهار/إخفاء صندوق التبرع داخل نفس الكارت
  const [showDonateBox, setShowDonateBox] = useState(false);

  // 🔹 إيقاف نشر الطلب
  const [showStopBox, setShowStopBox] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [stopLoading, setStopLoading] = useState(false);
  const [stopAlert, setStopAlert] = useState(null);

  const now = useTicker(1000);
  const navigate = useNavigate();
  const me = useMemo(
    () => JSON.parse(localStorage.getItem('user') || '{}'),
    [],
  );

  /* ---------- جلب البيانات من الـ API ---------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, offRes] = await Promise.all([
        fetchWithInterceptors(`/api/blood-requests/${id}`),
        fetchWithInterceptors(`/api/donation-confirmations/request/${id}`),
      ]);

      if (reqRes.ok) {
        setRequest(reqRes.body?.data || reqRes.body || null);
      }

      if (offRes.ok) {
        const list = Array.isArray(offRes.body)
          ? offRes.body
          : offRes.body?.data || [];
        setOffers(list);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Load details error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------- معلومات الناشر / صاحب الطلب ---------- */

  const requester =
    request?.requester ||
    request?.beneficiary ||
    request?.userId ||
    request?.user ||
    {};

  const publisher =
    request?.publisher || request?.publishedBy || request?.createdBy || requester;

  const requesterName =
    [requester.firstName, requester.lastName].filter(Boolean).join(' ') || '—';

  const publisherName =
    [publisher.firstName, publisher.lastName].filter(Boolean).join(' ') || '—';

  const requesterAvatar = resolveAvatar(requester.profileImage);
  const publisherAvatar = resolveAvatar(publisher.profileImage);

  const isOwner =
    requester && String(requester._id || requester) === String(me._id);

  const amPublisher =
    publisher && String(publisher._id || publisher) === String(me._id);

  const isSelfContext = isOwner || amPublisher;

  const twoDifferent =
    requester?._id &&
    publisher?._id &&
    String(requester._id) !== String(publisher._id);

  /* عرض تبرعي أنا إن وجد */
  const myOffer = useMemo(() => {
    const uid = String(me?._id || '');
    return (
      (offers || []).find((o) => String(o?.donor?._id || o?.donor) === uid) ||
      null
    );
  }, [offers, me]);

  // إذا لديّ عرض سابق افتح الصندوق تلقائيًا
  useEffect(() => {
    if (myOffer) setShowDonateBox(true);
  }, [myOffer]);

  /* هل الطلب منتهي المهلة؟ */
  const isExpired = (deadline) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return false;
    return d < new Date();
  };

  /* شريط المدة المتبقية (نسبة مئوية) */
  const deadlineProgress = useMemo(() => {
    if (!request?.deadline || !request?.createdAt) return null;

    const start = new Date(request.createdAt).getTime();
    const end = new Date(request.deadline).getTime();

    let nowTs;
    if (now instanceof Date) {
      nowTs = now.getTime();
    } else if (typeof now === 'number') {
      nowTs = now;
    } else {
      const d = new Date(now);
      nowTs = Number.isNaN(d.getTime()) ? Date.now() : d.getTime();
    }

    if (Number.isNaN(start) || Number.isNaN(end) || start >= end) {
      return null;
    }

    const remainingRatio = (end - nowTs) / (end - start);
    const clamped = Math.max(0, Math.min(1, remainingRatio));
    return Math.round(clamped * 100);
  }, [request?.createdAt, request?.deadline, now]);

  /* ---------- إرجاعات مبكرة ---------- */

  if (loading) {
    return (
      <div className="blood-details-container" dir="rtl">
        <div className="text-center mt-5">
          <Spinner animation="border" />
          <div className="mt-2 small text-muted">جارٍ تحميل تفاصيل الطلب…</div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="blood-details-container" dir="rtl">
        <p className="text-center">لم يتم العثور على الطلب.</p>
      </div>
    );
  }

  /* ---------- بيانات مشتقة لا تحتاج Hooks ---------- */

  const isActive = request.isActive !== false;
  const closedReason = request.closedReason || '';
  const closedAt = request.closedAt ? new Date(request.closedAt) : null;

  const documents = normalizeDocuments(request);
  const reqContacts = normalizeRequestContacts(request);
  const publisherContacts = personContacts(publisher);
  const requesterContacts = personContacts(requester);

  /* ---------- Handlers ---------- */

  // ✅ صاحب الطلب: قبول عرض (status: pending → accepted)
  const handleAccept = async (offerId) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${offerId}/accept`,
        { method: 'PATCH' },
      );
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('accept failed', e);
    }
  };

  // ✅ تأكيد التنفيذ (بعد الاتفاق بين الطرفين)
  const handleFulfill = async (offerId) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${offerId}/fulfill`,
        { method: 'PATCH' },
      );
      if (res.ok) fetchData();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('fulfill failed', e);
    }
  };

  const handleRate = async (offerId, score) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${offerId}/rate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: score }),
        },
      );
      if (res.ok) fetchData();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('rate failed', e);
    }
  };

  // فتح مودال التقييم لصاحب الطلب
  const openRateModal = (offer) => {
    setRateOffer(offer);
    setRateValue(offer.ratingByRecipient || 0);
    setShowRateModal(true);
  };

  const closeRateModal = () => {
    setShowRateModal(false);
    setRateOffer(null);
    setRateValue(0);
  };

  const submitRating = async () => {
    if (!rateOffer || !rateValue) {
      // eslint-disable-next-line no-alert
      window.alert('الرجاء اختيار تقييم من 1 إلى 5 نجوم.');
      return;
    }
    setRatingLoading(true);
    try {
      await handleRate(rateOffer._id, rateValue);
      closeRateModal();
    } finally {
      setRatingLoading(false);
    }
  };

  const handleCancelMine = async () => {
    if (!myOffer) return;
    // eslint-disable-next-line no-alert
    if (!window.confirm('هل تريد إلغاء إعلان تبرعك؟')) return;

    try {
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${myOffer._id}`,
        { method: 'DELETE' },
      );
      if (res.ok) fetchData();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('cancel failed', e);
    }
  };

  const submitDonation = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateMsg(null);

      const res = await fetchWithInterceptors('/api/donation-confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          message: msg,
          proposedTime: proposedTime || undefined,
          method: 'chat',
        }),
      });

      if (res.ok) {
        setCreateMsg({
          type: 'success',
          text: res.body?.already
            ? 'لديك إعلان سابق لهذا الطلب.'
            : 'تم إرسال إعلان تبرعك، شكرًا لك ❤️',
        });
        setMsg('');
        setProposedTime('');
        fetchData();
      } else {
        setCreateMsg({
          type: 'danger',
          text: res.body?.message || 'تعذّر الإرسال',
        });
      }
    } catch (err) {
      setCreateMsg({
        type: 'danger',
        text: 'تعذّر الإرسال',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: 'طلب تبرع بالدم',
          text: 'ساعد في إنقاذ حياة بالتبرع بالدم 💚',
          url,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const handleReport = () => {
    // eslint-disable-next-line no-alert
    window.alert('سيتم إضافة نظام تبليغ متكامل لاحقًا، شكرًا لتنبيهك 🙏');
  };

  const toggleOfferDetails = (offerId) => {
    setExpandedOfferId((prev) => (prev === offerId ? null : offerId));
  };

  // ✅ إيقاف نشر الطلب من طرف صاحبه
  const handleStopPublish = async (e) => {
    if (e) e.preventDefault();

    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      'هل أنت متأكد من رغبتك في إيقاف نشر هذا الطلب؟ سيتم نقله إلى قائمة الطلبات غير النشطة.'
    );
    if (!ok) return;

    try {
      setStopLoading(true);
      setStopAlert(null);

      const res = await fetchWithInterceptors(`/api/blood-requests/${id}/stop`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: stopReason }),
      });

      if (res.ok) {
        const updated = res.body?.data || res.body || null;
        if (updated) setRequest(updated);

        setStopAlert({
          type: 'success',
          text: 'تم إيقاف نشر هذا الطلب، وسيُنقل إلى قائمة الطلبات غير النشطة.',
        });
        setShowStopBox(false);
      } else {
        setStopAlert({
          type: 'danger',
          text: res.body?.message || 'تعذّر إيقاف نشر الطلب.',
        });
      }
    } catch (err) {
      console.error('stop publish error:', err);
      setStopAlert({
        type: 'danger',
        text: 'حدث خطأ أثناء إيقاف نشر الطلب.',
      });
    } finally {
      setStopLoading(false);
    }
  };

  /* ============ JSX ============ */

  return (
    <div className="blood-details-container" dir="rtl">
      {/* ---------- بطاقة التفاصيل الرئيسية + التفاعل ---------- */}
      <Card className="details-card w-100 mb-3" style={{ maxWidth: 1200 }}>
        <Card.Header className="details-header-compact text-white">
          <div className="details-header-layout">
            <Button
              variant="light"
              size="sm"
              className="back-btn-strong"
              onClick={() => {
                
                  navigate(-1);
                }
              }
            >
              ← رجوع
            </Button>

            <div className="details-header-title">
              <div className="title-line">تفاصيل طلب التبرع بالدم</div>
              <div className="subtitle-line">
                ساعد في إنقاذ حياة بتبرعك الكريم 💚
              </div>
              {!isActive && (
                <div className="mt-2">
                  <Badge bg="secondary">هذا الطلب موقوف عن النشر</Badge>
                </div>
              )}
            </div>

            {request.bloodType && (
              <div className="bloodtype-pill-head">
                <span className="drop-emoji">🩸</span>
                <span>{request.bloodType}</span>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-3">
          {/* تنبيهات حالة الطلب */}
          {!isActive && (
            <Alert variant="warning" className="mb-3 small">
              هذا الطلب تم إيقاف نشره من طرف صاحبه.
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

          {/* ---------- الناشر ---------- */}
          <div className="section-card publisher-section">
            <div className="publisher-strip">
              {!isSelfContext && (
                <img className="pub-avatar" src={publisherAvatar} alt="الناشر" />
              )}

              <div className="pub-text">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="role-chip publisher">الناشر</span>
                  <div className="pub-name">{publisherName}</div>
                  {isSelfContext && (
                    <span className="self-chip">أنت صاحب هذا الطلب</span>
                  )}
                </div>

                {twoDifferent && (
                  <div className="small text-muted">
                    صاحب الطلب: <strong>{requesterName}</strong>
                  </div>
                )}
              </div>

              {!isSelfContext && publisher?._id && (
                <div className="ms-auto d-flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline-light"
                    className="header-mini-btn"
                    onClick={() => navigate(`/chat/${publisher._id}`)}
                  >
                    💬 محادثة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-light"
                    className="header-mini-btn"
                    onClick={() => navigate(`/profile/${publisher._id}`)}
                  >
                    👤 الملف الشخصي
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ---------- تفاصيل الطلب ---------- */}
          <div className="section-card mt-3">
            <div className="dtbl-section-title">تفاصيل الطلب</div>

            <div className="meta-row">
              <span className="chip">
                🩸 الفصيلة: <strong>{request.bloodType || '—'}</strong>
              </span>

              {request.deadline && (
                <span className="chip">
                  📅 آخر أجل:{' '}
                  <strong>
                    {new Date(request.deadline).toLocaleDateString('ar-MA')}
                  </strong>
                </span>
              )}

              {request.location && (
                <span className="chip">
                  <span className="icon">📍</span>
                  الموقع: <strong>{request.location}</strong>
                </span>
              )}

              <span className={`chip ${request.isUrgent ? 'danger' : ''}`}>
                {request.isUrgent ? '🚨 مستعجل' : 'عادي'}
              </span>
            </div>

            {/* شريط المدة المتبقية */}
            {request.deadline && request.createdAt && (
              <div className="deadline-strip">
                <div className="deadline-text">
                  ⏳ المدة المتبقية:{' '}
                  <strong>{formatRemaining(request.deadline, now)}</strong>
                </div>
                {deadlineProgress !== null && (
                  <div className="deadline-progress-bar">
                    <div
                      className="deadline-progress-inner"
                      style={{
                        width: `${deadlineProgress}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {request.description && (
              <div
                className="text-muted small mt-2"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {request.description}
              </div>
            )}

            {request.isUrgent && (
              <div className="urgent-note">
                حالة مستعجلة، مشاركة الطلب قد تُنقذ حياة 🙏
              </div>
            )}
          </div>

          {/* ---------- وسائل التواصل ---------- */}
          {(publisherContacts.length > 0 ||
            reqContacts.length > 0 ||
            requesterContacts.length > 0) && (
            <div className="section-card mt-3">
              <div className="dtbl-section-title">وسائل التواصل</div>

              {publisherContacts.length > 0 && (
                <>
                  <div className="subsection-title">الناشر</div>
                  <div className="contact-row">
                    {publisherContacts.map((c, i) => (
                      <span key={`pub-${i}`} className="contact-chip">
                        {c.icon} {c.label}: {c.value}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {twoDifferent && requesterContacts.length > 0 && (
                <>
                  <div className="subsection-title">صاحب الطلب</div>
                  <div className="contact-row">
                    {requesterContacts.map((c, i) => (
                      <span key={`reqr-${i}`} className="contact-chip">
                        {c.icon} {c.label}: {c.value}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {reqContacts.length > 0 && (
                <>
                  <div className="subsection-title">الخاصة بالطلب</div>
                  <div className="contact-row">
                    {reqContacts.map((c) => (
                      <span
                        key={`${c.method}-${c.value}`}
                        className="contact-chip"
                      >
                        {c.icon} {c.label}: {c.value}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ---------- الوثائق ---------- */}
          {documents.length > 0 && (
            <div className="section-card mt-3">
              <div className="dtbl-section-title">الوثائق الداعمة</div>

              <div className="docs-grid">
                {documents.map((d, i) => {
                  const pdf = isPdfDoc(d);
                  const openInNewTab = (url) =>
                    window.open(url, '_blank', 'noopener,noreferrer');

                  const onTileKey = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openInNewTab(d.url);
                    }
                  };

                  return (
                    <div
                      key={i}
                      className="doc-tile"
                      role="button"
                      tabIndex={0}
                      onClick={() => openInNewTab(d.url)}
                      onKeyDown={onTileKey}
                    >
                      <div className="doc-thumb">
                        {pdf ? (
                          <div className="pdf-thumb">
                            <span className="pdf-emoji">📄</span>
                            <span className="pdf-text">PDF</span>
                          </div>
                        ) : (
                          <img src={d.url} alt={d.name || 'document'} />
                        )}
                      </div>

                      <div className="doc-name" title={d.name}>
                        {d.name || 'ملف'}
                      </div>

                      <div className="doc-actions">
                        <a
                          className="btn btn-sm btn-outline-primary"
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          فتح
                        </a>
                        <a
                          className="btn btn-sm btn-outline-secondary"
                          href={d.url}
                          download
                        >
                          تنزيل
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------- إدارة حالة الطلب (لصاحب الطلب فقط) ---------- */}
          {isOwner && (
            <div className="section-card mt-3">
              <div className="dtbl-section-title">إدارة حالة الطلب</div>

              {isActive ? (
                <>
                  <p className="small text-muted mb-2">
                    يمكنك إيقاف نشر هذا الطلب في أي وقت، وسيتم نقله إلى قائمة الطلبات غير النشطة ولن يظهر للمتبرعين في القوائم العامة.
                  </p>

                  {!showStopBox && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setShowStopBox(true)}
                    >
                      ⛔ إيقاف نشر الطلب
                    </Button>
                  )}

                  {showStopBox && (
                    <Form onSubmit={handleStopPublish} className="mt-3">
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">
                          سبب إيقاف الطلب (اختياري ولكن مُستحسَن)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={stopReason}
                          onChange={(e) => setStopReason(e.target.value)}
                          placeholder="مثال: تم العثور على متبرع، أو تحسّن حالة المريض، أو أي سبب آخر..."
                        />
                      </Form.Group>

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <Button
                          type="submit"
                          variant="danger"
                          size="sm"
                          disabled={stopLoading}
                        >
                          {stopLoading ? 'جارٍ الإيقاف...' : 'تأكيد إيقاف الطلب'}
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
                    </Form>
                  )}
                </>
              ) : (
                <>
                  <p className="small text-muted mb-1">
                    هذا الطلب موقوف حاليًا ولن يظهر في قائمة الطلبات النشطة.
                  </p>
                  {closedReason && (
                    <p className="small mb-1">
                      <strong>سبب الإيقاف:</strong> {closedReason}
                    </p>
                  )}
                  {closedAt && (
                    <p className="small text-muted mb-0">
                      تم الإيقاف بتاريخ: {closedAt.toLocaleString('ar-MA')}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* ---------- التفاعل مع الطلب (للزائر / المتبرع فقط) ---------- */}
          {!isOwner && isActive && (
            <div className="section-card mt-3">
              <div className="dtbl-section-title">التفاعل مع الطلب</div>

              <div className="interact-strip">
                <div className="interact-bubbles">
                  {/* تبرع */}
                  <button
                    type="button"
                    className={`bubble-btn donate-bubble ${
                      showDonateBox ? 'active' : ''
                    }`}
                    onClick={() => setShowDonateBox((v) => !v)}
                    disabled={isExpired(request.deadline)}
                  >
                    <span className="bubble-icon">💚</span>
                    <span className="bubble-label">أريد التبرع</span>
                  </button>

                  {/* محادثة صاحب الطلب */}
                  {requester?._id && (
                    <button
                      type="button"
                      className="bubble-btn"
                      onClick={() => navigate(`/chat/${requester._id}`)}
                    >
                      <span className="bubble-icon">💬</span>
                      <span className="bubble-label">محادثة</span>
                    </button>
                  )}

                  {/* مشاركة */}
                  <button
                    type="button"
                    className="bubble-btn"
                    onClick={handleShare}
                  >
                    <span className="bubble-icon">🔗</span>
                    <span className="bubble-label">مشاركة</span>
                  </button>

                  {/* إبلاغ */}
                  <button
                    type="button"
                    className="bubble-btn danger"
                    onClick={handleReport}
                  >
                    <span className="bubble-icon">🚩</span>
                    <span className="bubble-label">إبلاغ</span>
                  </button>
                </div>

                {showDonateBox && (
                  <div className="donate-inline-box">
                    <div className="donate-inline-header">
                      <div className="donate-inline-title">
                        أريد تأكيد استعدادي للتبرع
                      </div>
                      <div className="donate-inline-sub">
                        خطوة صغيرة منك قد تُنقذ حياة كاملة 💚
                      </div>
                    </div>

                    {createMsg && (
                      <Alert
                        variant={createMsg.type}
                        className="py-2 px-3 small mb-2"
                      >
                        {createMsg.text}
                      </Alert>
                    )}

                    {myOffer ? (
                      <div className="donate-inline-content">
                        <div className="small text-muted mb-2">
                          لقد أعلنت تبرعك لهذا الطلب في{' '}
                          <strong>
                            {myOffer.createdAt
                              ? new Date(myOffer.createdAt).toLocaleString()
                              : '—'}
                          </strong>
                          ، وحالة إعلانك الآن:{' '}
                          <Badge bg={statusVariant(myOffer.status)}>
                            {statusLabel(myOffer.status)}
                          </Badge>
                          .
                        </div>

                        <div className="small text-muted mb-3">
                          {myOffer.status === 'pending' && (
                            <>
                              عرضك في مرحلة <strong>الانتظار</strong>. سيتمكن
                              صاحب الطلب من مراجعة العروض، وعند قبول عرضك ستصلك
                              إشعارات بالتحديث.
                            </>
                          )}
                          {myOffer.status === 'accepted' && (
                            <>
                              تم <strong>قبول عرضك</strong> 🎉. يُفضّل التواصل
                              مع صاحب الطلب لتنسيق موعد ومكان التبرع.
                            </>
                          )}
                          {myOffer.status === 'fulfilled' && (
                            <>
                              تم <strong>تأكيد تنفيذ التبرع</strong>. شكرًا
                              لمساهمتك الكريمة.
                            </>
                          )}
                          {myOffer.status === 'rated' && (
                            <>
                              اكتملت عملية التبرع والتقييم. شكرًا لك على دعمك
                              للمجتمع 🙏.
                            </>
                          )}
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {requester?._id && (
                            <>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  navigate(`/chat/${requester._id}`)
                                }
                              >
                                💬 محادثة صاحب الطلب
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={() =>
                                  navigate(`/profile/${requester._id}`)
                                }
                              >
                                👤 الملف الشخصي
                              </Button>
                            </>
                          )}

                          {myOffer.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={handleCancelMine}
                            >
                              إلغاء الإعلان
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Form
                        onSubmit={submitDonation}
                        className="donate-inline-content"
                      >
                        <Form.Group className="mb-2">
                          <Form.Label className="mb-1">
                            رسالتك (اختياري)
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className="mb-1">
                            وقت مقترح (اختياري)
                          </Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={proposedTime}
                            onChange={(e) => setProposedTime(e.target.value)}
                          />
                        </Form.Group>

                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <Button
                            type="submit"
                            disabled={creating || isExpired(request.deadline)}
                            className="main-donate-btn"
                          >
                            🩸 تأكيد استعدادي للتبرع
                          </Button>

                          {requester?._id && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() =>
                                navigate(`/chat/${requester._id}`)
                              }
                            >
                              💬 محادثة صاحب الطلب
                            </Button>
                          )}
                        </div>
                      </Form>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* ---------- أسفل الصفحة: جدول العروض لصاحب الطلب ---------- */}
      {isOwner && (
        <>
          <div
            className="d-flex flex-column w-100 mb-3"
            style={{ maxWidth: 1200, gap: 8 }}
          >
            <Alert variant="info" className="mb-1 small">
              ➊ عند وصول عروض جديدة، يمكنك <strong>قبول العرض المناسب</strong>{' '}
              أولاً.
              <br />
              ➋ بعد تنفيذ التبرع فعليًا، اضغط على{' '}
              <strong>تأكيد الاستلام</strong> لتسجيل التنفيذ.
              <br />
              ➌ بعد ذلك يمكنك <strong>إضافة تقييم للمتبرع</strong> لتحسين
              موثوقية المنصة.
            </Alert>

            <Button
              variant={tab === 'offers' ? 'success' : 'outline-success'}
              size="sm"
              onClick={() => setTab('offers')}
            >
              🩸 العروض ({offers.length})
            </Button>
          </div>

          <Card
            className="details-card offers-table w-100"
            style={{ maxWidth: 1200 }}
          >
            <Table striped bordered hover responsive className="m-0">
              <thead>
                <tr>
                  <th>المتبرع</th>
                  <th className="col-sm-hide">تاريخ العرض</th>
                  <th>الحالة</th>
                  <th className="actions-col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      لا توجد عروض حتى الآن.
                    </td>
                  </tr>
                )}

                {offers.map((ofr) => {
                  const donor = ofr.donor || {};
                  const donorName =
                    [donor.firstName, donor.lastName].filter(Boolean).join(' ') ||
                    '—';

                  const canManage = !isExpired(request.deadline);
                  const canAccept = canManage && ofr.status === 'pending';
                  const canFulfill = canManage && ofr.status === 'accepted';
                  const canRate =
                    ofr.status === 'fulfilled' || ofr.status === 'rated';

                  const isExpanded = expandedOfferId === ofr._id;
                  const donorDocs = normalizeOfferDocuments(ofr);
                  const donorContacts = personContacts(donor);

                  const createdLabel = ofr.createdAt
                    ? new Date(ofr.createdAt).toLocaleString()
                    : '—';

                  const donorAvatar = resolveAvatar(donor.profileImage);

                  const donorInitials = `${(donor.firstName?.[0] || 'م')
                    .toUpperCase()}${(donor.lastName?.[0] || '').toUpperCase()}`;

                  return (
                    <React.Fragment key={ofr._id}>
                      <tr>
                        <td>{donorName}</td>
                        <td className="col-sm-hide">{createdLabel}</td>
                        <td>
                          <Badge bg={statusVariant(ofr.status)}>
                            {statusLabel(ofr.status)}
                          </Badge>
                        </td>
                        <td className="actions-col">
                          <div className="d-flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={isExpanded ? 'secondary' : 'outline-secondary'}
                              onClick={() => toggleOfferDetails(ofr._id)}
                            >
                              {isExpanded ? 'إخفاء التفاصيل' : 'تفاصيل'}
                            </Button>

                            {donor?._id && (
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => navigate(`/chat/${donor._id}`)}
                              >
                                💬 محادثة
                              </Button>
                            )}

                            {canAccept && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleAccept(ofr._id)}
                              >
                                ✔️ قبول العرض
                              </Button>
                            )}

                            {canFulfill && (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleFulfill(ofr._id)}
                              >
                                ✅ تأكيد الاستلام
                              </Button>
                            )}

                            {canRate && (
                              <div className="d-inline-flex flex-column align-items-start gap-1">
                                {ofr.ratingByRecipient > 0 ? (
                                  <div className="d-inline-flex align-items-center gap-2">
                                    <span className="text-muted small">
                                      تقييمك:
                                    </span>
                                    <RatingStars
                                      value={ofr.ratingByRecipient}
                                      disabled
                                    />
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="p-0 text-decoration-none"
                                      onClick={() => openRateModal(ofr)}
                                    >
                                      تعديل
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => openRateModal(ofr)}
                                  >
                                    ⭐ إضافة تقييم للمتبرع
                                  </Button>
                                )}
                              </div>
                            )}

                            {!canManage && ofr.ratingByRecipient > 0 && (
                              <div className="d-inline-flex align-items-center gap-1">
                                <span className="text-muted small">
                                  تقييمك:
                                </span>
                                <RatingStars
                                  value={ofr.ratingByRecipient}
                                  disabled
                                />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="offer-details-row">
                          <td colSpan={4}>
                            <div className="offer-details-box">
                              <div className="offer-details-header">
                                <div className="d-flex align-items-center gap-3">
                                  {donorAvatar ? (
                                    <img
                                      src={donorAvatar}
                                      alt="المتبرع"
                                      className="pub-avatar"
                                      onError={(e) => {
                                        e.currentTarget.replaceWith(
                                          Object.assign(
                                            document.createElement('div'),
                                            {
                                              className: 'pub-avatar fallback',
                                              textContent: donorInitials,
                                            },
                                          ),
                                        );
                                      }}
                                    />
                                  ) : (
                                    <div className="pub-avatar fallback">
                                      {donorInitials}
                                    </div>
                                  )}

                                  <div>
                                    <div className="fw-bold">{donorName}</div>
                                    <div className="small text-muted">
                                      تاريخ العرض: {createdLabel}
                                    </div>
                                    <div className="small text-muted">
                                      حالة العرض:{' '}
                                      <Badge bg={statusVariant(ofr.status)}>
                                        {statusLabel(ofr.status)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>

                                {donor?._id && (
                                  <div className="d-flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => navigate(`/chat/${donor._id}`)}
                                    >
                                      💬 محادثة
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      onClick={() =>
                                        navigate(`/profile/${donor._id}`)
                                      }
                                    >
                                      👤 الملف الشخصي
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {donorContacts.length > 0 && (
                                <div className="offer-contact-line">
                                  {donorContacts.map((c, idx) => (
                                    <span key={idx} className="contact-chip">
                                      {c.icon} {c.label}: {c.value}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {(ofr.message ||
                                ofr.note ||
                                ofr.comment ||
                                ofr.description) && (
                                <div className="offer-message-box">
                                  <div className="offer-message-label">
                                    رسالة المتبرع
                                  </div>
                                  <div className="offer-message-body">
                                    {ofr.message ||
                                      ofr.note ||
                                      ofr.comment ||
                                      ofr.description}
                                  </div>
                                </div>
                              )}

                              {donorDocs.length > 0 && (
                                <>
                                  <div className="dtbl-section-title mb-1">
                                    مرفقات إثبات التبرع
                                  </div>
                                  <div className="docs-grid mt-2">
                                    {donorDocs.map((d, i) => {
                                      const pdf = isPdfDoc(d);
                                      return (
                                        <div className="doc-tile" key={i}>
                                          <div className="doc-thumb">
                                            {pdf ? (
                                              <div className="pdf-thumb">
                                                <span className="pdf-emoji">
                                                  📄
                                                </span>
                                                <span className="pdf-text">
                                                  PDF
                                                </span>
                                              </div>
                                            ) : (
                                              <img
                                                src={d.url}
                                                alt={d.name || 'document'}
                                              />
                                            )}
                                          </div>
                                          <div
                                            className="doc-name"
                                            title={d.name}
                                          >
                                            {d.name || 'ملف'}
                                          </div>
                                          <div className="doc-actions">
                                            <a
                                              className="btn btn-sm btn-outline-primary"
                                              href={d.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              فتح
                                            </a>
                                            <a
                                              className="btn btn-sm btn-outline-secondary"
                                              href={d.url}
                                              download
                                            >
                                              تنزيل
                                            </a>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}

                              <div className="mt-3 text-end">
                                <Button
                                  size="sm"
                                  variant="outline-secondary"
                                  onClick={() => setExpandedOfferId(null)}
                                >
                                  إغلاق
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        </>
      )}

      {/* 🔹 مودال التقييم لصاحب الطلب */}
      <Modal show={showRateModal} onHide={closeRateModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تقييم المتبرع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rateOffer && (
            <>
              <p className="mb-2">
                كيف تقيّم تجربتك مع هذا المتبرع؟{' '}
                <span className="text-muted small d-block">
                  التقييم يساعد في بناء سمعة موثوقة داخل المنصة.
                </span>
              </p>
              <div className="d-flex flex-column gap-2 align-items-start">
                <RatingStars
                  value={rateValue}
                  onChange={(n) => setRateValue(n)}
                  disabled={ratingLoading}
                />
                {rateValue > 0 && (
                  <span className="small text-muted">
                    اخترت: {rateValue} / 5
                  </span>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeRateModal}
            disabled={ratingLoading}
          >
            إلغاء
          </Button>
          <Button
            variant="success"
            onClick={submitRating}
            disabled={ratingLoading || !rateValue}
          >
            {ratingLoading ? 'جارٍ الحفظ...' : 'حفظ التقييم'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

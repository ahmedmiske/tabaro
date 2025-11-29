// src/components/DonationRequestDetails.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Form,
  InputGroup,
  ProgressBar,
  Table,
} from 'react-bootstrap';
import {
  FaShareAlt,
  FaFlag,
  FaComments,
  FaArrowRight,
  FaPaperclip,
  FaInfoCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaWhatsapp,
  FaShoppingCart,
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from './ChatBox.jsx';
import useTicker from '../hooks/useTicker';
import { useCart } from '../CartContext.jsx';
import './DonationRequestDetails.css';

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

// تحويل بين الأوقية القديمة والجديدة
const toMRU = (v) =>
  v === null || v === undefined || v === '' ? 0 : Number(v) / 10;
const toMRO = (v) =>
  v === null || v === undefined || v === '' ? 0 : Number(v) * 10;

const formatInt = (v) =>
  v === null || v === undefined || v === ''
    ? '-'
    : Math.round(Number(v)).toLocaleString('ar-MA');

const formatMRU = (mroValue) => formatInt(toMRU(mroValue));

const methodLabel = (m) =>
  m === 'phone'
    ? 'الهاتف'
    : m === 'whatsapp'
    ? 'واتساب'
    : m === 'chat'
    ? 'الدردشة'
    : m === 'call'
    ? 'الاتصال'
    : m || '-';

const daysLeft = (deadline, nowMs) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date(nowMs || Date.now());
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
};

const normalizeUrl = (p) => {
  if (!p) return null;
  const s = String(p).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const resolveAvatar = (img) => {
  if (!img) return null;
  const raw = String(img);
  if (/^https?:\/\//i.test(raw)) return raw;
  if (!raw.startsWith('/uploads/')) {
    return `${API_BASE}/uploads/profileImages/${raw}`.replace(
      /([^:]\/)\/+/g,
      '$1',
    );
  }
  return `${API_BASE}${raw}`.replace(/([^:]\/)\/+/g, '$1');
};

const makeDocs = (don) => {
  const out = [];
  const pushDoc = (urlLike, nameLike) => {
    const s = String(urlLike || '').trim();
    if (!s) return;
    const url = normalizeUrl(s);
    const name = nameLike || url.split('/').pop();
    out.push({ url, name, isPdf: /\.pdf($|\?)/i.test(url) });
  };

  (don?.documents || []).forEach((d) =>
    pushDoc(d?.url || d?.path || d, d?.originalName || d?.name),
  );
  (don?.proofDocuments || []).forEach((d) => pushDoc(d?.url || d));
  (don?.attachments || []).forEach((d) => pushDoc(d?.url || d));
  (don?.files || []).forEach((d) => pushDoc(d?.url || d));
  (don?.proofFiles || []).forEach((d) => pushDoc(d?.url || d));
  return out;
};

const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (u?._id) return u._id;
  } catch {}
  try {
    const t =
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('token');
    if (t && t.split('.').length === 3) {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload?.id || payload?._id || payload?.userId || null;
    }
  } catch {}
  return null;
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null') || {};
  } catch {
    return {};
  }
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-MA') : '-';
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('ar-MA') : '-';

function RatingStars({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const score = hover || value || 0;
  return (
    <div dir="ltr" style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          title={`${n}`}
          disabled={disabled}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange?.(n)}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: 20,
            lineHeight: 1,
            color: (hover || value) >= n ? '#FFC107' : '#E0E0E0',
          }}
          aria-label={`Rate ${n}`}
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
RatingStars.defaultProps = { value: 0, onChange: () => {}, disabled: false };

const statusLabel = (s) =>
  ({
    pending: 'قيد الاستلام',
    accepted: 'تم الاستلام',
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

export default function DonationRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems, addToCart, markAsDonated } = useCart();
  const alreadyInCart = useMemo(
    () => (cartItems || []).some((item) => String(item.id) === String(id)),
    [cartItems, id],
  );

  const FALLBACK_LIST_PATH = '/donations/general';

  const backTarget = useMemo(
    () =>
      location.state?.from ||
      sessionStorage.getItem('lastListPath') ||
      FALLBACK_LIST_PATH,
    [location.state],
  );

  const tick = useTicker(1000);
  const now = typeof tick === 'number' ? tick : Date.now();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [requestOffers, setRequestOffers] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myOffersCount, setMyOffersCount] = useState(0);

  const [infoMessage, setInfoMessage] = useState('');
  const [activeSection, setActiveSection] = useState(null);

  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAmount, setConfirmAmount] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');

  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  const [avatarError, setAvatarError] = useState(false);

  const [expandedId, setExpandedId] = useState(null);

  // ⬇️ جديد: إدارة إيقاف النشر
  const [showStopBox, setShowStopBox] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [stopLoading, setStopLoading] = useState(false);
  const [stopAlert, setStopAlert] = useState(null);

  const currentUserId = useMemo(getCurrentUserId, []);
  const currentUser = useMemo(getCurrentUser, []);
  const currentToken = useMemo(
    () =>
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      currentUser?.token ||
      null,
    [currentUser],
  );

  const LS_CONFIRMED_KEY = `dr:${id}:myConfirm`;
  const LS_BANNER_HIDE = `dr:${id}:hideBanner`;
  const [contactForceOpen, setContactForceOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchWithInterceptors(
          `/api/donationRequests/${id}`,
        );
        if (!res.ok)
          throw new Error(
            res.body?.message || `فشل جلب الطلب (${res.status})`,
          );
        const payload = res.body?.data ?? res.body;
        if (isMounted) setReq(payload);
      } catch (e) {
        if (isMounted) setErr(e.message || 'حدث خطأ غير متوقع');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const fetchRequestOffers = useCallback(async () => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-request-confirmations/request/${id}`,
      );
      if (!res.ok) return;
      const items = Array.isArray(res.body)
        ? res.body
        : res.body?.data || [];
      setRequestOffers(items);
    } catch {
      setRequestOffers([]);
    }
  }, [id]);

  const fetchedOfferOnce = useRef(false);
  const fetchMyOffers = useCallback(
    async () => {
      if (!currentUserId) return;
      try {
        const res = await fetchWithInterceptors(
          `/api/donation-request-confirmations/request/${id}`,
        );
        if (!res.ok) return;
        const offers = res.body?.data ?? res.body ?? [];
        const mine = offers
          .filter((o) => {
            const donorId =
              o?.donor?._id || o?.donor || o?.user?._id || o?.user;
            return donorId && String(donorId) === String(currentUserId);
          })
          .sort(
            (a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt),
          );
        setMyOffers(mine);
        setMyOffersCount(mine.length);
      } catch {}
    },
    [id, currentUserId],
  );

  useEffect(() => {
    if (!req || !currentUserId) return;
    const ownerRef = req?.userId ?? req?.user ?? null;
    const ownerId =
      typeof ownerRef === 'object' ? ownerRef?._id : ownerRef;
    const amOwner = Boolean(
      ownerId && String(ownerId) === String(currentUserId),
    );
    if (amOwner) fetchRequestOffers();
  }, [req, currentUserId, fetchRequestOffers]);

  useEffect(() => {
    if (!currentUserId || fetchedOfferOnce.current) return;
    fetchedOfferOnce.current = true;

    const confirmedBefore =
      localStorage.getItem(LS_CONFIRMED_KEY) === '1';
    if (confirmedBefore) {
      setContactForceOpen(true);
      if (localStorage.getItem(LS_BANNER_HIDE) !== '1') {
        setInfoMessage(
          'ℹ️ يمكنك متابعة التواصل مع صاحب الطلب عبر الوسائل الظاهرة.',
        );
      }
    }
    fetchMyOffers();
  }, [
    fetchMyOffers,
    currentUserId,
    LS_CONFIRMED_KEY,
    LS_BANNER_HIDE,
  ]);

  const ownerRef = req?.userId ?? req?.user ?? null;
  const ownerId =
    typeof ownerRef === 'object' ? ownerRef?._id : ownerRef;
  const publisher = typeof ownerRef === 'object' ? ownerRef : null;

  const ownerName = publisher
    ? `${publisher.firstName || ''} ${
        publisher.lastName || ''
      }`.trim() || 'مستخدم'
    : 'مستخدم';

  const ownerJoin = publisher?.createdAt
    ? new Date(publisher.createdAt).toLocaleDateString('ar-MA')
    : null;
  const ownerAvatarUrl = resolveAvatar(publisher?.profileImage);
  const ownerRating =
    typeof (publisher?.averageRating ?? publisher?.rating) ===
    'number'
      ? publisher?.averageRating ?? publisher?.rating
      : null;

  const left = useMemo(
    () => daysLeft(req?.deadline, now),
    [req?.deadline, now],
  );
  const expired = left !== null && left < 0;

  const progressValue = useMemo(() => {
    if (!req?.createdAt || !req?.deadline) return 0;
    const start = new Date(req.createdAt).getTime();
    const end = new Date(req.deadline).getTime();
    if (
      Number.isNaN(start) ||
      Number.isNaN(end) ||
      end <= start
    )
      return 0;
    const ratio = Math.min(
      1,
      Math.max(0, (now - start) / (end - start)),
    );
    return Math.round(ratio * 100);
  }, [req?.createdAt, req?.deadline, now]);

  const isOwner = Boolean(
    ownerId &&
      currentUserId &&
      String(ownerId) === String(currentUserId),
  );
  const recipientId = ownerId || null;

  const conversationId = useMemo(() => {
    if (!recipientId || !currentUserId || !req?._id) return null;
    const pair = [String(currentUserId), String(recipientId)]
      .sort()
      .join(':');
    return `req:${req._id}:${pair}`;
  }, [recipientId, currentUserId, req?._id]);

  const docs = useMemo(() => makeDocs(req || {}), [req]);

  const ownerOffers = useMemo(() => {
    if (Array.isArray(requestOffers) && requestOffers.length)
      return requestOffers;
    if (Array.isArray(req?.confirmations)) return req.confirmations;
    return [];
  }, [requestOffers, req?.confirmations]);

  const toggleRow = (conf) =>
    setExpandedId((prev) =>
      prev === conf._id ? null : conf._id,
    );

  const handleFulfill = async (confId) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-request-confirmations/${confId}/fulfill`,
        { method: 'PATCH' },
      );
      if (res.ok) {
        await fetchRequestOffers();
        setExpandedId(confId);
      }
    } catch {}
  };

  const handleRate = async (confId, score) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-request-confirmations/${confId}/rate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: score }),
        },
      );
      if (res.ok) {
        await Promise.all([
          fetchRequestOffers().catch(() => {}),
          fetchMyOffers().catch(() => {}),
        ]);
        setExpandedId(confId);
      }
    } catch {}
  };

  const toggleSection = (name) => {
    setConfirmSuccess('');
    setReportSuccess('');
    setActiveSection((prev) => (prev === name ? null : name));
  };

  const requireAuth = () => {
    if (currentToken) return true;
    setInfoMessage('⚠️ يلزم تسجيل الدخول قبل تأكيد التبرع.');
    return false;
  };

  const onShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: 'تفاصيل طلب التبرع', url });
      } else {
        await navigator.clipboard.writeText(url);
        setInfoMessage('🔗 تم نسخ رابط الطلب.');
      }
    } catch {}
  };

  const submitConfirmation = async (e) => {
    e.preventDefault();
    if (!requireAuth() || submittingConfirm) return;

    setSubmittingConfirm(true);
    setConfirmSuccess('');
    try {
      const fd = new FormData();
      fd.append('requestId', id);
      if (confirmMsg?.trim())
        fd.append('message', confirmMsg.trim());

      if (confirmAmount !== '')
        fd.append('amount', String(toMRO(confirmAmount)));

      fd.append('method', 'call');
      fd.append('proposedTime', new Date().toISOString());
      (evidenceFiles || []).forEach((f) =>
        fd.append('files', f),
      );

      const res = await fetchWithInterceptors(
        '/api/donation-request-confirmations',
        { method: 'POST', body: fd },
      );
      if (!res.ok)
        throw new Error(
          res.body?.message || 'فشل إرسال تأكيد التبرع',
        );

      // ✅ تعليم الطلب في السلة كـ "تم التبرع"
      markAsDonated(id);

      localStorage.setItem(LS_CONFIRMED_KEY, '1');
      setContactForceOpen(true);
      setConfirmSuccess('✅ شكراً لك، تم إرسال تأكيد التبرع.');

      await fetchMyOffers();
      if (localStorage.getItem(LS_BANNER_HIDE) !== '1') {
        setInfoMessage(
          myOffersCount + 1 > 1
            ? `ℹ️ هذا تبرعك رقم ${myOffersCount + 1} لهذا الطلب. تم إشعار صاحب الطلب.`
            : 'ℹ️ تم إشعار صاحب الطلب. يمكنك التواصل عبر وسائل التواصل الظاهرة.',
        );
      }

      setConfirmMsg('');
      setConfirmAmount('');
      setEvidenceFiles([]);
      setActiveSection(null);
    } catch (e2) {
      // eslint-disable-next-line no-alert
      alert(e2.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    setReportSuccess('');
    try {
      const payload = {
        title: 'بلاغ عن طلب تبرع',
        message: `بلاغ على الطلب ${id}: ${reportReason}`,
        type: 'REPORT',
        targetUser: ownerId || null,
      };
      const res = await fetchWithInterceptors(
        '/api/notifications',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok)
        throw new Error(
          res.body?.message || 'تعذر إرسال البلاغ',
        );
      setReportSuccess('✅ تم إرسال البلاغ للمراجعة.');
      setReportReason('');
    } catch (e2) {
      // eslint-disable-next-line no-alert
      alert(e2.message || 'حدث خطأ أثناء الإبلاغ');
    } finally {
      setSubmittingReport(false);
    }
  };

  // ⬇️ حالة الطلب العام (نشط/موقوف/منتهي...)
  const status = req?.status || 'active';
  const isActive = status === 'active';
  const closedReason = req?.closedReason || '';
  const closedAt = req?.closedAt ? new Date(req.closedAt) : null;

  const handleStopPublish = async (e) => {
    if (e) e.preventDefault();
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      'هل أنت متأكد من رغبتك في إيقاف نشر هذا الطلب؟ سيتم نقله إلى قائمة الطلبات غير النشطة.',
    );
    if (!ok) return;

    try {
      setStopLoading(true);
      setStopAlert(null);

      const res = await fetchWithInterceptors(
        `/api/donationRequests/${id}/stop`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: stopReason }),
        },
      );

      if (res.ok) {
        const updated = res.body?.data || res.body || null;
        if (updated) setReq(updated);

        setStopAlert({
          type: 'success',
          text: 'تم إيقاف نشر هذا الطلب، ولن يظهر في القوائم العامة.',
        });
        setShowStopBox(false);
      } else {
        setStopAlert({
          type: 'danger',
          text: res.body?.message || 'تعذر إيقاف نشر الطلب.',
        });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('stop general request error:', err);
      setStopAlert({
        type: 'danger',
        text: 'حدث خطأ أثناء إيقاف نشر الطلب.',
      });
    } finally {
      setStopLoading(false);
    }
  };

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" />
        <div className="mt-2">جارِ التحميل...</div>
      </div>
    );

  if (err)
    return (
      <div className="container mt-4" dir="rtl">
        <Alert variant="danger" className="text-center">
          {err}
        </Alert>
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            رجوع
          </Button>
        </div>
      </div>
    );

  if (!req)
    return (
      <div className="container mt-4" dir="rtl">
        <Alert variant="warning" className="text-center">
          لم يتم العثور على الطلب.
        </Alert>
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            رجوع
          </Button>
        </div>
      </div>
    );

  return (
    <div className="container-donation-request mt-4" dir="rtl">
      <Card className="shadow-sm details-card">
        <Card.Header className="details-header text-white">
          <div className="d-flex justify-content-between align-items-center">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => {navigate(-1);
              }}
              className="rounded-pill px-3"
              title="رجوع"
            >
              <FaArrowRight className="ms-1" /> رجوع
            </Button>
            <h4 className="mb-0">تفاصيل طلب التبرع</h4>
            <span />
          </div>
        </Card.Header>

        <Card.Body>
          {/* تنبيه حالة الطلب (موقوف / مكتمل / ملغى) */}
          {status !== 'active' && (
            <Alert variant="warning" className="mb-3 small">
              هذا الطلب غير نشط حاليًا ({status === 'paused'
                ? 'موقوف عن النشر'
                : status === 'completed'
                ? 'مكتمل'
                : status === 'cancelled'
                ? 'ملغى'
                : status}
              ).
              {closedReason && (
                <>
                  <br />
                  <strong>سبب الإيقاف:</strong> {closedReason}
                </>
              )}
              {closedAt && (
                <div className="mt-1 text-muted">
                  تم التحديث بتاريخ: {closedAt.toLocaleString('ar-MA')}
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

          {/* الناشر */}
          <div
            className={`publisher-card mb-3 ${
              isOwner ? 'no-avatar' : ''
            }`}
          >
            {!isOwner &&
              (ownerAvatarUrl && !avatarError ? (
                <img
                  className="pub-avatar"
                  src={ownerAvatarUrl}
                  alt="الناشر"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="pub-avatar fallback">
                  {(ownerName?.split(' ')[0]?.[0] || '؟').toUpperCase()}
                  {(ownerName?.split(' ')[1]?.[0] || '').toUpperCase()}
                </div>
              ))}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <div className="pub-name">{ownerName}</div>
                <span className="role-chip publisher">
                  صاحب الطلب
                </span>
                {typeof ownerRating === 'number' && (
                  <span className="text-warning small">
                    {ownerRating.toFixed(1)} ★
                  </span>
                )}
                {!isOwner && publisher?._id && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="ms-2"
                    onClick={() =>
                      navigate(`/profile/${publisher._id}`, {
                        state: { from: backTarget },
                      })
                    }
                  >
                    الملف الشخصي
                  </Button>
                )}
                {isOwner && <Badge bg="info">هذا طلبك</Badge>}
              </div>
              <div className="pub-meta">
                {ownerJoin ? <>عضو منذ: {ownerJoin}</> : '—'}
              </div>
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div className="section-card">
            <div className="dtg-section-title">بيانات الطلب</div>

            <div className="meta-row">
              <span className="chip">{req.category || '-'}</span>
              <span className="chip">{req.type || '-'}</span>
              <span
                className={`chip ${
                  req.isUrgent ? 'danger' : ''
                }`}
              >
                {req.isUrgent ? 'مستعجل' : 'عادي'}
              </span>
              {left !== null && (
                <span
                  className={`chip ${
                    left <= 3 ? 'danger' : ''
                  }`}
                >
                  {left < 0 ? 'منتهي' : `${left} يومًا`}
                </span>
              )}
            </div>

            {req?.deadline && req?.createdAt && (
              <div className="mt-2">
                <ProgressBar
                  now={progressValue}
                  label={`${progressValue}%`}
                  variant="success"
                  striped
                  animated
                />
              </div>
            )}

            <div className="meta-row mt-2">
              {req.place && (
                <span className="chip">
                  📍 المكان: <strong>{req.place}</strong>
                </span>
              )}
              {'amount' in (req || {}) && (
                <span className="chip">
                  💰 المبلغ المطلوب:{' '}
                  <strong>{formatMRU(req.amount)}</strong>{' '}
                  <small>أوقية جديدة</small>
                </span>
              )}
              {req.deadline && (
                <span className="chip">
                  🗓️ آخر موعد:{' '}
                  <strong>{fmtDate(req.deadline)}</strong>
                </span>
              )}
              {req.createdAt && (
                <span className="chip">
                  📅 تاريخ الإضافة:{' '}
                  <strong>{fmtDate(req.createdAt)}</strong>
                </span>
              )}
            </div>

            {req.description && (
              <div
                className="text-muted small mt-2"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {req.description}
              </div>
            )}

            {(isOwner || myOffers.length > 0 || contactForceOpen) &&
              Array.isArray(req.contactMethods) &&
              req.contactMethods.length > 0 && (
                <>
                  <div className="dtg-section-title mt-3">
                    وسائل التواصل
                  </div>
                  <div className="meta-row">
                    {req.contactMethods.map((c, i) => (
                      <span key={i} className="chip">
                        {methodLabel(c.method)}:{' '}
                        {c.number || '-'}
                      </span>
                    ))}
                  </div>
                </>
              )}

            {Array.isArray(req.paymentMethods) &&
              req.paymentMethods.length > 0 && (
                <>
                  <div className="dtg-section-title mt-3">
                    وسائل الدفع
                  </div>
                  <div className="meta-row">
                    {req.paymentMethods.map((p, i) => (
                      <span key={i} className="chip">
                        {p.method}: {p.phone || '-'}
                      </span>
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* الوثائق */}
          {!!docs.length && (
            <div className="section-card mt-3">
              <div className="dtg-section-title">
                الوثائق الداعمة
              </div>
              <div className="docs-grid">
                {docs.map((d, i) => (
                  <div className="doc-tile" key={i}>
                    <div className="doc-thumb">
                      {d.isPdf ? (
                        <div className="pdf-thumb">
                          <span className="pdf-emoji">📄</span>
                          <span className="pdf-text">PDF</span>
                        </div>
                      ) : (
                        <img
                          src={d.url}
                          alt={d.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.replaceWith(
                              Object.assign(
                                document.createElement('i'),
                                {
                                  className:
                                    'far fa-file generic-icon',
                                },
                              ),
                            );
                          }}
                        />
                      )}
                    </div>
                    <div
                      className="doc-name"
                      title={d.name}
                    >
                      {d.name}
                    </div>
                    <div className="doc-actions">
                      <a
                        className="btn btn-sm btn-outline-primary"
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
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
                ))}
              </div>
            </div>
          )}

          {infoMessage && (
            <Alert
              variant="info"
              className="mt-2 d-flex justify-content-between align-items-center"
            >
              <div>
                <FaInfoCircle className="ms-1" /> {infoMessage}
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setInfoMessage('');
                  localStorage.setItem(LS_BANNER_HIDE, '1');
                }}
              >
                ×
              </Button>
            </Alert>
          )}

          {expired && (
            <Alert variant="warning" className="mt-2">
              انتهت مهلة هذا الطلب.
            </Alert>
          )}

          {/* إدارة حالة الطلب لصاحب الطلب */}
          {isOwner && (
            <div className="section-card mt-3">
              <div className="dtg-section-title">إدارة حالة الطلب</div>

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
                          placeholder="مثال: تم جمع المبلغ المطلوب، تم حل المشكلة، إلخ..."
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
                    هذا الطلب غير نشط حاليًا ولن يظهر في قائمة الطلبات النشطة.
                  </p>
                  {closedReason && (
                    <p className="small mb-1">
                      <strong>سبب الإيقاف:</strong> {closedReason}
                    </p>
                  )}
                  {closedAt && (
                    <p className="small text-muted mb-0">
                      تم التحديث بتاريخ: {closedAt.toLocaleString('ar-MA')}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* المالك: عرض العروض */}
          {isOwner && (
            <div className="section-card mt-3">
              <div className="dtg-section-title">العروض المقدّمة</div>
              <Table
                striped
                bordered
                hover
                responsive
                className="m-0"
              >
                <thead>
                  <tr>
                    <th>المتبرع</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                    <th>المرفقات</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerOffers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-muted"
                      >
                        لا توجد عروض حتى الآن.
                      </td>
                    </tr>
                  )}
                  {ownerOffers.map((c) => {
                    const donor = c?.donor || c?.user || {};
                    const donorName =
                      [donor.firstName, donor.lastName]
                        .filter(Boolean)
                        .join(' ') ||
                      c?.donorName ||
                      '—';
                    const confFiles = Array.isArray(c?.files)
                      ? c.files
                      : c?.proofFiles ||
                        c?.documents ||
                        c?.attachments ||
                        c?.proofDocuments ||
                        [];
                    const isExpanded = expandedId === c._id;
                    return (
                      <React.Fragment key={c._id}>
                        <tr>
                          <td>
                            {donorName}
                            {donor?._id && (
                              <Button
                                size="sm"
                                variant="link"
                                className="p-0 ms-2"
                                onClick={() =>
                                  navigate(
                                    `/profile/${donor._id}`,
                                    {
                                      state: {
                                        from: backTarget,
                                      },
                                    },
                                  )
                                }
                              >
                                الملف الشخصي
                              </Button>
                            )}
                          </td>
                          <td>
                            {c.amount
                              ? formatMRU(c.amount)
                              : '—'}
                          </td>
                          <td>
                            <Badge
                              bg={statusVariant(c.status)}
                            >
                              {statusLabel(c.status)}
                            </Badge>
                          </td>
                          <td>{fmtDateTime(c.createdAt)}</td>
                          <td>
                            {confFiles.length === 0 ? (
                              '—'
                            ) : (
                              <span className="text-nowrap">
                                <FaPaperclip className="ms-1" />{' '}
                                {confFiles.length} ملف
                              </span>
                            )}
                          </td>
                          <td className="text-nowrap">
                            <Button
                              size="sm"
                              variant={isExpanded ? 'secondary' : 'outline-primary'}
                              className="me-2"
                              onClick={() =>
                                toggleRow({ _id: c._id })
                              }
                            >
                              {isExpanded ? 'إغلاق' : 'تفاصيل'}
                            </Button>
                            {donor?._id && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                className="me-2"
                                onClick={() =>
                                  navigate(
                                    `/chat/${donor._id}`,
                                    {
                                      state: {
                                        from: backTarget,
                                      },
                                    },
                                  )
                                }
                              >
                                محادثة
                              </Button>
                            )}
                          </td>
                        </tr>

                        {isExpanded &&
                          (() => {
                            const donorAvatar = resolveAvatar(
                              donor?.profileImage,
                            );
                            const donorRating =
                              typeof (
                                donor?.averageRating ??
                                donor?.rating
                              ) === 'number'
                                ? donor?.averageRating ??
                                  donor?.rating
                                : null;
                            const confFiles2 = Array.isArray(
                              c?.files,
                            )
                              ? c.files
                              : c?.proofFiles ||
                                c?.documents ||
                                c?.attachments ||
                                c?.proofDocuments ||
                                [];
                            const whats =
                              donor?.whatsappNumber ||
                              donor?.phoneWhatsapp;

                            return (
                              <tr className="offer-details-row">
                                <td colSpan={6}>
                                  <div className="offer-details-box">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                      <div className="d-flex align-items-center gap-3 img-donor-box">
                                        {donorAvatar ? (
                                          <img
                                            src={donorAvatar}
                                            alt="المتبرّع"
                                            className="rounded-circle"
                                            width={40}
                                            height={40}
                                            onError={(e) => {
                                              e.currentTarget.replaceWith(
                                                Object.assign(
                                                  document.createElement(
                                                    'div',
                                                  ),
                                                  {
                                                    className:
                                                      'pub-avatar fallback',
                                                    textContent: (
                                                      donor
                                                        ?.firstName?.[0] ||
                                                      'م'
                                                    ).toUpperCase(),
                                                  },
                                                ),
                                              );
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className="pub-avatar fallback"
                                            style={{
                                              width: 50,
                                              height: 50,
                                            }}
                                          >
                                            {(
                                              donor?.firstName?.[0] ||
                                              'م'
                                            ).toUpperCase()}
                                            {(
                                              donor?.lastName?.[0] ||
                                              ''
                                            ).toUpperCase()}
                                          </div>
                                        )}

                                        <div className="flex-grow-1">
                                          <div className="fw-bold d-flex align-items-center gap-2">
                                            {donorName}
                                            {typeof donorRating ===
                                              'number' && (
                                              <span className="text-warning small">
                                                {donorRating.toFixed(
                                                  1,
                                                )}{' '}
                                                ★
                                              </span>
                                            )}
                                          </div>

                                          <div className="offer-contact-line text-muted small mt-1">
                                            {donor?.email && (
                                              <a
                                                href={`mailto:${donor.email}`}
                                                className="contact-pill"
                                              >
                                                <FaEnvelope className="ms-1" />
                                                <span>
                                                  {donor.email}
                                                </span>
                                              </a>
                                            )}
                                            {donor?.phoneNumber && (
                                              <a
                                                href={`tel:${donor.phoneNumber}`}
                                                className="contact-pill"
                                              >
                                                <FaPhoneAlt className="ms-1" />
                                                <span>
                                                  {
                                                    donor.phoneNumber
                                                  }
                                                </span>
                                              </a>
                                            )}
                                            {whats && (
                                              <a
                                                href={`https://wa.me/${whats}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="contact-pill"
                                              >
                                                <FaWhatsapp className="ms-1" />
                                                <span>{whats}</span>
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="d-flex flex-wrap gap-2 mb-3">
                                      {(c.status === 'pending' ||
                                        c.status ===
                                          'accepted') && (
                                        <Button
                                          size="sm"
                                          variant="success"
                                          onClick={() =>
                                            handleFulfill(c._id)
                                          }
                                        >
                                          ✅ تأكيد الاستلام
                                        </Button>
                                      )}
                                      {(c.status ===
                                        'fulfilled' ||
                                        c.status ===
                                          'rated') && (
                                        <div className="d-inline-flex align-items-center gap-2">
                                          <span className="text-muted small">
                                            التقييم:
                                          </span>
                                          <RatingStars
                                            value={
                                              c.ratingByRecipient ||
                                              0
                                            }
                                            onChange={(n) =>
                                              handleRate(
                                                c._id,
                                                n,
                                              )
                                            }
                                            disabled={
                                              !!c.ratingByRecipient
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>

                                    {(c.message ||
                                      c.note ||
                                      c.comment ||
                                      c.description) && (
                                      <div className="donor-message-box mb-3">
                                        <div className="donor-message-label">
                                          رسالة المتبرع
                                        </div>
                                        <div className="donor-message-body">
                                          {c.message ||
                                            c.note ||
                                            c.comment ||
                                            c.description}
                                        </div>
                                      </div>
                                    )}


                                    <div className="mb-0">
                                      <div className="dtg-section-title mb-1">
                                        المرفقات
                                      </div>
                                      {confFiles2.length === 0 ? (
                                        <div className="text-muted small">
                                          لا توجد مرفقات.
                                        </div>
                                      ) : (
                                        <div className="docs-grid mt-2">
                                          {confFiles2.map(
                                            (f, i) => {
                                              const url =
                                                normalizeUrl(
                                                  f?.url ||
                                                    f?.path ||
                                                    f,
                                                );
                                              const isPdf =
                                                /\.pdf($|\?)/i.test(
                                                  url || '',
                                                );
                                              const name =
                                                f?.originalName ||
                                                f?.name ||
                                                (url
                                                  ? url
                                                      .split(
                                                        '/',
                                                      )
                                                      .pop()
                                                  : `file-${
                                                      i + 1
                                                    }`);
                                              return (
                                                <div
                                                  className="doc-tile"
                                                  key={i}
                                                >
                                                  <div className="doc-thumb">
                                                    {isPdf ? (
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
                                                        src={
                                                          url
                                                        }
                                                        alt={
                                                          name
                                                        }
                                                        loading="lazy"
                                                        onError={(
                                                          e,
                                                        ) => {
                                                          e.currentTarget.replaceWith(
                                                            Object.assign(
                                                              document.createElement(
                                                                'i',
                                                              ),
                                                              {
                                                                className:
                                                                  'far fa-file generic-icon',
                                                              },
                                                            ),
                                                          );
                                                        }}
                                                      />
                                                    )}
                                                  </div>
                                                  <div
                                                    className="doc-name"
                                                    title={
                                                      name
                                                    }
                                                  >
                                                    {name}
                                                  </div>
                                                  <div className="doc-actions">
                                                    <a
                                                      className="btn btn-sm btn-outline-primary"
                                                      href={
                                                        url
                                                      }
                                                      target="_blank"
                                                      rel="noreferrer"
                                                    >
                                                      فتح
                                                    </a>
                                                    <a
                                                      className="btn btn-sm btn-outline-secondary"
                                                      href={
                                                        url
                                                      }
                                                      download
                                                    >
                                                      تنزيل
                                                    </a>
                                                  </div>
                                                </div>
                                              );
                                            },
                                          )}
                                        </div>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        onClick={() =>
                                          setExpandedId(null)
                                        }
                                      >
                                        إغلاق
                                      </Button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })()}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* المستخدم العادي (ليس صاحب الطلب) */}
          {!isOwner && isActive && (
            <>
              {/* تبرعاتي السابقة لهذا الطلب */}
              {myOffers.length > 0 && (
                <div className="section-card mt-3">
                  <div className="dtg-section-title">
                    تبرعاتك السابقة لهذا الطلب
                  </div>

                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    className="m-0"
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>المبلغ</th>
                        <th>الحالة</th>
                        <th>تاريخ الإرسال</th>
                        <th>التقييمات</th>
                        <th>المرفقات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOffers.map((offer, idx) => {
                        const confFiles = Array.isArray(
                          offer?.files,
                        )
                          ? offer.files
                          : offer?.proofFiles ||
                            offer?.documents ||
                            offer?.attachments ||
                            offer?.proofDocuments ||
                            [];
                        const hasRecipientRated =
                          !!offer.ratingByRecipient;
                        const hasDonorRated =
                          !!offer.ratingByDonor;
                        return (
                          <tr key={offer._id || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              {offer.amount
                                ? formatMRU(offer.amount)
                                : '—'}
                            </td>
                            <td>
                              <Badge
                                bg={statusVariant(
                                  offer.status,
                                )}
                              >
                                {statusLabel(offer.status)}
                              </Badge>
                            </td>
                            <td>{fmtDateTime(offer.createdAt)}</td>
                            <td className="text-nowrap">
                              {hasDonorRated ? (
                                <>تقييمك: {offer.ratingByDonor}★</>
                              ) : (
                                <span className="text-muted">
                                  —
                                </span>
                              )}{' '}
                              {hasRecipientRated && (
                                <>
                                  • تقييم صاحب الطلب لك:{' '}
                                  {offer.ratingByRecipient}★
                                </>
                              )}
                            </td>
                            <td className="text-nowrap">
                              {confFiles.length === 0 ? (
                                '—'
                              ) : (
                                <span>
                                  <FaPaperclip className="ms-1" />{' '}
                                  {confFiles.length}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                <div className="dtg-section-title m-0">
                  التفاعل مع الطلب
                </div>
              </div>

              {/* شريط الأزرار الدائرية */}
              <div className="action-toolbar mb-3">
                {/* حفظ في السلة */}
                {!expired && (
                  <button
                    type="button"
                    className={`btn-circle btn-light ${
                      alreadyInCart ? 'btn-disabled' : ''
                    }`}
                    title={
                      alreadyInCart
                        ? 'محفوظ في السلة'
                        : 'حفظ الطلب في السلة لاحقاً'
                    }
                    onClick={() => {
                      if (alreadyInCart) return;
                      addToCart({
                        id,
                        kind: 'general',
                        category: req.category,
                        title:
                          req.title || req.type || 'طلب تبرع',
                        type: req.type,
                        place: req.place,
                        deadline: req.deadline,
                        amount:
                          'amount' in (req || {})
                            ? toMRU(req.amount)
                            : null,
                        status: 'pending',
                      });
                      setInfoMessage(
                        '🧺 تم حفظ الطلب في سلة التبرعات.',
                      );
                    }}
                    aria-label="حفظ في السلة"
                    disabled={alreadyInCart}
                  >
                    <FaShoppingCart />
                  </button>
                )}

                {/* تأكيد التبرع */}
                {!expired && (
                  <button
                    type="button"
                    className="btn-circle gr-btn-donate"
                    title="تأكيد التبرع"
                    onClick={() => toggleSection('confirm')}
                    aria-label="تأكيد التبرع"
                    disabled={submittingConfirm}
                  >
                    <span role="img" aria-label="heart">
                      💚
                    </span>
                  </button>
                )}

                {recipientId && (
                  <button
                    type="button"
                    className={`btn-circle ${
                      activeSection === 'chat'
                        ? 'btn-dark'
                        : 'btn-light'
                    }`}
                    title={
                      activeSection === 'chat'
                        ? 'إغلاق المحادثة'
                        : 'محادثة'
                    }
                    onClick={() => toggleSection('chat')}
                    aria-label="محادثة"
                  >
                    <FaComments />
                  </button>
                )}

                <button
                  type="button"
                  className="btn-circle btn-light"
                  title="مشاركة"
                  onClick={() => {
                    toggleSection('share');
                    onShare();
                  }}
                  aria-label="مشاركة"
                >
                  <FaShareAlt />
                </button>

                <button
                  type="button"
                  className="btn-circle btn-light text-danger"
                  title="الإبلاغ"
                  onClick={() => toggleSection('report')}
                  aria-label="الإبلاغ"
                >
                  <FaFlag />
                </button>
              </div>

              {/* تأكيد التبرع */}
              {activeSection === 'confirm' && !expired && (
                <div className="action-panel">
                  <h6 className="fw-bold mb-3">تأكيد التبرع</h6>
                  {confirmSuccess && (
                    <Alert variant="success">
                      {confirmSuccess}
                    </Alert>
                  )}

                  <Form onSubmit={submitConfirmation}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        رسالة لصاحب الطلب (اختياري)
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={confirmMsg}
                        onChange={(e) =>
                          setConfirmMsg(e.target.value)
                        }
                        placeholder="اكتب رسالة قصيرة..."
                      />
                    </Form.Group>

                    {'amount' in (req || {}) && (
                      <Form.Group className="mb-3">
                        <Form.Label>
                          مبلغ التبرع (بالأوقية الجديدة)
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            value={confirmAmount}
                            onChange={(e) =>
                              setConfirmAmount(e.target.value)
                            }
                            placeholder="مثال: 100"
                          />
                          <InputGroup.Text>
                            أوقية جديدة
                          </InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>
                        إرفاق إثبات (صور / PDF)
                      </Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) =>
                          setEvidenceFiles(
                            Array.from(e.target.files || []),
                          )
                        }
                      />
                      {evidenceFiles?.length > 0 && (
                        <div className="text-muted mt-2 small">
                          <FaPaperclip className="ms-1" /> تم
                          اختيار {evidenceFiles.length} ملف:
                          <ul className="mb-0 mt-1">
                            {evidenceFiles.map((f, i) => (
                              <li key={i}>{f.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Form.Group>

                    <Alert
                      variant="light"
                      className="border small"
                    >
                      {myOffersCount > 0
                        ? `هذا تبرعك رقم ${
                            myOffersCount + 1
                          } لهذا الطلب. سنُخطر صاحب الطلب بعد الإرسال.`
                        : 'بعد الإرسال سيتم إشعار صاحب الطلب وتظهر لك وسائل التواصل كاملة.'}
                    </Alert>

                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        variant="success"
                        disabled={submittingConfirm}
                      >
                        {submittingConfirm
                          ? 'جارٍ الإرسال...'
                          : 'إرسال التأكيد'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActiveSection(null)}
                      >
                        إغلاق
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* المحادثة */}
              {activeSection === 'chat' &&
                recipientId &&
                conversationId && (
                  <div className="action-panel">
                    <h6 className="fw-bold mb-1">
                      محادثة مع {ownerName}
                    </h6>
                    <div className="chat-topic">
                      موضوع: {req.category || '—'} —{' '}
                      {req.type || '—'}
                      {req.place ? ` • ${req.place}` : ''}
                    </div>
                    <ChatBox
                      conversationId={conversationId}
                      recipientId={recipientId}
                    />
                    <div className="mt-3">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActiveSection(null)}
                      >
                        إغلاق
                      </Button>
                    </div>
                  </div>
                )}

              {/* الإبلاغ */}
              {activeSection === 'report' && (
                <div className="action-panel">
                  <h6 className="fw-bold mb-3">
                    الإبلاغ عن الطلب
                  </h6>
                  {reportSuccess && (
                    <Alert variant="success">
                      {reportSuccess}
                    </Alert>
                  )}
                  <Form onSubmit={submitReport}>
                    <Form.Group className="mb-3">
                      <Form.Label>سبب الإبلاغ</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={reportReason}
                        onChange={(e) =>
                          setReportReason(e.target.value)
                        }
                        placeholder="اكتب السبب باختصار..."
                        required
                      />
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        variant="danger"
                        disabled={submittingReport}
                      >
                        {submittingReport
                          ? 'جارٍ الإرسال...'
                          : 'إرسال البلاغ'}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setActiveSection(null)}
                      >
                        إغلاق
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

// src/components/DonationRequestDetails.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, ListGroup, Badge, Button, Spinner, Alert, Form, InputGroup
} from 'react-bootstrap';
import {
  FaShareAlt, FaFlag, FaComments, FaArrowRight,
  FaPhoneAlt, FaWhatsapp
} from 'react-icons/fa';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from '../components/ChatBox';
import socket, { connectSocket } from '../socket';
// (إن أردت الإبقاء على DocumentsGallery اتركه، لكننا سنعرض شبكة وثائق محلية أكثر صلابة أدناه)
// import DocumentsGallery from '../components/DocumentsGallery';
import './DonationRequestDetails.css';

const API_ORIGIN = process.env.REACT_APP_API_ORIGIN || 'http://localhost:5000';

/* ========= Helpers ========= */
const formatAmount = (v) => {
  if (v === null || v === undefined || v === '') return '-';
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString('ar-MA');
};
const methodLabel = (m) => (m === 'phone' ? 'الهاتف' : m === 'whatsapp' ? 'واتساب' : m);
const daysLeft = (deadline) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / 86400000);
};
const asTel = (num) => `tel:${num || ''}`;
const asWA  = (num) => `https://wa.me/${String(num || '').replace(/\D/g,'')}`;
const absolutize = (u) => (u ? (/^https?:\/\//i.test(u) ? u : `${API_ORIGIN}${u.startsWith('/') ? u : `/${u}`}`) : null);

const getCurrentUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (u?._id) return u._id;
  } catch {}
  const t =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token');
  if (t && t.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload?.id || payload?._id || payload?.userId || null;
    } catch {}
  }
  return null;
};
const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') || {}; }
  catch { return {}; }
};

/* ========= Component ========= */
const DonationRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // عروض/تأكيدات المستخدم على هذا الطلب
  const [existingOffer, setExistingOffer] = useState(null);

  // رسائل واجهة
  const [infoMessage, setInfoMessage] = useState('');
  const [activeSection, setActiveSection] = useState(null); // 'confirm' | 'share' | 'report' | 'chat' | null

  // تأكيد التبرع
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmAmount, setConfirmAmount] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);   // مرفقات متعددة
  const [submittingConfirm, setSubmittingConfirm] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState('');

  // الإبلاغ
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');

  // المستخدم الحالي
  const currentUserId = useMemo(getCurrentUserId, []);
  const currentUser   = useMemo(getCurrentUser, []);
  const currentToken  = useMemo(
    () => localStorage.getItem('token') || localStorage.getItem('authToken') || currentUser?.token || null,
    [currentUser]
  );

  // مفاتيح تخزين محلي لتنشيط التنبيه وإظهار التواصل بعد أول تأكيد
  const LS_CONFIRMED_KEY = `dr:${id}:myConfirm`;
  const LS_BANNER_HIDE   = `dr:${id}:hideBanner`;

  // تُفتح وسائل التواصل بعد أول تأكيد للمستخدم (في الجلسة الحالية أو لاحقاً)
  const [contactForceOpen, setContactForceOpen] = useState(false);

  /* Socket connect + diagnostics */
  useEffect(() => {
    if (!currentToken) return;
    connectSocket(currentToken);

    const onConnect = () => {};
    const onConnectError = (e) => console.error('[socket] connect_error:', e?.message || e);
    const onError = (payload) => console.error('[socket] error:', payload);

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('error', onError);
    };
  }, [currentToken]);

  /* Fetch request details */
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetchWithInterceptors(`/api/donationRequests/${id}`);
        if (!res.ok) throw new Error(res.body?.message || `فشل جلب الطلب (${res.status})`);
        const payload = res.body?.data ?? res.body;
        if (isMounted) setReq(payload);
      } catch (e) {
        if (isMounted) setErr(e.message || 'حدث خطأ غير متوقع');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [id]);

  /* Check existing confirmation by current user (once) */
  const fetchedOfferOnce = useRef(false);
  const checkExistingOffer = useCallback(async () => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-request-confirmations/by-request/${id}`);
      if (!res.ok) return;
      const offers = res.body?.data ?? res.body ?? [];
      const mine = offers.find(o => {
        const donorId = o?.donor?._id || o?.donor || o?.user?._id || o?.user || null;
        return donorId && String(donorId) === String(currentUserId);
      });
      setExistingOffer(mine || null);
    } catch (e) {
      console.error('[checkExistingOffer] error', e);
    }
  }, [id, currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    if (fetchedOfferOnce.current) return;   // يمنع التكرار في StrictMode
    fetchedOfferOnce.current = true;

    // استرجاع حالة التأكيد السابقة من التخزين المحلي
    const confirmedBefore = localStorage.getItem(LS_CONFIRMED_KEY) === '1';
    if (confirmedBefore) {
      setContactForceOpen(true);
      if (localStorage.getItem(LS_BANNER_HIDE) !== '1') {
        setInfoMessage('ℹ️ لقد تم إشعار صاحب الطلب بتبرعكم، ويمكنكم الآن التواصل عبر الوسائل المتاحة.');
      }
    }

    checkExistingOffer();
  }, [checkExistingOffer, currentUserId, LS_CONFIRMED_KEY, LS_BANNER_HIDE]);

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('ar-MA') : '-');

  /* ---------- Publisher / Owner ---------- */
  const ownerRef = req?.userId ?? req?.user ?? null;
  const ownerId = typeof ownerRef === 'object' ? ownerRef?._id : ownerRef;
  const ownerEmbedded = typeof ownerRef === 'object' ? ownerRef : null;

  const [ownerExtra, setOwnerExtra] = useState(null);
  useEffect(() => {
    setOwnerExtra(null);
    const fetchOwner = async () => {
      if (ownerEmbedded || !ownerId) return;
      const tryFetch = async (path) => {
        try {
          const r = await fetchWithInterceptors(path);
          if (r.ok) return r.body?.data ?? r.body;
        } catch {}
        return null;
      };
      let u = await tryFetch(`/api/users/${ownerId}`);
      if (!u) u = await tryFetch(`/api/users/profile/${ownerId}`);
      if (u) setOwnerExtra(u);
    };
    fetchOwner();
  }, [ownerId, ownerEmbedded]);

  const publisher = ownerEmbedded || ownerExtra;
  const ownerName = publisher
    ? `${publisher.firstName || ''} ${publisher.lastName || ''}`.trim() || 'مستخدم'
    : 'مستخدم';
  const ownerJoin = publisher?.createdAt ? new Date(publisher.createdAt).toLocaleDateString('ar-MA') : null;
  const ownerAvatar = publisher?.profileImage
    ? absolutize(
        publisher.profileImage.startsWith('/uploads')
          ? publisher.profileImage
          : `/uploads/profileImages/${publisher.profileImage}`
      )
    : null;

  /* وثائق الطلب — تصحيح العرض (صور/PDF) */
  const docs = useMemo(() => {
    const arr = Array.isArray(req?.proofDocuments) ? req.proofDocuments : [];
    return arr
      .map((raw) => {
        const url = absolutize(raw);
        if (!url) return null;
        const name = String(url).split('/').pop();
        const isPdf = /\.pdf($|\?)/i.test(url);
        return { url, name, isPdf };
      })
      .filter(Boolean);
  }, [req]);

  /* Derived */
  const left = daysLeft(req?.deadline);
  const isOwner = Boolean(ownerId && currentUserId && String(ownerId) === String(currentUserId));
  const expired = left !== null && left < 0;
  const recipientId = ownerId || null;

  const contactMethods = Array.isArray(req?.contactMethods) ? req.contactMethods : [];
  const paymentMethods = Array.isArray(req?.paymentMethods) ? req?.paymentMethods : [];

  const phone    = contactMethods.find(c => c.method === 'phone')?.number;
  const whatsapp = contactMethods.find(c => c.method === 'whatsapp')?.number;

  const toggleSection = (name) => {
    // لا نحذف رسالة المتبرّع الدائمة من التخزين المحلي
    setConfirmSuccess('');
    setReportSuccess('');
    setActiveSection((prev) => (prev === name ? null : name));
  };

  const requireAuth = () => {
    if (currentToken) return true;
    setInfoMessage('⚠️ تحتاج لتسجيل الدخول لتأكيد التبرع.');
    return false;
  };

  const onShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: 'تفاصيل طلب التبرع', url });
      } else {
        await navigator.clipboard.writeText(url);
        setInfoMessage('🔗 تم نسخ الرابط.');
      }
    } catch {}
  };

  /* ===== Submit confirmation ===== */
  const submitConfirmation = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (submittingConfirm) return;

    // 👇 تنبيه ومنع “تبرّع ثانٍ” لنفس الطلب من نفس الحساب
    if (existingOffer) {
      setInfoMessage('ℹ️ لقد قمت بتأكيد تبرّع سابقًا لهذا الطلب. لا يمكنك إرسال تأكيدٍ آخر.');
      setActiveSection(null);
      return;
    }

    setSubmittingConfirm(true);
    setConfirmSuccess('');

    try {
      const fd = new FormData();
      fd.append('requestId', id);
      if (confirmMsg?.trim()) fd.append('message', confirmMsg.trim());
      if (confirmAmount)      fd.append('amount', String(Number(confirmAmount)));
      fd.append('method', 'call');
      fd.append('proposedTime', new Date().toISOString());
      (evidenceFiles || []).forEach(f => fd.append('files', f)); // نفس اسم الحقل في الراوتر

      const res = await fetchWithInterceptors('/api/donation-request-confirmations', {
        method: 'POST',
        body: fd, // لا تضبط Content-Type يدوياً
      });
      if (!res.ok) throw new Error(res.body?.message || 'تعذر إرسال التأكيد');

      const confirmationId =
        res.body?.data?._id || res.body?._id || res.body?.confirmation?._id || null;

      // Socket notify فقط — السيرفر سينشئ أيضاً إشعارًا للمتبرّع (انظر الكنترولر بالأسفل)
      if (recipientId) {
        const donorName = (currentUser?.firstName || 'متبرّع');
        socket.emit('sendMessage', {
          recipientId,
          content: `💚 ${donorName} أكّد تبرعًا لطلبك — ${req?.category || ''}${req?.type ? ` (${req.type})` : ''}`,
          requestId: id,
          offerId: confirmationId,
          type: 'offer'
        });
      }

      // ثبّت حالة "تبرّعت سابقاً" لفتح وسائل التواصل دائماً وإظهار التنبيه في الزيارات القادمة
      localStorage.setItem(LS_CONFIRMED_KEY, '1');
      setContactForceOpen(true);

      setConfirmSuccess('✅ تم إرسال تأكيد تبرعك. شكرًا لك!');
      if (localStorage.getItem(LS_BANNER_HIDE) !== '1') {
        setInfoMessage('ℹ️ لقد تم إشعار صاحب الطلب بتبرعكم، ويمكنكم الآن التواصل عبر الوسائل المتاحة.');
      }

      setConfirmMsg('');
      setConfirmAmount('');
      setEvidenceFiles([]);
      await checkExistingOffer(); // سيصبح existingOffer موجودًا، وبالتالي سيُمنع التبرع الثاني
      setActiveSection(null);
    } catch (e2) {
      console.error('[submitConfirmation] error:', e2);
      alert(e2.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  /* Submit report */
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
      const res = await fetchWithInterceptors('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(res.body?.message || 'تعذر إرسال البلاغ');
      setReportSuccess('✅ تم إرسال البلاغ وسنراجعه.');
      setReportReason('');
    } catch (e2) {
      console.error('[submitReport] error:', e2);
      alert(e2.message || 'حدث خطأ أثناء الإبلاغ');
    } finally {
      setSubmittingReport(false);
    }
  };

  /* ===== Renders ===== */
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <Spinner animation="border" />
        <div className="mt-2">جارِ التحميل...</div>
      </div>
    );
  }
  if (err) {
    return (
      <div className="container mt-4" dir="rtl">
        <Alert variant="danger" className="text-center">{err}</Alert>
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
        </div>
      </div>
    );
  }
  if (!req) {
    return (
      <div className="container mt-4" dir="rtl">
        <Alert variant="warning" className="text-center">لم يتم العثور على الطلب.</Alert>
        <div className="text-center">
          <Button variant="secondary" onClick={() => navigate(-1)}>رجوع</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-donation-request mt-4" dir="rtl">
      <Card className="shadow-sm details-card">
        <Card.Header className="details-header text-white text-center">
          <h4 className="mb-0">تفاصيل طلب التبرع</h4>
        </Card.Header>

        <Card.Body>
          {/* Meta strip */}
          <div className="meta-strip d-flex gap-2 flex-wrap mb-3">
            <Badge bg="success">{req.category || '-'}</Badge>
            <Badge bg="secondary">{req.type || '-'}</Badge>
            <Badge bg={req.isUrgent ? 'danger' : 'dark'}>
              {req.isUrgent ? 'مستعجل' : 'عادي'}
            </Badge>
            {daysLeft(req?.deadline) !== null && (
              <Badge bg={left < 0 ? 'dark' : left <= 3 ? 'warning' : 'info'}>
                {left < 0 ? 'منتهي' : `تبقّى ${left} يومًا`}
              </Badge>
            )}
          </div>

          {/* Publisher card (hide avatar for owner) */}
          <div className={`publisher-card mb-3 ${isOwner ? 'no-avatar' : ''}`}>
            {!isOwner && (
              ownerAvatar ? (
                <img
                  className="pub-avatar"
                  src={ownerAvatar}
                  alt="الناشر"
                  onError={(e) => { e.currentTarget.remove(); }}
                />
              ) : (
                <div className="pub-avatar fallback">
                  {(publisher?.firstName?.[0] || '؟').toUpperCase()}
                  {(publisher?.lastName?.[0] || '').toUpperCase()}
                </div>
              )
            )}
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2">
                <div className="pub-name">
                  {publisher ? `${publisher.firstName || ''} ${publisher.lastName || ''}`.trim() || 'مستخدم' : 'مستخدم'}
                </div>
                {isOwner && <Badge bg="info">أنت صاحب الطلب</Badge>}
              </div>
              <div className="pub-meta">
                {ownerJoin ? <>انضم: {ownerJoin}</> : '—'}
              </div>
            </div>
          </div>

          {/* Details */}
          <ListGroup variant="flush" className="mb-3">
            {!!req.bloodType && (
              <ListGroup.Item><strong>فصيلة الدم:</strong> {req.bloodType}</ListGroup.Item>
            )}
            <ListGroup.Item><strong>الوصف:</strong> {req.description || '-'}</ListGroup.Item>
            <ListGroup.Item><strong>المكان:</strong> {req.place || '-'}</ListGroup.Item>

            {'amount' in req && (
              <ListGroup.Item>
                <strong>المبلغ المطلوب:</strong> {formatAmount(req.amount)}
              </ListGroup.Item>
            )}

            <ListGroup.Item><strong>آخر مهلة:</strong> {fmtDate(req.deadline)}</ListGroup.Item>

            {/* وسائل التواصل: تظهر للمالك أو بعد أول تأكيد (سابق أو حالي) */}
            {(isOwner || !!existingOffer || contactForceOpen) ? (
              contactMethods.length > 0 ? (
                <ListGroup.Item>
                  <strong>وسائل التواصل:</strong>
                  <ul className="mb-0">
                    {contactMethods.map((c, i) => (
                      <li key={i}>{methodLabel(c.method)}: {c.number || '-'}</li>
                    ))}
                  </ul>
                </ListGroup.Item>
              ) : null
            ) : (
              <ListGroup.Item className="text-muted">
                🛡️ ستظهر وسائل التواصل بعد تأكيد أول متبرّع.
              </ListGroup.Item>
            )}

            {paymentMethods.length > 0 && (
              <ListGroup.Item>
                <strong>وسائل الدفع:</strong>
                <ul className="mb-0">
                  {paymentMethods.map((p, i) => (
                    <li key={i}>{p.method}: {p.phone || '-'}</li>
                  ))}
                </ul>
              </ListGroup.Item>
            )}

            <ListGroup.Item><strong>تاريخ الإنشاء:</strong> {fmtDate(req.createdAt)}</ListGroup.Item>

            {/* 🔧 عرض الوثائق بطريقة ثابتة (صور/PDF) */}
            {!!docs.length && (
              <ListGroup.Item>
                <h6 className="mb-2 fw-bold">الوثائق الداعمة</h6>
                <div className="docs-grid mt-2">
                  {docs.map((d, idx) => (
                    <div className="doc-tile" key={idx}>
                      <div className="doc-thumb">
                        {d.isPdf ? (
                          <i className="far fa-file-pdf pdf-icon-big" aria-hidden="true"></i>
                        ) : (
                          <img
                            src={d.url}
                            alt={d.name}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.replaceWith(Object.assign(document.createElement('i'), { className: 'far fa-file generic-icon' })); }}
                          />
                        )}
                      </div>
                      <div className="doc-name" title={d.name}>{d.name}</div>
                      <div className="doc-actions">
                        <a className="btn btn-sm btn-outline-primary" href={d.url} target="_blank" rel="noreferrer">عرض</a>
                        <a className="btn btn-sm btn-outline-secondary" href={d.url} download>تنزيل</a>
                      </div>
                    </div>
                  ))}
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>

          {/* Persistent info banner for donor */}
          {infoMessage && (
            <Alert
              variant="info"
              className="mt-2 d-flex justify-content-between align-items-center"
            >
              <div>{infoMessage}</div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => { setInfoMessage(''); localStorage.setItem(LS_BANNER_HIDE, '1'); }}
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

          {/* Icon toolbar */}
          <div className="icon-toolbar d-flex gap-2 justify-content-center my-3">
            {!isOwner && !expired && (
              <button
                type="button"
                className="btn-icon btn-confirm"
                title="تأكيد التبرع"
                onClick={() => toggleSection('confirm')}
                aria-label="تأكيد التبرع"
              >
                <strong>💚</strong>
              </button>
            )}
            {!isOwner && recipientId && (
              <button
                type="button"
                className={`btn-icon ${activeSection === 'chat' ? 'btn-danger' : 'btn-outline'}`}
                title={activeSection === 'chat' ? 'إغلاق المحادثة' : 'محادثة'}
                onClick={() => toggleSection('chat')}
                aria-label="محادثة"
              >
                <FaComments />
              </button>
            )}
            <button
              type="button"
              className="btn-icon btn-outline"
              title="مشاركة"
              onClick={() => { toggleSection('share'); onShare(); }}
              aria-label="مشاركة"
            >
              <FaShareAlt />
            </button>
            <button
              type="button"
              className="btn-icon btn-outline-danger"
              title="الإبلاغ"
              onClick={() => toggleSection('report')}
              aria-label="الإبلاغ"
            >
              <FaFlag />
            </button>
            <button
              type="button"
              className="btn-icon btn-outline"
              title="العودة"
              onClick={() => navigate(-1)}
              aria-label="العودة"
            >
              <FaArrowRight />
            </button>
          </div>

          {/* Quick actions (owner or anyone بعد ظهور وسائل التواصل) */}
          {(isOwner || !!existingOffer || contactForceOpen) && (
            <div className="d-flex flex-wrap gap-2 mb-3 mt-3">
              {phone && (
                <a className="btn btn-outline-success btn-sm" href={asTel(phone)}>
                  <FaPhoneAlt className="ms-1" /> اتصال مباشر
                </a>
              )}
              {whatsapp && (
                <a className="btn btn-outline-success btn-sm" href={asWA(whatsapp)} target="_blank" rel="noreferrer">
                  <FaWhatsapp className="ms-1" /> واتساب
                </a>
              )}
            </div>
          )}

          {/* Confirm panel */}
          {activeSection === 'confirm' && !isOwner && !expired && (
            <div className="action-panel">
              <h6 className="fw-bold mb-3">تأكيد التبرع</h6>
              {confirmSuccess && <Alert variant="success">{confirmSuccess}</Alert>}

              <Form onSubmit={submitConfirmation}>
                <Form.Group className="mb-3">
                  <Form.Label>رسالة لصاحب الطلب (اختياري)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={confirmMsg}
                    onChange={(e) => setConfirmMsg(e.target.value)}
                    placeholder="اكتب رسالة قصيرة…"
                  />
                </Form.Group>

                {'amount' in (req || {}) && (
                  <Form.Group className="mb-3">
                    <Form.Label>مبلغ التبرع (اختياري)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min="0"
                        value={confirmAmount}
                        onChange={(e) => setConfirmAmount(e.target.value)}
                        placeholder="مثال: 100"
                      />
                      <InputGroup.Text>أوقية قديمة</InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>إرفاق إثبات التبرع (صور/‏PDF) — اختياري</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                  />
                  {evidenceFiles?.length > 0 && (
                    <div className="text-muted mt-1">تم اختيار {evidenceFiles.length} ملف/ملفات.</div>
                  )}
                </Form.Group>

                <Alert variant="light" className="border">
                  بعد إرسال التأكيد، سيُخطر صاحب الطلب فورًا وتظهر وسائل التواصل مباشرة. نوصي بإرفاق إثبات إن وُجد.
                </Alert>

                <div className="d-flex gap-2">
                  <Button type="submit" variant="success" disabled={submittingConfirm || !!existingOffer}>
                    {submittingConfirm ? 'جارٍ الإرسال…' : (!!existingOffer ? 'لديك تأكيد سابق' : 'إرسال التأكيد')}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>إغلاق</Button>
                </div>
              </Form>
            </div>
          )}

          {/* Chat panel */}
          {activeSection === 'chat' && !isOwner && recipientId && (
            <div className="action-panel">
              <h6 className="fw-bold mb-1">محادثة مع {ownerName}</h6>
              <div className="chat-topic">
                موضوع المحادثة: {req.category || '—'} — {req.type || '—'}{req.place ? ` • ${req.place}` : ''}
              </div>
              <ChatBox recipientId={recipientId} />
              <div className="mt-3">
                <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>إغلاق</Button>
              </div>
            </div>
          )}

          {/* Report panel */}
          {activeSection === 'report' && (
            <div className="action-panel">
              <h6 className="fw-bold mb-3">الإبلاغ عن الطلب</h6>
              {reportSuccess && <Alert variant="success">{reportSuccess}</Alert>}
              <Form onSubmit={submitReport}>
                <Form.Group className="mb-3">
                  <Form.Label>سبب الإبلاغ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="اكتب السبب بإيجاز…"
                    required
                  />
                </Form.Group>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="danger" disabled={submittingReport}>
                    {submittingReport ? 'جارٍ الإرسال…' : 'إرسال البلاغ'}
                  </Button>
                  <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>إغلاق</Button>
                </div>
              </Form>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DonationRequestDetails;

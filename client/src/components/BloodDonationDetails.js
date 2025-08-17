// src/pages/BloodDonationDetails.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Spinner, ListGroup, Badge, Alert, ProgressBar,
  OverlayTrigger, Tooltip
} from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from '../components/ChatBox';
import socket from '../socket';
import DonationOffersForRequest from '../components/DonationOffersForRequest';
import './BloodDonationDetails.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BloodDonationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [donationStatus, setDonationStatus] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [showOfferConfirm, setShowOfferConfirm] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);
  const currentUserId = currentUser?._id;

  const initialDeadlineRef = useRef(null);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const calculateTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (isNaN(diff)) return '—';
    if (diff <= 0) return '⛔ انتهت المهلة';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}ي ${hours}س ${minutes}د ${seconds}ث`;
  };

  const isRequestActive = (deadline) => {
    if (!deadline) return false;
    const now = new Date();
    return new Date(deadline) >= now;
  };

  const active = isRequestActive(donation?.deadline);
  const isOwner = donation?.userId?._id === currentUserId || donation?.userId === currentUserId;
  const recipientId = typeof donation?.userId === 'object' ? donation?.userId?._id : donation?.userId;

  const progressValue = React.useMemo(() => {
    if (!donation?.createdAt || !donation?.deadline) return 0;
    const start = new Date(donation.createdAt).getTime();
    const end = new Date(donation.deadline).getTime();
    const now = Date.now();
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    const ratio = Math.min(1, Math.max(0, (now - start) / (end - start)));
    return Math.round(ratio * 100);
  }, [donation?.createdAt, donation?.deadline, timeLeft]);

  /** توحيد عرض الوثائق (documents الجديدة + files القديمة) */
  const makeDocs = (don) => {
    if (Array.isArray(don?.documents) && don.documents.length) {
      return don.documents.map(d => {
        const raw = String(d.url || '');
        const absolute = /^https?:\/\//i.test(raw);
        const url = absolute ? raw : `${API_BASE}${raw.startsWith('/') ? raw : `/${raw}`}`;
        const name = d.originalName || d.filename || url.split('/').pop();
        return { url, name, isPdf: /\.pdf($|\?)/i.test(url) };
      });
    }
    if (Array.isArray(don?.files) && don.files.length) {
      return don.files.map((f) => {
        const v = String(f || '');
        const absolute = /^https?:\/\//i.test(v);
        const url = absolute ? v : `${API_BASE}/uploads/blood-requests/${v}`;
        const name = url.split('/').pop();
        return { url, name, isPdf: /\.pdf($|\?)/i.test(url) };
      });
    }
    return [];
  };

  const checkExistingOffer = async () => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/request/${id}`);
      if (res.ok) {
        const offers = res.body || [];
        const myOffer = offers.find(o => o.donor?._id === currentUserId);
        if (myOffer) {
          setExistingOffer(myOffer);
          if (['pending', 'accepted', 'in_progress'].includes(myOffer.status)) {
            setInfoMessage(`لقد أرسلت عرضًا سابقًا. الحالة: ${myOffer.status}`);
          }
        } else {
          setExistingOffer(null);
        }
      }
    } catch { /* صامت */ }
  };

  const fetchDonation = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetchWithInterceptors(`/api/blood-requests/${id}`);
      if (res.ok) {
        setDonation(res.body);
        setDonationStatus(res.body?.donationStatus || '');
        initialDeadlineRef.current = res.body?.deadline || null;
      } else {
        setLoadError('تعذر تحميل الطلب. حاول مجددًا.');
      }
    } catch {
      setLoadError('حدث خطأ غير متوقع أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  const requireAuth = () => {
    const token =
      localStorage.getItem('token') ||
      (JSON.parse(localStorage.getItem('user') || '{}')?.token) ||
      null;
    if (!token) {
      setInfoMessage('⚠️ تحتاج لتسجيل الدخول لإرسال عرض التبرع.');
      return false;
    }
    return true;
  };

  const handleConfirmSendDonationOffer = async () => {
    if (!donation || !recipientId || sendingOffer) return;
    if (!requireAuth()) return;
    setSendingOffer(true);
    try {
      // ✅ لا تمرّر headers يدويًا—الـ interceptor سيضيف Authorization و Content-Type تلقائيًا
      const res = await fetchWithInterceptors('/api/donation-confirmations', {
        method: 'POST',
        body: JSON.stringify({
          requestId: donation._id,
          message: 'أرغب بالتبرع',
          method: 'call',
          proposedTime: new Date()
        })
      });

      if (res.ok) {
        setInfoMessage('✅ تم إرسال عرض التبرع بنجاح!');
        socket.emit('sendMessage', {
          recipientId,
          content: `🩸 ${currentUser?.firstName || 'متبرّع'} قدّم عرض تبرع لطلب فصيلة ${donation.bloodType}`,
          requestId: donation._id,
          offerId: null,
          type: 'offer'
        });

        setDonationStatus('initiated');
        setInfoMessage('✅ تم إرسال العرض، بانتظار موافقة صاحب الطلب.');
        setShowOfferConfirm(false);
        await checkExistingOffer();
      } else {
        setInfoMessage('⚠️ لم يتم إرسال العرض. حاول لاحقًا.');
      }
    } catch (err) {
      if (err?.status === 401) {
        setInfoMessage('⚠️ غير مصرح. يرجى تسجيل الدخول ثم المحاولة.');
      } else {
        setInfoMessage('⚠️ خطأ في الإرسال. تحقق من الاتصال وحاول مجددًا.');
      }
    } finally {
      setSendingOffer(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blood-donation-details/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'طلب تبرع بالدم', url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setInfoMessage('🔗 تم نسخ الرابط للمشاركة.');
      }
    } catch {}
  };

  const handleReport = () => {
    setInfoMessage('📣 تم استلام بلاغك. سنراجعه قريبًا.');
  };

  useEffect(() => {
    fetchDonation();
    checkExistingOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!donation?.deadline) return;
    setTimeLeft(calculateTimeLeft(donation.deadline));
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(donation.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [donation?.deadline]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <div className="mt-2 text-muted">جاري التحميل…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center mt-4">
        <Alert variant="danger" className="d-inline-block text-start">
          {loadError}
          <div className="mt-2 d-flex gap-2">
            <Button size="sm" variant="danger" onClick={fetchDonation}>إعادة المحاولة</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>العودة</Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!donation) return <p className="mt-4 text-center">لا يوجد طلب.</p>;

  const canShowContacts = isOwner || existingOffer?.status === 'accepted';
  const docs = makeDocs(donation);

  return (
    <div className="blood-details-container mt-4" dir="rtl">
      <Card className="details-card shadow">
        <div className="ribbon-container">
          {!active && <span className="ribbon ribbon-closed">غير نشط</span>}
          {donation?.isUrgent && <span className="ribbon ribbon-urgent">مستعجل</span>}
        </div>

        <Card.Header className="text-center card-header text-white">
          <h4 className="mb-0">
            <i className="fas fa-tint ms-2"></i>
            تفاصيل طلب التبرع بالدم
          </h4>
          <div className="subhead mt-1">
            <Badge bg={active ? 'success' : 'secondary'} className="me-1">
              {active ? 'نشط' : 'غير نشط'}
            </Badge>
            {existingOffer?.status && (
              <Badge bg="info" className="me-1">
                حالة عرضك: {existingOffer.status}
              </Badge>
            )}
          </div>
        </Card.Header>

        <Card.Body>
          <div className="deadline-box">
            <div className="deadline-row">
              <span className="label">⏳ آخر أجل:</span>
              <Badge bg="danger" className="ms-2">{formatDate(donation.deadline)}</Badge>
            </div>

            <div className="timeleft">
              <i className="far fa-clock ms-1" />
              <strong>الوقت المتبقي:</strong>
              <span className={`ms-2 ${!active ? 'text-danger' : 'text-dark fw-semibold'}`}>
                {timeLeft}
              </span>
            </div>

            <OverlayTrigger placement="top" overlay={<Tooltip>نسبة الوقت المنقضي منذ النشر</Tooltip>}>
              <div>
                <ProgressBar
                  now={progressValue}
                  label={`${progressValue}%`}
                  className="time-progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressValue}
                />
              </div>
            </OverlayTrigger>
          </div>

          <ListGroup variant="flush" className="mt-3">
           <ListGroup.Item className="publisher-wrapper">
  <div
    className={`publisher-card hoverable ${isOwner ? 'is-owner no-avatar' : ''}`}
    onClick={() => donation?.userId?._id && navigate(`/profile/${donation.userId._id}`)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && donation?.userId?._id && navigate(`/profile/${donation.userId._id}`)}
    aria-label="فتح ملف الناشر"
    title={isOwner ? 'أنت صاحب الطلب' : 'اضغط لمعاينة الملف الشخصي'}
  >

    {/* ✅ لا تُظهر الصورة إذا كنت المالك */}
    {!isOwner && (
      <img
        src={donation?.userId?.profileImage || '/default-avatar.png'}
        alt="صورة الناشر"
        className="pub-avatar"
        onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
      />
    )}

    <div className="pub-info">
      <div className="pub-name d-flex align-items-center gap-2">
        <span>
          {donation.userId?.firstName || ''} {donation.userId?.lastName || ''}
        </span>
        {isOwner && <Badge bg="secondary">أنت</Badge>}
      </div>
      {!isOwner && (
        <div className="publisher-extra">
          <small className="text-muted">اضغط لمعاينة الملف الشخصي</small>
        </div>
      )}
    </div>
  </div>
</ListGroup.Item>

            <ListGroup.Item><strong>فصيلة الدم:</strong> {donation.bloodType}</ListGroup.Item>
            <ListGroup.Item>
              <strong>الحالة:</strong> {donation.isUrgent ? <span className="text-danger fw-bold">مستعجل</span> : 'عادي'}
            </ListGroup.Item>
            <ListGroup.Item><strong>📍 الموقع:</strong> {donation.location || 'غير محدد'}</ListGroup.Item>
            <ListGroup.Item><strong>📅 تاريخ الإضافة:</strong> {formatDate(donation.createdAt)}</ListGroup.Item>

            

            {canShowContacts ? (
              <ListGroup.Item>
                <strong>📞 وسائل التواصل:</strong>
                {donation.contactMethods?.length ? (
                  <ul className="mb-0 mt-2">
                    {donation.contactMethods.map((m, i) => (
                      <li key={i}>{m.method}: {m.number}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">لا توجد وسائل مضافة.</div>
                )}
              </ListGroup.Item>
            ) : (
              <ListGroup.Item className="text-muted">
                🛡️ سيتم عرض وسائل التواصل بعد موافقة صاحب الطلب على عرض التبرع.
              </ListGroup.Item>
            )}

            {!!docs.length && (
              <ListGroup.Item>
                <strong>📎 وثائق داعمة:</strong>
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

          <div className="actions-row mt-4 d-flex gap-2 justify-content-center flex-wrap">
            <button className="btn-fab" onClick={() => navigate(-1)} title="رجوع">
              <i className="fas fa-arrow-right" />
            </button>
            <button className="btn-fab" onClick={handleShare} title="مشاركة">
              <i className="fas fa-share-nodes" />
            </button>
            <button className="btn-fab warning" onClick={handleReport} title="إبلاغ">
              <i className="fas fa-flag" />
            </button>

            {!isOwner && recipientId && (
              <button
                className={`btn-fab ${showChat ? 'danger' : 'success'}`}
                onClick={() => setShowChat(!showChat)}
                title={showChat ? 'إغلاق المحادثة' : 'تحدث مع صاحب الطلب'}
              >
                <i className="fas fa-comments" />
              </button>
            )}

            {!isOwner && !existingOffer && active && (
              <button
                className="btn-fab donate"
                onClick={() => setShowOfferConfirm(true)}
                disabled={sendingOffer}
                title="تبرع الآن"
              >
                <i className="fas fa-hand-holding-heart" />
              </button>
            )}

            {!active && !isOwner && (
              <OverlayTrigger placement="top" overlay={<Tooltip>الطلب منتهي</Tooltip>}>
                <span>
                  <button className="btn-fab donate" disabled aria-disabled title="غير متاح">
                    <i className="fas fa-hand-holding-heart" />
                  </button>
                </span>
              </OverlayTrigger>
            )}
          </div>

          {showOfferConfirm && (
            <Alert variant="light" className="mt-4 border shadow-sm">
              <h6 className="fw-bold">تأكيد عرض التبرع</h6>
              <p className="mb-2">
                سيتم إشعار صاحب الطلب بعرضك. عند الموافقة ستظهر لك وسائل التواصل. هل ترغب في المتابعة؟
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleConfirmSendDonationOffer}
                  disabled={sendingOffer}
                >
                  {sendingOffer ? '...جارٍ التأكيد' : '✅ تأكيد'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowOfferConfirm(false)}>
                  إلغاء
                </Button>
              </div>
            </Alert>
          )}

          {!!infoMessage && (
            <Alert
              variant="info"
              className="mt-3 d-flex justify-content-between align-items-center"
              role="status"
            >
              <div>{infoMessage}</div>
              <Button variant="outline-secondary" size="sm" onClick={() => setInfoMessage('')}>×</Button>
            </Alert>
          )}

          {showChat && recipientId && (
            <div className="mt-4">
              <h5 className="text-center mb-3">محادثة مع {donation.userId?.firstName || 'الناشر'}</h5>
              <ChatBox recipientId={recipientId} />
            </div>
          )}
        </Card.Body>
      </Card>

      {isOwner && <DonationOffersForRequest />}
    </div>
  );
};

export default BloodDonationDetails;

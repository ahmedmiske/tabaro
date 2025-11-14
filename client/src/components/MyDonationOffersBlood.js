import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Badge, Button, Toast, ToastContainer, Form, Collapse } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import useIsMobile from '../hooks/useIsMobile';
import './MyDonationOffersBlood.css';

/* ===== Stars ===== */
function RatingStars({ value, onRate, disabled }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div dir="ltr" style={{ display: 'inline-flex', gap: 4 }}>
      {stars.map((n) => {
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            title={`${n}`}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => !disabled && setHover(0)}
            onClick={() => !disabled && onRate(n)}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: disabled ? 'default' : 'pointer',
              fontSize: 20,
              lineHeight: 1,
              color: filled ? '#FFC107' : '#E0E0E0',
            }}
            aria-label={`Rate ${n}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
RatingStars.propTypes = { value: PropTypes.number, onRate: PropTypes.func, disabled: PropTypes.bool };
RatingStars.defaultProps = { value: 0, onRate: () => {}, disabled: false };

/* ===== Helpers ===== */
const statusLabel = (s) =>
  ({
    pending: 'قيد الاستلام',
    accepted: 'تم التنفيذ',
    fulfilled: 'تم التنفيذ',
    rated: 'تم التقييم',
    canceled: 'ملغى',
  }[s] || 'قيد الاستلام');

const statusColor = (s) =>
  ({
    pending: 'warning',
    accepted: 'primary',
    fulfilled: 'info',
    rated: 'secondary',
    canceled: 'dark',
  }[s] || 'warning');

const toDateSafe = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getNowMs = (nowVal) => {
  if (nowVal instanceof Date) return nowVal.getTime();
  if (typeof nowVal === 'number') return nowVal;
  const parsed = Date.parse(nowVal);
  return Number.isNaN(parsed) ? Date.now() : parsed;
};
function buildDayHourChip(deadline, nowVal) {
  const d = toDateSafe(deadline);
  if (!d) return { top: '—', bottom: '', cls: 'chip--na', title: '' };
  const now = getNowMs(nowVal);
  const diff = d.getTime() - now;
  const title = d.toLocaleString('ar-MA');
  if (diff <= 0) return { top: 'منتهي', bottom: '', cls: 'chip--expired', title };
  const hoursTotal = Math.floor(diff / 3600_000);
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  let cls = 'chip--ok';
  if (hoursTotal <= 24) cls = 'chip--soon';
  if (hoursTotal <= 3) cls = 'chip--urgent';
  return { top: `${days}ي`, bottom: `${hours}س`, cls, title };
}

const MyDonationOffersBlood = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('تمت العملية بنجاح');

  const [statusFilter, setStatusFilter] = useState('');
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);
  const [openCanceled, setOpenCanceled] = useState(true);

  const nowTick = useTicker(60_000);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  const fetchMyOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations/sent');
      if (res.ok) setOffers(Array.isArray(res.body) ? res.body : []);
    } catch (err) {
      console.error('خطأ في جلب العروض المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyOffers();
  }, []);

  const groups = useMemo(() => {
    const nowMs = getNowMs(nowTick);
    const g = { active: [], inactive: [], canceled: [] };
    (offers || []).forEach((offer) => {
      const req = offer.request || offer.requestId || {};
      const d = req?.deadline ? new Date(req.deadline) : null;
      const expired = d ? d.getTime() <= nowMs : false;

      if (offer.status === 'canceled') g.canceled.push(offer);
      else if (expired || offer.status === 'fulfilled' || offer.status === 'rated') g.inactive.push(offer);
      else g.active.push(offer);
    });

    const applyStatus = (list) => {
      if (!statusFilter) return list;
      if (statusFilter === 'pending') return list.filter((o) => o.status === 'pending');
      if (statusFilter === 'accepted') return list.filter((o) => o.status === 'accepted');
      if (statusFilter === 'rated') return list.filter((o) => o.status === 'rated');
      return list;
    };

    const byNewest = (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

    return {
      active: applyStatus(g.active).sort(byNewest),
      inactive: applyStatus(g.inactive).sort(byNewest),
      canceled: applyStatus(g.canceled).sort(byNewest),
    };
  }, [offers, nowTick, statusFilter]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search;
    navigate(`/blood-donation-details/${reqId}`, { state: { from } });
  };

  const handleCancelOffer = async (offerId, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers((prev) => (Array.isArray(prev) ? prev.filter((o) => o._id !== offerId) : []));
        setToastMsg('✅ تم إلغاء العرض بنجاح.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض:', err);
    }
  };

  const handleFulfill = async (offerId, e) => {
    e.stopPropagation();
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/fulfill`, { method: 'PATCH' });
      if (res.ok) {
        await fetchMyOffers();
        setToastMsg('✅ تم التعليم كـ تم التنفيذ.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل تحديث التنفيذ:', err);
    }
  };

  const handleRate = async (offerId, rating) => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        await fetchMyOffers();
        setToastMsg('⭐ تم حفظ تقييمك.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل حفظ التقييم:', err);
    }
  };

  /* ====== جدول الدِسك توب ====== */
  const renderRows = (list) =>
    list.map((offer) => {
      const req = offer.request || offer.requestId || {};
      const reqId = req?._id || offer.requestId?._id || offer.requestId;
      const owner = req?.user || req?.userId || {};
      const ownerName = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
      const chip = buildDayHourChip(req?.deadline, nowTick);
      const donorRated = !!offer.ratingByDonor;
      const recipientRated = (offer.ratingByRecipient || 0) > 0;
      const canShowRatingBlock = offer.status === 'fulfilled' || offer.status === 'rated';

      return (
        <tr
          key={offer._id}
          onClick={() => openDetails(reqId)}
          className="clickable-row"
          style={{ cursor: reqId ? 'pointer' : 'default' }}
        >
          <td>{ownerName}</td>
          <td>{req?.bloodType || '—'}</td>
          <td>
            <span className={`time-chip ${chip.cls}`} title={chip.title}>
              <span className="t">{chip.top}</span>
              {chip.bottom && <span className="b">{chip.bottom}</span>}
            </span>
          </td>
          <td>
            <Badge bg={statusColor(offer.status)}>{statusLabel(offer.status)}</Badge>
          </td>

          <td onClick={(e) => e.stopPropagation()}>
            {owner?._id && (
              <Button
                variant="outline-primary"
                size="sm"
                className="me-1 mb-1"
                onClick={() => navigate(`/chat/${owner._id}`, { state: { from: location.pathname + location.search } })}
              >
                <i className="fas fa-comments" /> دردشة
              </Button>
            )}

            {offer.status === 'pending' && (
              <Button variant="outline-danger" size="sm" className="me-1 mb-1" onClick={(e) => handleCancelOffer(offer._id, e)}>
                <i className="fas fa-trash" /> إلغاء العرض
              </Button>
            )}

            {offer.status === 'accepted' && (
              <Button variant="primary" size="sm" className="me-1 mb-1" onClick={(e) => handleFulfill(offer._id, e)}>
                ⛳ تم التنفيذ
              </Button>
            )}

            {canShowRatingBlock && (
              <div className="d-inline-flex flex-column align-items-start gap-1">
                <div className="d-inline-flex align-items-center gap-2">
                  <span className="text-muted small">تقييمك:</span>
                  {donorRated ? <RatingStars value={offer.ratingByDonor} disabled /> : <RatingStars value={0} onRate={(n) => handleRate(offer._id, n)} />}
                </div>
                {recipientRated && (
                  <div className="d-inline-flex align-items-center gap-2">
                    <span className="text-muted small">تقييم صاحب الطلب:</span>
                    <RatingStars value={offer.ratingByRecipient} disabled />
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      );
    });

  /* ====== كرت الموبايل ====== */
  const renderCard = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId = req?._id || offer.requestId?._id || offer.requestId;
    const owner = req?.user || req?.userId || {};
    const ownerName = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req?.deadline, nowTick);
    const canShowRatingBlock = offer.status === 'fulfilled' || offer.status === 'rated';

    return (
      <li key={offer._id} className="card-item" onClick={() => openDetails(reqId)}>
        <div className="ci-head">
          <div className="ci-title">{req?.title || req?.description || offer.title || '—'}</div>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </div>
        <div className="ci-meta">
          <span className="badge bg-light text-dark border">صاحب الطلب: {ownerName}</span>
          <span className="badge bg-success">فصيلة: {req?.bloodType || '—'}</span>
          <span className={`badge bg-${statusColor(offer.status)}`}>{statusLabel(offer.status)}</span>
        </div>
        <div className="ci-actions" onClick={(e) => e.stopPropagation()}>
          {owner?._id && (
            <Button variant="outline-primary" size="sm" onClick={() => navigate(`/chat/${owner._id}`, { state: { from: location.pathname + location.search } })}>
              💬 دردشة
            </Button>
          )}
          {offer.status === 'pending' && (
            <Button variant="outline-danger" size="sm" onClick={(e) => handleCancelOffer(offer._id, e)}>
              🗑️ إلغاء
            </Button>
          )}
          {offer.status === 'accepted' && (
            <Button variant="primary" size="sm" onClick={(e) => handleFulfill(offer._id, e)}>
              ⛳ تم التنفيذ
            </Button>
          )}
        </div>
        {canShowRatingBlock && (
          <div className="ci-rating" onClick={(e) => e.stopPropagation()}>
            <span className="text-muted small">تقييمك:</span>
            <RatingStars value={offer.ratingByDonor || 0} onRate={(n) => handleRate(offer._id, n)} disabled={!!offer.ratingByDonor} />
          </div>
        )}
      </li>
    );
  };

  const section = (title, list, open, setOpen, badgeVariant) => (
    <div className="section-card mb-3">
      <div className="section-head">
        <h6 className="m-0">
          {title} <Badge bg={badgeVariant} className="ms-1">{list.length}</Badge>
        </h6>
        <Button size="sm" variant="outline-secondary" onClick={() => setOpen((v) => !v)}>
          {open ? 'إخفاء' : 'عرض'}
        </Button>
      </div>
      <Collapse in={open}>
        <div>
          {list.length === 0 ? (
            <div className="text-muted small p-3">لا توجد عناصر.</div>
          ) : isMobile ? (
            <ul className="card-list">{list.map(renderCard)}</ul>
          ) : (
            <Table striped bordered hover responsive className="mt-2">
              <thead>
                <tr>
                  <th>صاحب الطلب</th>
                  <th>فصيلة الدم</th>
                  <th>الوقت</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>{renderRows(list)}</tbody>
            </Table>
          )}
        </div>
      </Collapse>
    </div>
  );

  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (!Array.isArray(offers) || offers.length === 0) return <p>لم تقم بإرسال أي عروض تبرع بالدم بعد.</p>;

  return (
    <div className="my-donation-offers">
      <div className="header-bar sticky">
        <div className="title-wrap">
          <span className="title-icon"><i className="fas fa-hand-holding-heart" /></span>
          <h4 className="m-0 fw-bold">عروضي على طلبات التبرع بالدم</h4>
        </div>
        <div className="status-filter">
          <Form.Select aria-label="فلترة بحسب الحالة" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="pending">قيد الاستلام</option>
            <option value="accepted">قيد التنفيذ</option>
            <option value="rated">تم التقييم</option>
          </Form.Select>
        </div>
      </div>

      <div style={{ height: 12 }} />
      {section('العروض النشطة', groups.active, openActive, setOpenActive, 'success')}
      {section('العروض غير النشطة', groups.inactive, openInactive, setOpenInactive, 'secondary')}
      {section('العروض الملغاة', groups.canceled, openCanceled, setOpenCanceled, 'dark')}

      <ToastContainer position="bottom-start" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={2500} autohide bg="success">
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MyDonationOffersBlood;

// src/components/MyDonationOffersGeneral.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Toast, ToastContainer, Form, Collapse } from 'react-bootstrap';
import PropTypes from 'prop-types';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import useIsMobile from '../hooks/useIsMobile';
import './MyDonationOffersGeneral.css';

const getStatusLabel = (status) =>
  status === 'fulfilled'
    ? 'تم الاستلام'
    : status === 'rated'
    ? 'تم التقييم'
    : 'قيد الاستلام';

const getStatusColor = (status) =>
  status === 'fulfilled'
    ? 'info'
    : status === 'rated'
    ? 'secondary'
    : 'warning';

const toDateSafe = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getNowMs = (v) =>
  v instanceof Date
    ? v.getTime()
    : typeof v === 'number'
    ? v
    : Date.parse(v) || Date.now();
const isExpired = (deadline, nowMs) => {
  const d = toDateSafe(deadline);
  if (!d) return false;
  return d.getTime() < getNowMs(nowMs);
};

const buildDayHourChip = (deadline, nowVal) => {
  const d = toDateSafe(deadline);
  if (!d)
    return {
      top: '—',
      bottom: '',
      cls: 'chip--na',
      title: '',
    };
  const now = getNowMs(nowVal);
  const diff = d.getTime() - now;
  const title = d.toLocaleString('ar-MA');
  if (diff <= 0)
    return {
      top: 'منتهي',
      bottom: '',
      cls: 'chip--expired',
      title,
    };
  const hoursTotal = Math.floor(diff / 3600_000);
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  let cls = 'chip--ok';
  if (hoursTotal <= 24) cls = 'chip--soon';
  if (hoursTotal <= 3) cls = 'chip--urgent';
  return {
    top: `${days}ي`,
    bottom: `${hours}س`,
    cls,
    title,
  };
};

/** ⭐ كومبوننت النجوم لتقييم صاحب الطلب من جهة المتبرع */
function RatingStars({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const score = hover || value || 0;
  return (
    <div
      dir="ltr"
      style={{ display: 'inline-flex', gap: 4 }}
      onClick={(e) => e.stopPropagation()} // حتى لا يفتح الصف
    >
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
            fontSize: 18,
            lineHeight: 1,
            color: score >= n ? '#FFC107' : '#E0E0E0',
            padding: 0,
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

const MyDonationOffersGeneral = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('تمت العملية بنجاح');
  const [statusFilter, setStatusFilter] = useState('');
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);

  const now = useTicker(60_000);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  const fetchMyOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-request-confirmations/sent');
      if (res.ok) setOffers(Array.isArray(res.body) ? res.body : []);
    } catch (err) {
      console.error('خطأ في جلب العروض العامة المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyOffers();
  }, []);

  const { activeOffers, inactiveOffers } = useMemo(() => {
    const act = [];
    const inact = [];
    (offers || []).forEach((offer) => {
      const req = offer.request || offer.requestId || {};
      const s = offer?.status || 'pending';
      const activeStates = ['pending', 'accepted'];
      const active = activeStates.includes(s) && !isExpired(req?.deadline, now);
      (active ? act : inact).push(offer);
    });

    const applyStatusFilter = (list) =>
      !statusFilter
        ? list
        : list.filter(
            (o) =>
              o.status === statusFilter ||
              (statusFilter === 'pending' && o.status === 'accepted'),
          );

    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

    return {
      activeOffers: applyStatusFilter(act).sort(byNewest),
      inactiveOffers: applyStatusFilter(inact).sort(byNewest),
    };
  }, [offers, now, statusFilter]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search;
    navigate(`/donations/${reqId}`, { state: { from } });
  };

  const handleCancelOffer = async (offerId, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-request-confirmations/${offerId}`,
        { method: 'DELETE' },
      );
      if (res.ok) {
        setOffers((prev) =>
          Array.isArray(prev) ? prev.filter((o) => o._id !== offerId) : [],
        );
        setToastMsg('✅ تم إلغاء العرض بنجاح.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض العام:', err);
    }
  };

  /** ⭐ استدعاء التقييم من جهة المتبرع */
  const handleRateOffer = async (offerId, score) => {
    try {
      const res = await fetchWithInterceptors(
        `/api/donation-request-confirmations/${offerId}/rate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating: score }),
        },
      );
      if (res.ok) {
        setOffers((prev) =>
          (prev || []).map((o) =>
            o._id === offerId
              ? {
                  ...o,
                  ratingByDonor: score,
                  // لو الحالة ما زالت fulfilled نحدّثها لـ rated (اختياري حسب منطق السيرفر)
                  status: o.status === 'fulfilled' ? 'rated' : o.status,
                }
              : o,
          ),
        );
        setToastMsg('✅ تم حفظ تقييمك لصاحب الطلب.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل حفظ التقييم من جهة المتبرع:', err);
    }
  };

  const renderRow = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId = req?._id || offer.requestId?._id || offer.requestId;
    const owner = req?.user || req?.userId || {};
    const ownerName =
      [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req?.deadline, now);

    const canRate =
      (offer.status === 'fulfilled' || offer.status === 'rated') &&
      !offer.ratingByDonor;

    return (
      <tr
        key={offer._id}
        onClick={() => openDetails(reqId)}
        className="clickable-row"
        style={{ cursor: reqId ? 'pointer' : 'default' }}
      >
        <td>{ownerName}</td>
        <td>
          {req?.category || '—'}
          {req?.type ? ` / ${req.type}` : ''}
        </td>
        <td>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </td>
        <td>
          <Badge bg={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge>
          {/* شريط التقييم من جهة المتبرع */}
          {(canRate || offer.ratingByDonor) && (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <small className="d-block text-muted mb-1">
                تقييمك لصاحب الطلب:
              </small>
              <RatingStars
                value={offer.ratingByDonor || 0}
                disabled={!!offer.ratingByDonor}
                onChange={(n) => handleRateOffer(offer._id, n)}
              />
            </div>
          )}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          {owner?._id && (
            <Button
              variant="outline-primary"
              size="sm"
              className="me-1 mb-1"
              onClick={() =>
                navigate(`/chat/${owner._id}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              <i className="fas fa-comments" /> دردشة
            </Button>
          )}
          {(offer.status === 'pending' || offer.status === 'accepted') &&
            !isExpired(req?.deadline, now) && (
              <Button
                variant="outline-danger"
                size="sm"
                className="me-1 mb-1"
                onClick={(e) => handleCancelOffer(offer._id, e)}
              >
                <i className="fas fa-trash" /> إلغاء العرض
              </Button>
            )}
        </td>
      </tr>
    );
  };

  const renderCard = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId = req?._id || offer.requestId?._id || offer.requestId;
    const owner = req?.user || req?.userId || {};
    const ownerName =
      [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req?.deadline, now);

    const canRate =
      (offer.status === 'fulfilled' || offer.status === 'rated') &&
      !offer.ratingByDonor;

    return (
      <li
        key={offer._id}
        className="card-item"
        onClick={() => openDetails(reqId)}
      >
        <div className="ci-head">
          <div className="ci-title">{req?.title || req?.description || '—'}</div>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </div>
        <div className="ci-meta">
          <span className="badge bg-light text-dark border">
            صاحب الطلب: {ownerName}
          </span>
          <span className="badge bg-success text-white">
            {req?.category || '—'}
            {req?.type ? ` / ${req.type}` : ''}
          </span>
          <span className={`badge bg-${getStatusColor(offer.status)}`}>
            {getStatusLabel(offer.status)}
          </span>
        </div>

        {/* التقييم في الكارد للموبايل */}
        {(canRate || offer.ratingByDonor) && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <small className="d-block text-muted mb-1">
              تقييمك لصاحب الطلب:
            </small>
            <RatingStars
              value={offer.ratingByDonor || 0}
              disabled={!!offer.ratingByDonor}
              onChange={(n) => handleRateOffer(offer._id, n)}
            />
          </div>
        )}

        <div className="ci-actions" onClick={(e) => e.stopPropagation()}>
          {owner?._id && (
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2"
              onClick={() =>
                navigate(`/chat/${owner._id}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              💬 دردشة
            </Button>
          )}
          {(offer.status === 'pending' || offer.status === 'accepted') &&
            !isExpired(req?.deadline, now) && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => handleCancelOffer(offer._id, e)}
              >
                🗑️ إلغاء
              </Button>
            )}
        </div>
      </li>
    );
  };

  const section = (title, list, open, setOpen, badgeVariant) => (
    <div className="section-card mb-3">
      <div className="section-head">
        <h6 className="m-0">
          {title}{' '}
          <Badge bg={badgeVariant} className="ms-1">
            {list.length}
          </Badge>
        </h6>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={() => setOpen((v) => !v)}
        >
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
                  <th>المجال/النوع</th>
                  <th>الوقت</th>
                  <th>الحالة والتقييم</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>{list.map(renderRow)}</tbody>
            </Table>
          )}
        </div>
      </Collapse>
    </div>
  );

  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (!Array.isArray(offers) || offers.length === 0)
    return <p>لم تقم بإرسال أي عروض تبرع عامة بعد.</p>;

  return (
    <div className="my-donation-offers" dir="rtl">
      <div className="header-bar mb-3">
        <div className="title-wrap">
          <span className="title-icon">
            <i className="fas fa-hand-holding-heart" />
          </span>
          <h4 className="m-0 fw-bold">عروضي على طلبات التبرع العامة</h4>
        </div>
        <div className="status-filter">
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="فلترة بالحالة"
          >
            <option value="">كل الحالات</option>
            <option value="pending">قيد الاستلام</option>
            <option value="accepted">تم الاستلام</option>
            <option value="rated">تم التقييم</option>
          </Form.Select>
        </div>
      </div>

      {section('العروض النشطة', activeOffers, openActive, setOpenActive, 'success')}
      {section(
        'العروض غير النشطة',
        inactiveOffers,
        openInactive,
        setOpenInactive,
        'secondary',
      )}

      <ToastContainer position="bottom-start" className="p-3">
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={2500}
          autohide
          bg="success"
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MyDonationOffersGeneral;

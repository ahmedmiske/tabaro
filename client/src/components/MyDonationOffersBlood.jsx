import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Badge,
  Button,
  Toast,
  ToastContainer,
  Form,
  Collapse,
  Modal,
} from 'react-bootstrap';
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
    pending: 'في الانتظار',
    accepted: 'قيد التنفيذ',
    fulfilled: 'تم التنفيذ',
    rated: 'تم التقييم',
    canceled: 'ملغى',
  }[s] || 'في الانتظار');

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

const formatDateShort = (value) => {
  const d = toDateSafe(value);
  if (!d) return '—';
  return d.toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/** 🔹 سبب كون الطلب غير نشط (موقوف / منتهي / ملغى) */
function getInactiveReasonForRequest(req, nowTick) {
  if (!req) return '';
  const status = req.status || ''; // active | paused | finished | cancelled
  const closedReason = (req.closedReason || '').trim();
  const deadline = req.deadline ? new Date(req.deadline) : null;
  const now = getNowMs(nowTick);
  const isExpired = deadline ? deadline.getTime() <= now : false;

  if (status === 'paused') {
    if (closedReason) return closedReason;
    return 'تم إيقاف الطلب من طرف صاحب الطلب.';
  }

  if (status === 'finished') {
    if (closedReason) return closedReason;
    if (isExpired) return 'انتهت صلاحية الطلب (انتهى التاريخ المحدد).';
    return 'تم اعتبار الطلب منتهيًا.';
  }

  if (status === 'cancelled') {
    if (closedReason) return closedReason;
    return 'تم إلغاء هذا الطلب.';
  }

  if (isExpired && status === 'active') {
    return 'انتهت صلاحية الطلب بسبب انتهاء التاريخ المحدد.';
  }

  return '';
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

  const [showRateModal, setShowRateModal] = useState(false);
  const [rateOffer, setRateOffer] = useState(null);
  const [rateValue, setRateValue] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

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

  // إحصائيات سريعة لكل الحالات
  const stats = useMemo(() => {
    const base = { total: 0, pending: 0, accepted: 0, fulfilled: 0, rated: 0, canceled: 0 };
    if (!Array.isArray(offers)) return base;
    const out = { ...base, total: offers.length };
    offers.forEach((o) => {
      if (o.status === 'pending') out.pending += 1;
      else if (o.status === 'accepted') out.accepted += 1;
      else if (o.status === 'fulfilled') out.fulfilled += 1;
      else if (o.status === 'rated') out.rated += 1;
      else if (o.status === 'canceled') out.canceled += 1;
    });
    return out;
  }, [offers]);

  // 🔹 تقسيم العروض حسب حالة الطلب + حالة العرض
  const groups = useMemo(() => {
    const g = { active: [], inactive: [], canceled: [] };

    (offers || []).forEach((offer) => {
      const req = offer.request || offer.requestId || {};
      const reqStatus = req?.status || 'active';

      if (offer.status === 'canceled') {
        // عروض ملغاة من طرف المتبرع
        g.canceled.push(offer);
      } else if (
        reqStatus === 'active' &&
        (offer.status === 'pending' || offer.status === 'accepted')
      ) {
        // الطلب ما زال active والعرض لم يُنفَّذ بعد → نشط
        g.active.push(offer);
      } else {
        // أي حالة أخرى: طلب موقوف/منتهي/ملغى أو عرض منفَّذ/مُقيَّم
        g.inactive.push(offer);
      }
    });

    const applyStatus = (list) => {
      if (!statusFilter) return list;
      if (statusFilter === 'pending') return list.filter((o) => o.status === 'pending');
      if (statusFilter === 'accepted') return list.filter((o) => o.status === 'accepted');
      if (statusFilter === 'rated')
        return list.filter((o) => o.status === 'rated' || o.status === 'fulfilled');
      return list;
    };

    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

    return {
      active: applyStatus(g.active).sort(byNewest),
      inactive: applyStatus(g.inactive).sort(byNewest),
      canceled: applyStatus(g.canceled).sort(byNewest),
    };
  }, [offers, statusFilter]);

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
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOffers((prev) =>
          Array.isArray(prev) ? prev.filter((o) => o._id !== offerId) : [],
        );
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
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${offerId}/fulfill`,
        { method: 'PATCH' },
      );
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
      const res = await fetchWithInterceptors(
        `/api/donation-confirmations/${offerId}/rate`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        },
      );
      if (res.ok) {
        await fetchMyOffers();
        setToastMsg('⭐ تم حفظ تقييمك.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل حفظ التقييم:', err);
      setToastMsg('⚠️ حدث خطأ أثناء حفظ التقييم.');
      setShowToast(true);
    }
  };

  const openRateModal = (offer) => {
    setRateOffer(offer);
    setRateValue(offer.ratingByDonor || 0);
    setShowRateModal(true);
  };

  const closeRateModal = () => {
    setShowRateModal(false);
    setRateOffer(null);
    setRateValue(0);
  };

  const submitRating = async () => {
    if (!rateOffer || !rateValue) {
      setToastMsg('الرجاء اختيار تقييم من 1 إلى 5 نجوم.');
      setShowToast(true);
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

  /* ====== جدول الدِسك توب ====== */
  const renderRows = (list) =>
    list.map((offer) => {
      const req = offer.request || offer.requestId || {};
      const reqId = req?._id || offer.requestId?._id || offer.requestId;
      const owner = req?.user || req?.userId || {};
      const ownerName =
        [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
      const chip = buildDayHourChip(req?.deadline, nowTick);
      const donorRated = !!offer.ratingByDonor;
      const recipientRated = (offer.ratingByRecipient || 0) > 0;
      const canShowRatingBlock = offer.status === 'fulfilled' || offer.status === 'rated';
      const title = req?.title || req?.description || offer.title || '—';
      const city = req?.city || req?.location || req?.hospital || '—';

      const inactiveReason = getInactiveReasonForRequest(req, nowTick);

      return (
        <tr
          key={offer._id}
          onClick={() => openDetails(reqId)}
          className="clickable-row"
          style={{ cursor: reqId ? 'pointer' : 'default' }}
        >
          <td>
            <div className="cell-main-title">{title}</div>
            <div className="cell-sub text-muted">
              صاحب الطلب: {ownerName}{' '}
              {!!city && city !== '—' && <span className="dot-sep">•</span>}{' '}
              {city !== '—' && <span>{city}</span>}
            </div>
            {inactiveReason && (
              <div className="small text-danger mt-1">
                سبب توقف الطلب: {inactiveReason}
              </div>
            )}
          </td>
          <td>
            {req?.bloodType ? (
              <span className="bloodtype-highlight-table">{req.bloodType}</span>
            ) : (
              '—'
            )}
          </td>
          <td>
            <span className={`time-chip ${chip.cls}`} title={chip.title}>
              <span className="t">{chip.top}</span>
              {chip.bottom && <span className="b">{chip.bottom}</span>}
            </span>
          </td>
          <td>
            <Badge bg={statusColor(offer.status)}>{statusLabel(offer.status)}</Badge>
            <div className="small text-muted mt-1">
              أُرسل في: {formatDateShort(offer.createdAt)}
            </div>
          </td>

          <td
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
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

            {offer.status === 'pending' && (
              <Button
                variant="outline-danger"
                size="sm"
                className="me-1 mb-1"
                onClick={(e) => handleCancelOffer(offer._id, e)}
              >
                <i className="fas fa-trash" /> إلغاء العرض
              </Button>
            )}

            {offer.status === 'accepted' && (
              <Button
                variant="primary"
                size="sm"
                className="me-1 mb-1"
                onClick={(e) => handleFulfill(offer._id, e)}
              >
                ⛳ تم التنفيذ
              </Button>
            )}

            {canShowRatingBlock && (
              <div className="mt-2">
                {donorRated ? (
                  <div className="d-flex flex-column align-items-start gap-1">
                    <div className="d-inline-flex align-items-center gap-2">
                      <span className="text-muted small">تقييمك لهذا الطلب:</span>
                      <RatingStars value={offer.ratingByDonor} disabled />
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none"
                        onClick={() => openRateModal(offer)}
                      >
                        تعديل
                      </Button>
                    </div>
                    {recipientRated && (
                      <div className="d-inline-flex align-items-center gap-2">
                        <span className="text-muted small">
                          تقييم صاحب الطلب لك:
                        </span>
                        <RatingStars value={offer.ratingByRecipient} disabled />
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => openRateModal(offer)}
                  >
                    ⭐ إضافة تقييم للتجربة
                  </Button>
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
    const ownerName =
      [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req?.deadline, nowTick);
    const canShowRatingBlock = offer.status === 'fulfilled' || offer.status === 'rated';
    const donorRated = !!offer.ratingByDonor;
    const city = req?.city || req?.location || req?.hospital || '';
    const inactiveReason = getInactiveReasonForRequest(req, nowTick);

    return (
      <li key={offer._id} className="card-item" onClick={() => openDetails(reqId)}>
        <div className="ci-head">
          <div className="ci-title">
            {req?.title || req?.description || offer.title || '—'}
          </div>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </div>

        <div className="ci-meta">
          <span className="badge bg-light text-dark border">
            صاحب الطلب: {ownerName}
          </span>
          {req?.bloodType ? (
            <span className="bloodtype-highlight-card">{req.bloodType}</span>
          ) : (
            <span className="badge bg-success">فصيلة: —</span>
          )}
          {city && <span className="badge bg-light text-dark border">{city}</span>}
          <span className={`badge bg-${statusColor(offer.status)}`}>
            {statusLabel(offer.status)}
          </span>
        </div>

        <div className="ci-subinfo">
          <span className="small text-muted">
            أُرسل في: {formatDateShort(offer.createdAt)}
          </span>
        </div>

        {inactiveReason && (
          <div className="small text-danger mt-1">
            سبب توقف الطلب: {inactiveReason}
          </div>
        )}

        <div
          className="ci-actions"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {owner?._id && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() =>
                navigate(`/chat/${owner._id}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              💬 دردشة
            </Button>
          )}
          {offer.status === 'pending' && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={(e) => handleCancelOffer(offer._id, e)}
            >
              🗑️ إلغاء
            </Button>
          )}
          {offer.status === 'accepted' && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => handleFulfill(offer._id, e)}
            >
              ⛳ تم التنفيذ
            </Button>
          )}
        </div>

        {canShowRatingBlock && (
          <div
            className="ci-rating"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {donorRated ? (
              <div className="d-flex flex-column align-items-start gap-1">
                <span className="text-muted small">تقييمك:</span>
                <RatingStars value={offer.ratingByDonor || 0} disabled />
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none"
                  onClick={() => openRateModal(offer)}
                >
                  تعديل التقييم
                </Button>
              </div>
            ) : (
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => openRateModal(offer)}
              >
                ⭐ إضافة تقييم
              </Button>
            )}
          </div>
        )}
      </li>
    );
  };

  const section = (title, subtitle, list, open, setOpen, badgeVariant) => (
    <div className="section-card mb-3">
      <div className="section-head">
        <div className="section-head-titles">
          <h6 className="m-0">
            {title}{' '}
            <Badge bg={badgeVariant} className="ms-1">
              {list.length}
            </Badge>
          </h6>
          {subtitle && <div className="section-sub small text-muted">{subtitle}</div>}
        </div>
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
            <div className="text-muted small p-3">لا توجد عناصر في هذه القائمة.</div>
          ) : isMobile ? (
            <ul className="card-list">{list.map(renderCard)}</ul>
          ) : (
            <Table striped bordered hover responsive className="mt-2">
              <thead>
                <tr>
                  <th>تفاصيل الطلب</th>
                  <th>فصيلة الدم</th>
                  <th>الوقت المتبقي</th>
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
  if (!Array.isArray(offers) || offers.length === 0)
    return <p>لم تقم بإرسال أي عروض تبرع بالدم بعد.</p>;

  return (
    <div className="my-donation-offers">
      <div className="header-bar sticky">
        <div className="title-wrap">
          <span className="title-icon">
            <i className="fas fa-hand-holding-heart" />
          </span>
          <div>
            <h3 className="main-green-title">عروضي على طلبات التبرع بالدم</h3>
            <div className="header-subtitle">
              من هنا يمكنك متابعة حالة كل عرض وإدارة التنفيذ والتقييم بسهولة.
            </div>
          </div>
        </div>

        <div className="status-filter">
          <Form.Select
            aria-label="فلترة بحسب الحالة"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="accepted">قيد التنفيذ</option>
            <option value="rated">تم التنفيذ / التقييم</option>
          </Form.Select>
        </div>
      </div>

      {/* لوحة إحصائيات سريعة */}
      <div className="stats-row">
        <div className="stat-card stat-total">
          <div className="stat-label">إجمالي العروض</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card stat-pending">
          <div className="stat-label">في الانتظار</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card stat-accepted">
          <div className="stat-label">قيد التنفيذ</div>
          <div className="stat-value">{stats.accepted}</div>
        </div>
        <div className="stat-card stat-done">
          <div className="stat-label">منفَّذة / مُقيَّمة</div>
          <div className="stat-value">{stats.fulfilled + stats.rated}</div>
        </div>
        <div className="stat-card stat-canceled">
          <div className="stat-label">ملغاة</div>
          <div className="stat-value">{stats.canceled}</div>
        </div>
      </div>

      <div style={{ height: 12 }} />
      {section(
        'العروض النشطة',
        'طلبات ما زالت مفتوحة أو قيد التنفيذ.',
        groups.active,
        openActive,
        setOpenActive,
        'success',
      )}
      {section(
        'العروض غير النشطة',
        'طلبات منتهية أو تم تنفيذها/تقييمها، أو تم إيقاف الطلب.',
        groups.inactive,
        openInactive,
        setOpenInactive,
        'secondary',
      )}
      {section(
        'العروض الملغاة',
        'العروض التي قمت بإلغائها.',
        groups.canceled,
        openCanceled,
        setOpenCanceled,
        'dark',
      )}

      {/* 🔹 مودال التقييم */}
      <Modal show={showRateModal} onHide={closeRateModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>تقييم تجربة التبرع</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {rateOffer && (
            <>
              <p className="mb-2">
                كيف تقيّم تجربتك مع هذا الطلب؟{' '}
                <span className="text-muted small d-block">
                  التقييم يساعد في بناء سمعة موثوقة داخل المنصة.
                </span>
              </p>
              <div className="d-flex flex-column gap-2 align-items-start">
                <RatingStars
                  value={rateValue}
                  onRate={(n) => setRateValue(n)}
                  disabled={ratingLoading}
                />
                {rateValue > 0 && (
                  <span className="small text-muted">اخترت: {rateValue} / 5</span>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRateModal} disabled={ratingLoading}>
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

export default MyDonationOffersBlood;

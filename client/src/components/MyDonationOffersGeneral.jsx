// src/components/MyDonationOffersGeneral.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Badge,
  Button,
  Toast,
  ToastContainer,
  Form,
  Collapse,
  Spinner,
} from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import useIsMobile from '../hooks/useIsMobile';
import './MyDonationOffersGeneral.css';

/* ==== Helpers ==== */
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

const getStatusLabel = (s) =>
  ({
    pending: 'قيد الاستلام',
    accepted: 'قيد التنسيق',
    fulfilled: 'تم التنفيذ',
    rated: 'تم التقييم',
    canceled: 'ملغى',
  }[s] || 'قيد الاستلام');

const getStatusColor = (s) =>
  ({
    pending: 'warning',
    accepted: 'primary',
    fulfilled: 'info',
    rated: 'secondary',
    canceled: 'dark',
  }[s] || 'warning');

/** 🔹 سبب كون الطلب غير نشط (موقوف / منتهي / ملغى) */
function getInactiveReasonForRequest(req, nowTick) {
  if (!req) return '';
  const status = req.status || ''; // active | paused | finished | cancelled
  const closedReason = (req.closedReason || '').trim();
  const deadline = req.deadline ? new Date(req.deadline) : null;
  const now = getNowMs(nowTick);
  const isDeadlineExpired = deadline ? deadline.getTime() <= now : false;

  if (status === 'paused') {
    if (closedReason) return closedReason;
    return 'تم إيقاف الطلب من طرف صاحبه.';
  }

  if (status === 'finished') {
    if (closedReason) return closedReason;
    if (isDeadlineExpired) return 'انتهت صلاحية الطلب (انتهى التاريخ المحدد).';
    return 'تم اعتبار الطلب منتهيًا.';
  }

  if (status === 'cancelled') {
    if (closedReason) return closedReason;
    return 'تم إلغاء هذا الطلب.';
  }

  if (isDeadlineExpired && status === 'active') {
    return 'انتهت صلاحية الطلب بسبب انتهاء التاريخ المحدد.';
  }

  return '';
}

/* ==== Component ==== */
const MyDonationOffersGeneral = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);
  const [openCanceled, setOpenCanceled] = useState(true);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('تمت العملية بنجاح');

  const now = useTicker(60_000);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem(
      'lastListPath',
      location.pathname + location.search,
    );
  }, [location.pathname, location.search]);

  const fetchMyOffers = async () => {
    try {
      // 👇 هنا نأتي بعروضي أنا (كـ متبرع) على الطلبات العامة
      const res = await fetchWithInterceptors(
        '/api/donation-request-confirmations/sent',
      );
      if (res.ok) setOffers(Array.isArray(res.body) ? res.body : []);
    } catch (err) {
      console.error('خطأ في جلب التبرعات العامة المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, []);

  // تقسيم إلى نشطة / غير نشطة / ملغاة
  const groups = useMemo(() => {
    const nowMs = getNowMs(now);
    const g = { active: [], inactive: [], canceled: [] };

    (offers || []).forEach((offer) => {
      const req = offer.request || offer.requestId || {};
      const reqStatus = req.status || 'active';
      const isReqInactive = ['paused', 'finished', 'cancelled'].includes(
        reqStatus,
      );

      const d = req.deadline ? new Date(req.deadline) : null;
      const expired = d ? d.getTime() <= nowMs : false;

      if (offer.status === 'canceled') {
        g.canceled.push(offer);
      } else if (
        isReqInactive ||
        expired ||
        offer.status === 'fulfilled' ||
        offer.status === 'rated'
      ) {
        g.inactive.push(offer);
      } else {
        g.active.push(offer);
      }
    });

    const applyStatusFilter = (list) => {
      if (!statusFilter) return list;
      if (statusFilter === 'pending')
        return list.filter((o) => o.status === 'pending');
      if (statusFilter === 'accepted')
        return list.filter((o) => o.status === 'accepted');
      if (statusFilter === 'rated')
        return list.filter(
          (o) => o.status === 'fulfilled' || o.status === 'rated',
        );
      return list;
    };

    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime();

    return {
      active: applyStatusFilter(g.active).sort(byNewest),
      inactive: applyStatusFilter(g.inactive).sort(byNewest),
      canceled: applyStatusFilter(g.canceled).sort(byNewest),
    };
  }, [offers, now, statusFilter]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem(
      'lastListScroll',
      String(window.scrollY || 0),
    );
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
          Array.isArray(prev)
            ? prev.filter((o) => o._id !== offerId)
            : [],
        );
        setToastMsg('✅ تم إلغاء العرض بنجاح.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض العام:', err);
    }
  };

  /* ====== صف الجدول ====== */
  const renderRow = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId =
      req?._id || offer.requestId?._id || offer.requestId;
    const owner = req.user || req.userId || {};
    const ownerName =
      [owner.firstName, owner.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req.deadline, now);
    const inactiveReason = getInactiveReasonForRequest(req, now);

    return (
      <tr
        key={offer._id}
        onClick={() => openDetails(reqId)}
        className="clickable-row"
        style={{ cursor: reqId ? 'pointer' : 'default' }}
      >
        <td>
          <div className="cell-main-title">
            {req.title || req.description || '—'}
          </div>
          <div className="cell-sub text-muted">
            صاحب الطلب: {ownerName}
          </div>
          <div className="cell-sub text-muted">
            المجال: {req.category || '—'}
            {req.type ? ` / ${req.type}` : ''}
            {req.place ? ` • ${req.place}` : ''}
          </div>
          {inactiveReason && (
            <div className="small text-danger mt-1">
              سبب توقف الطلب: {inactiveReason}
            </div>
          )}
        </td>
        <td>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </td>
        <td>
          <Badge bg={getStatusColor(offer.status)}>
            {getStatusLabel(offer.status)}
          </Badge>
        </td>
        <td
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {owner._id && (
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

          {(offer.status === 'pending' || offer.status === 'accepted') && (
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

  /* ====== كارت الموبايل ====== */
  const renderCard = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId =
      req?._id || offer.requestId?._id || offer.requestId;
    const owner = req.user || req.userId || {};
    const ownerName =
      [owner.firstName, owner.lastName].filter(Boolean).join(' ') || '—';
    const chip = buildDayHourChip(req.deadline, now);
    const inactiveReason = getInactiveReasonForRequest(req, now);

    return (
      <li
        key={offer._id}
        className="card-item"
        onClick={() => openDetails(reqId)}
      >
        <div className="ci-head">
          <div className="ci-title">
            {req.title || req.description || '—'}
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
          <span className="badge bg-success text-white">
            {req.category || '—'}
            {req.type ? ` / ${req.type}` : ''}
          </span>
          {req.place && (
            <span className="badge bg-light text-dark border">
              {req.place}
            </span>
          )}
          <span
            className={`badge bg-${getStatusColor(offer.status)}`}
          >
            {getStatusLabel(offer.status)}
          </span>
        </div>

        {inactiveReason && (
          <div className="small text-danger mt-1">
            سبب توقف الطلب: {inactiveReason}
          </div>
        )}

        <div
          className="ci-actions"
          onClick={(e) => e.stopPropagation()}
        >
          {owner._id && (
            <Button
              variant="outline-primary"
              size="sm"
              className="me-2 mb-1"
              onClick={() =>
                navigate(`/chat/${owner._id}`, {
                  state: { from: location.pathname + location.search },
                })
              }
            >
              💬 دردشة
            </Button>
          )}
          {(offer.status === 'pending' || offer.status === 'accepted') && (
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
            <div className="text-muted small p-3">
              لا توجد عناصر.
            </div>
          ) : isMobile ? (
            <ul className="card-list">{list.map(renderCard)}</ul>
          ) : (
            <Table
              striped
              bordered
              hover
              responsive
              className="mt-2"
            >
              <thead>
                <tr>
                  <th>تفاصيل الطلب</th>
                  <th>الوقت</th>
                  <th>الحالة</th>
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

  if (loading)
    return (
      <p className="text-center mt-4">
        ⏳ جاري تحميل عروضي على الطلبات العامة...
      </p>
    );

  if (!Array.isArray(offers) || offers.length === 0)
    return <p>لم تقم بإرسال أي عروض على الطلبات العامة بعد.</p>;

  return (
    <div className="my-donation-offers">
      <div className="header-bar mb-3">
        <div className="title-wrap">
          <span className="title-icon">
            <i className="fas fa-hand-holding-heart" />
          </span>
          <h3 className="main-green-title">
            عروضي على طلبات التبرع العامة
          </h3>
        </div>
        <div className="status-filter">
          <Form.Select
            aria-label="فلترة بحسب الحالة"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="pending">قيد الاستلام</option>
            <option value="accepted">قيد التنسيق</option>
            <option value="rated">تم التنفيذ / التقييم</option>
          </Form.Select>
        </div>
      </div>

      {section(
        'العروض النشطة',
        groups.active,
        openActive,
        setOpenActive,
        'success',
      )}
      {section(
        'العروض غير النشطة',
        groups.inactive,
        openInactive,
        setOpenInactive,
        'secondary',
      )}
      {section(
        'العروض الملغاة',
        groups.canceled,
        openCanceled,
        setOpenCanceled,
        'dark',
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

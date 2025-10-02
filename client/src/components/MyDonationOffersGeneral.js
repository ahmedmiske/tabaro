import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, TableHead, TableBody, TableRow, TableCell, Badge, Button, Toast, ToastContainer, Form, Collapse
} from './ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import './MyDonationOffersGeneral.css';

/* =============== Helpers =============== */
const getStatusLabel = (status) => {
  switch (status) {
    case 'fulfilled': return 'تم الاستلام';
    case 'rated':     return 'تم التقييم';
    case 'accepted':  return 'قيد الاستلام';
    default:          return 'قيد الاستلام';
  }
};
const getStatusColor = (status) => {
  switch (status) {
    case 'fulfilled': return 'info';
    case 'rated':     return 'secondary';
    case 'accepted':  return 'warning';
    default:          return 'warning';
  }
};
const toDateSafe = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getNowMs = (v) => (v instanceof Date ? v.getTime()
  : (typeof v === 'number' ? v : (Date.parse(v) || Date.now())));
const isExpired = (deadline, nowMs) => {
  const d = toDateSafe(deadline);
  if (!d) return false;
  return d.getTime() < getNowMs(nowMs);
};
const isActiveOffer = (offer, request, nowMs) => {
  const s = offer?.status || 'pending';
  const activeStates = ['pending', 'accepted'];
  if (!activeStates.includes(s)) return false;
  if (isExpired(request?.deadline, nowMs)) return false;
  return true;
};

/** 🔵 كبسولة دائرية: تُعيد اليوم/الساعة فقط + كلاس لوني + tooltip */
const buildDayHourChip = (deadline, nowVal) => {
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
  if (hoursTotal <= 3)  cls = 'chip--urgent';

  return { top: `${days}ي`, bottom: `${hours}س`, cls, title };
};

/* =============== Component =============== */
const MyDonationOffersGeneral = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('تمت العملية بنجاح');

  // فلترة بالحالة فقط
  const [statusFilter, setStatusFilter] = useState('');

  // أقسام قابلة للطي
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);

  const now = useTicker(60_000); // دقيقة كافية لأننا نعرض يوم/ساعة
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  const fetchMyOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-request-confirmations/sent');
      if (res.ok) {
        const list = Array.isArray(res.body) ? res.body : [];
        setOffers(list);
      }
    } catch (err) {
      console.error('خطأ في جلب العروض العامة المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchMyOffers(); }, []);

  const { activeOffers, inactiveOffers } = useMemo(() => {
    const act = [];
    const inact = [];
    (offers || []).forEach((offer) => {
      const req = offer.request || offer.requestId || {};
      if (isActiveOffer(offer, req, now)) act.push(offer);
      else inact.push(offer);
    });

    const applyStatusFilter = (list) =>
      !statusFilter
        ? list
        : list.filter((o) =>
            o.status === statusFilter ||
            (statusFilter === 'pending' && o.status === 'accepted')
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
      const res = await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers((prev) => (Array.isArray(prev) ? prev.filter((o) => o._id !== offerId) : []));
        setToastMsg('✅ تم إلغاء العرض بنجاح.');
        setShowToast(true);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض العام:', err);
    }
  };

  const renderRow = (offer) => {
    const req = offer.request || offer.requestId || {};
    const reqId = req?._id || offer.requestId?._id || offer.requestId;
    const owner = req?.user || req?.userId || {};
    const ownerName = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';

    const chip = buildDayHourChip(req?.deadline, now);

    return (
      <tr
        key={offer._id}
        onClick={() => openDetails(reqId)}
        className="clickable-row"
        style={{ cursor: reqId ? 'pointer' : 'default' }}
      >
        <td>{ownerName}</td>
        <td>{req?.category || '—'}{req?.type ? ` / ${req.type}` : ''}</td>
        <td>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </td>
        <td><Badge bg={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge></td>
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
          {(offer.status === 'pending' || offer.status === 'accepted') && !isExpired(req?.deadline, now) && (
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

  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (!Array.isArray(offers) || offers.length === 0) return <p>لم تقم بإرسال أي عروض تبرع عامة بعد.</p>;

  return (
    <div className="my-donation-offers">
      {/* العنوان + فلترة بالحالة فقط */}
      <div className="header-bar mb-3">
        <div className="title-wrap">
          <span className="title-icon"><i className="fas fa-hand-holding-heart" /></span>
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

      {/* نشطة */}
      <div className="section-card mb-3">
        <div className="section-head">
          <h6 className="m-0">العروض النشطة <Badge bg="success" className="ms-1">{activeOffers.length}</Badge></h6>
          <Button size="sm" variant="outline-secondary" onClick={() => setOpenActive(v => !v)}>
            {openActive ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openActive}>
          <div>
            {activeOffers.length === 0 ? (
              <div className="text-muted small p-3">لا توجد عروض نشطة.</div>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>صاحب الطلب</th>
                    <th>المجال/النوع</th>
                    <th>الوقت</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>{activeOffers.map(renderRow)}</tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>

      {/* غير نشطة */}
      <div className="section-card mb-3">
        <div className="section-head">
          <h6 className="m-0">العروض غير النشطة <Badge bg="secondary" className="ms-1">{inactiveOffers.length}</Badge></h6>
          <Button size="sm" variant="outline-secondary" onClick={() => setOpenInactive(v => !v)}>
            {openInactive ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openInactive}>
          <div>
            {inactiveOffers.length === 0 ? (
              <div className="text-muted small p-3">لا توجد عروض غير نشطة.</div>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>صاحب الطلب</th>
                    <th>المجال/النوع</th>
                    <th>الوقت</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>{inactiveOffers.map(renderRow)}</tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>

      <ToastContainer position="bottom-start" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={2500} autohide bg="success">
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MyDonationOffersGeneral;

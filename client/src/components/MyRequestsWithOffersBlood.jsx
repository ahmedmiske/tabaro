import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Spinner, Form, Collapse } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import useIsMobile from '../hooks/useIsMobile';
import './MyRequestsWithOffersBlood.css';

const toDateSafe = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getNowMs = (v) =>
  v instanceof Date ? v.getTime() : typeof v === 'number' ? v : Date.parse(v) || Date.now();

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
  if (hoursTotal <= 3) cls = 'chip--urgent';
  return { top: `${days}ي`, bottom: `${hours}س`, cls, title };
};

/** 🔹 سبب كون الطلب غير نشط (حسب status + deadline + closedReason) */
function getInactiveReason(req, nowVal) {
  if (!req) return '';
  const status = req.status || '';
  const closedReason = (req.closedReason || '').trim();
  const deadline = req.deadline ? new Date(req.deadline) : null;
  const now = getNowMs(nowVal);
  const expired = deadline ? deadline.getTime() <= now : false;

  if (status === 'paused') {
    if (closedReason) return closedReason;
    return 'قمت بإيقاف هذا الطلب يدويًا.';
  }

  if (status === 'finished') {
    if (closedReason) return closedReason;
    if (expired) return 'انتهت صلاحية الطلب (انتهى التاريخ المحدد).';
    return 'تم اعتبار الطلب منتهيًا.';
  }

  if (status === 'cancelled') {
    if (closedReason) return closedReason;
    return 'تم إلغاء هذا الطلب.';
  }

  if (expired && status === 'active') {
    return 'انتهت صلاحية الطلب بسبب انتهاء التاريخ المحدد.';
  }

  return '';
}

const MyRequestsWithOffersBlood = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);

  const now = useTicker(60_000);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  const fetchRequests = async () => {
    try {
      const res = await fetchWithInterceptors('/api/blood-requests/mine-with-offers');
      if (res.ok) {
        const list = Array.isArray(res.body) ? res.body : [];
        setRequests(
          list.map((r) => ({
            ...r,
            offers: Array.isArray(r.offers) ? r.offers : [],
          })),
        );
      }
    } catch (err) {
      console.error('Error loading blood requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // فلترة حسب الاستعجال
  const filtered = useMemo(() => {
    if (!urgencyFilter) return requests || [];
    return (requests || []).filter((r) =>
      urgencyFilter === 'urgent' ? !!r.isUrgent : !r.isUrgent,
    );
  }, [requests, urgencyFilter]);

  // 🔹 تقسيم حسب status فقط:
  //   activeRequests = status === "active"
  //   inactiveRequests = أي حالة أخرى (paused / finished / cancelled)
  const { activeRequests, inactiveRequests } = useMemo(() => {
    const act = [];
    const inactive = [];

    (filtered || []).forEach((r) => {
      const status = r.status || 'active';
      if (status === 'active') act.push(r);
      else inactive.push(r);
    });

    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

    return {
      activeRequests: act.sort(byNewest),
      inactiveRequests: inactive.sort(byNewest),
    };
  }, [filtered]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search;
    navigate(`/blood-donation-details/${reqId}`, { state: { from } });
  };

  const renderRow = (req, isInactive = false) => {
    const chip = buildDayHourChip(req.deadline, now);
    const offersCount = Array.isArray(req.offers) ? req.offers.length : 0;
    const inactiveReason = isInactive ? getInactiveReason(req, now) : '';

    return (
      <tr
        key={req._id}
        className={`clickable-row ${isInactive ? 'row-muted' : ''}`}
        onClick={() => openDetails(req._id)}
        style={{ cursor: 'pointer' }}
      >
        <td className="text-start">
          {req.description || '—'}
          {isInactive && inactiveReason && (
            <div className="small text-danger mt-1">سبب التوقف: {inactiveReason}</div>
          )}
        </td>
        <td>
          {req.bloodType ? (
            <span className="bloodtype-highlight-table">{req.bloodType}</span>
          ) : (
            '—'
          )}{' '}
          <Badge bg={req.isUrgent ? 'danger' : 'secondary'}>
            {req.isUrgent ? 'مستعجل' : 'عادي'}
          </Badge>
        </td>
        <td>{req.location || '—'}</td>
        <td>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </td>
        <td>
          {offersCount > 0 ? (
            <span className="offers-highlight">
              {offersCount} <i className="fas fa-gift" /> عرض
            </span>
          ) : (
            <span className="no-offers-highlight">
              <i className="fas fa-ban" /> لا توجد عروض
            </span>
          )}
        </td>
        <td
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Button size="sm" variant="primary" onClick={() => openDetails(req._id)}>
            إدارة الطلب / عرض العروض
          </Button>
        </td>
      </tr>
    );
  };

  const renderCard = (req, isInactive = false) => {
    const chip = buildDayHourChip(req.deadline, now);
    const offersCount = Array.isArray(req.offers) ? req.offers.length : 0;
    const inactiveReason = isInactive ? getInactiveReason(req, now) : '';

    return (
      <li
        key={req._id}
        className={`req-card ${isInactive ? 'is-muted' : ''}`}
        onClick={() => openDetails(req._id)}
      >
        <div className="rc-head">
          <div className="rc-title">
            {req.description || '—'}
            {isInactive && inactiveReason && (
              <div className="small text-danger mt-1">سبب التوقف: {inactiveReason}</div>
            )}
          </div>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </div>
        <div className="rc-meta">
          {req.bloodType ? (
            <span className="bloodtype-highlight-card">{req.bloodType}</span>
          ) : (
            <span className="badge bg-success">دم: —</span>
          )}
          <span className={`badge ${req.isUrgent ? 'bg-danger' : 'bg-secondary'}`}>
            {req.isUrgent ? 'مستعجل' : 'عادي'}
          </span>
          {offersCount > 0 ? (
            <span className="offers-highlight">
              {offersCount} <i className="fas fa-gift" /> عرض
            </span>
          ) : (
            <span className="no-offers-highlight">
              <i className="fas fa-ban" /> لا توجد عروض
            </span>
          )}
          <span className="badge bg-light text-dark border">{req.location || '—'}</span>
        </div>
        <div className="rc-actions">
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              openDetails(req._id);
            }}
          >
            إدارة الطلب / عرض العروض
          </Button>
        </div>
      </li>
    );
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="my-requests-with-offers">
      <div className="header-bar mb-3">
        <div className="title-wrap">
          <span className="title-icon">
            <i className="fas fa-clipboard-list" />
          </span>
          <h3 className="main-green-title">طلبات الدم الخاصة بي والعروض عليها </h3>
        </div>
        <div className="status-filter">
          <Form.Select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
          >
            <option value="">كل الحالات</option>
            <option value="urgent">مستعجل</option>
            <option value="normal">عادي</option>
          </Form.Select>
        </div>
      </div>

      {/* الطلبات النشطة فقط (status = active) */}
      <div className="section-card section-card-active mb-3">
        <div className="section-head">
          <h6 className="m-0">
            الطلبات النشطة{' '}
            <Badge bg="success" className="ms-1">
              {activeRequests.length}
            </Badge>
          </h6>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setOpenActive((v) => !v)}
          >
            {openActive ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openActive}>
          <div>
            {activeRequests.length === 0 ? (
              <div className="text-muted small p-3">
                لا توجد طلبات نشطة حسب الفلترة الحالية.
              </div>
            ) : isMobile ? (
              <ul className="card-list">
                {activeRequests.map((req) => renderCard(req, false))}
              </ul>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>النوع</th>
                    <th>الموقع</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>تفاصيل</th>
                  </tr>
                </thead>
                <tbody>{activeRequests.map((req) => renderRow(req, false))}</tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>

      {/* الطلبات غير النشطة (paused / finished / cancelled) */}
      <div className="section-card section-card-active mb-3">
        <div className="section-head">
          <h6 className="m-0">
            الطلبات غير النشطة{' '}
            <Badge bg="secondary" className="ms-1">
              {inactiveRequests.length}
            </Badge>
          </h6>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setOpenInactive((v) => !v)}
          >
            {openInactive ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openInactive}>
          <div>
            {inactiveRequests.length === 0 ? (
              <div className="text-muted small p-3">
                لا توجد طلبات غير نشطة حسب الفلترة الحالية.
              </div>
            ) : isMobile ? (
              <ul className="card-list">
                {inactiveRequests.map((req) => renderCard(req, true))}
              </ul>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>النوع</th>
                    <th>الموقع</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>تفاصيل</th>
                  </tr>
                </thead>
                <tbody>{inactiveRequests.map((req) => renderRow(req, true))}</tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default MyRequestsWithOffersBlood;

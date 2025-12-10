// src/components/MyRequestsWithOffersGeneral.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Form, Collapse, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import useTicker from '../hooks/useTicker';
import useIsMobile from '../hooks/useIsMobile';
import './MyRequestsWithOffersBlood.css'; // نعيد استعمال نفس التنسيق

/* ===== Helpers ===== */
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

const isExpired = (deadline, nowVal) => {
  const d = toDateSafe(deadline);
  if (!d) return false;
  return d.getTime() <= getNowMs(nowVal);
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

const MyRequestsWithOffersGeneral = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [openActive, setOpenActive] = useState(true);
  const [openInactive, setOpenInactive] = useState(true);

  const now = useTicker(60_000);
  const isMobile = useIsMobile(768);
  const navigate = useNavigate();
  const location = useLocation();

  // حفظ مسار القائمة للرجوع
  useEffect(() => {
    sessionStorage.setItem(
      'lastListPath',
      location.pathname + location.search,
    );
  }, [location.pathname, location.search]);

  // جلب طلباتي العامة مع العروض عليها
  const fetchRequests = async () => {
    try {
      const res = await fetchWithInterceptors(
        '/api/donation-requests/mine-with-offers',
      );
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
      console.error('Error loading general requests with offers:', err);
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

  // تقسيم الطلبات إلى نشطة / غير نشطة حسب status + انتهاء الصلاحية
  const { activeRequests, inactiveRequests } = useMemo(() => {
    const act = [];
    const inact = [];

    (filtered || []).forEach((r) => {
      const expired = isExpired(r.deadline, now);
      const status = r.status || 'active';

      const isActive = status === 'active' && !expired;
      if (isActive) act.push(r);
      else inact.push(r);
    });

    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime();

    return {
      activeRequests: act.sort(byNewest),
      inactiveRequests: inact.sort(byNewest),
    };
  }, [filtered, now]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem(
      'lastListScroll',
      String(window.scrollY || 0),
    );
    const from = location.pathname + location.search;
    navigate(`/donations/${reqId}`, { state: { from } });
  };

  /* ====== صف الجدول (دِسك توب) ====== */
  const renderRow = (req, muted = false) => {
    const chip = buildDayHourChip(req.deadline, now);
    const offersCount = Array.isArray(req.offers) ? req.offers.length : 0;

    return (
      <tr
        key={req._id}
        className={`clickable-row ${muted ? 'row-muted' : ''}`}
        onClick={() => openDetails(req._id)}
        style={{ cursor: 'pointer' }}
      >
        <td className="text-start">
          <div className="cell-main-title">
            {req.description || '—'}
          </div>
          <div className="cell-sub text-muted">
            {req.category || '—'}
            {req.type ? ` / ${req.type}` : ''}
          </div>
        </td>
        <td>{req.place || '—'}</td>
        <td>
          {typeof req.amount === 'number' ? (
            <span className="badge bg-light text-dark">
              المبلغ: {req.amount}
            </span>
          ) : (
            '—'
          )}
        </td>
        <td>
          <Badge bg={req.isUrgent ? 'danger' : 'secondary'}>
            {req.isUrgent ? 'مستعجل' : 'عادي'}
          </Badge>
        </td>
        <td>
          <span
            className={`time-chip ${chip.cls}`}
            title={chip.title}
          >
            <span className="t">{chip.top}</span>
            {chip.bottom && (
              <span className="b">{chip.bottom}</span>
            )}
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
          <Button
            size="sm"
            variant="primary"
            onClick={() => openDetails(req._id)}
          >
            إدارة الطلب / عرض العروض
          </Button>
        </td>
      </tr>
    );
  };

  /* ====== كارت الموبايل ====== */
  const renderCard = (req, muted = false) => {
    const chip = buildDayHourChip(req.deadline, now);
    const offersCount = Array.isArray(req.offers) ? req.offers.length : 0;

    return (
      <li
        key={req._id}
        className={`req-card ${muted ? 'is-muted' : ''}`}
        onClick={() => openDetails(req._id)}
      >
        <div className="rc-head">
          <div className="rc-title">
            {req.description || '—'}
          </div>
          <span
            className={`time-chip ${chip.cls}`}
            title={chip.title}
          >
            <span className="t">{chip.top}</span>
            {chip.bottom && (
              <span className="b">{chip.bottom}</span>
            )}
          </span>
        </div>

        <div className="rc-meta">
          <span className="badge bg-light text-dark border">
            {req.category || '—'}
            {req.type ? ` / ${req.type}` : ''}
          </span>
          <span className="badge bg-light text-dark border">
            {req.place || '—'}
          </span>
          {typeof req.amount === 'number' && (
            <span className="badge bg-success">
              المبلغ: {req.amount}
            </span>
          )}
          <span
            className={`badge ${
              req.isUrgent ? 'bg-danger' : 'bg-secondary'
            }`}
          >
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
        </div>

        <div
          className="rc-actions"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="primary"
            onClick={() => openDetails(req._id)}
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
          <h3 className="main-green-title">
            طلبات التبرع العامة الخاصة بي والعروض عليها
          </h3>
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

      {/* الطلبات النشطة */}
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
                {activeRequests.map((r) => renderCard(r))}
              </ul>
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
                    <th>المكان</th>
                    <th>المبلغ</th>
                    <th>الاستعجال</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>إدارة</th>
                  </tr>
                </thead>
                <tbody>{activeRequests.map((r) => renderRow(r))}</tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>

      {/* الطلبات غير النشطة */}
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
                {inactiveRequests.map((r) => renderCard(r, true))}
              </ul>
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
                    <th>المكان</th>
                    <th>المبلغ</th>
                    <th>الاستعجال</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>إدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveRequests.map((r) => renderRow(r, true))}
                </tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default MyRequestsWithOffersGeneral;

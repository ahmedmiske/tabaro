import React, { useEffect, useMemo, useState } from 'react';
import { Table, Badge, Button, Spinner, Form, Collapse } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate, useLocation } from 'react-router-dom';
import useTicker from '../hooks/useTicker';
import './MyRequestsWithOffersGeneral.css';

/* ===== Helpers ===== */
const toDateSafe = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};
const getNowMs = (v) => (v instanceof Date ? v.getTime()
  : (typeof v === 'number' ? v : (Date.parse(v) || Date.now())));
const isExpired = (deadline, nowVal) => {
  const d = toDateSafe(deadline);
  if (!d) return false;
  return d.getTime() <= getNowMs(nowVal);
};
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

const MyRequestsWithOffersGeneral = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // فلترة مستعجل/عادي (اختياري)
  const [urgencyFilter, setUrgencyFilter] = useState('');

  // أقسام قابلة للطي
  const [openActive, setOpenActive] = useState(true);
  const [openExpired, setOpenExpired] = useState(true);

  const now = useTicker(60_000);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem('lastListPath', location.pathname + location.search);
  }, [location.pathname, location.search]);

  const fetchRequests = async () => {
    try {
      // هذا المسار يجب أن يعيد طلباتك العامة مع العروض
      const res = await fetchWithInterceptors('/api/donationRequests/mine-with-offers');
      if (res.ok) {
        const list = Array.isArray(res.body) ? res.body : [];
        setRequests(list.map(r => ({ ...r, offers: Array.isArray(r.offers) ? r.offers : [] })));
      }
    } catch (err) {
      console.error('Error loading general requests:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRequests(); }, []);

  const filtered = useMemo(() => {
    if (!urgencyFilter) return requests || [];
    return (requests || []).filter((r) => urgencyFilter === 'urgent' ? !!r.isUrgent : !r.isUrgent);
  }, [requests, urgencyFilter]);

  const { activeRequests, expiredRequests } = useMemo(() => {
    const act = [];
    const exp = [];
    (filtered || []).forEach((r) => (isExpired(r.deadline, now) ? exp.push(r) : act.push(r)));
    const byNewest = (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    return {
      activeRequests: act.sort(byNewest),
      expiredRequests: exp.sort(byNewest),
    };
  }, [filtered, now]);

  const openDetails = (reqId) => {
    if (!reqId) return;
    sessionStorage.setItem('lastListScroll', String(window.scrollY || 0));
    const from = location.pathname + location.search;
    navigate(`/donations/${reqId}`, { state: { from } });
  };

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
        <td className="text-start">{req.description || '—'}</td>
        <td>
          {(req.category || '—')} / {(req.type || '—')}{' '}
          <Badge bg={req.isUrgent ? 'danger' : 'secondary'}>
            {req.isUrgent ? 'مستعجل' : 'عادي'}
          </Badge>
        </td>
        <td>{req.place || '—'}</td>
        <td>
          <span className={`time-chip ${chip.cls}`} title={chip.title}>
            <span className="t">{chip.top}</span>
            {chip.bottom && <span className="b">{chip.bottom}</span>}
          </span>
        </td>
        <td>
          {offersCount > 0
            ? <Badge bg="info">{offersCount} عرض</Badge>
            : <span className="text-muted">لا توجد عروض</span>}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="primary" onClick={() => openDetails(req._id)}>
            إدارة الطلب / عرض العروض
          </Button>
        </td>
      </tr>
    );
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  if (!Array.isArray(requests) || requests.length === 0)
    return (
      <div className="my-requests-with-offers">
        <div className="header-bar mb-3">
          <div className="title-wrap">
            <span className="title-icon"><i className="fas fa-clipboard-list" /></span>
            <h4 className="m-0 fw-bold">طلباتي (العامة) والعروض عليها</h4>
          </div>
          <div className="status-filter">
            <Form.Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
              <option value="">كل الحالات</option>
              <option value="urgent">مستعجل</option>
              <option value="normal">عادي</option>
            </Form.Select>
          </div>
        </div>
        <p className="text-center">ليس لديك أي طلبات تبرع عامة حالياً.</p>
      </div>
    );

  return (
    <div className="my-requests-with-offers">
      {/* العنوان + فلترة مستعجل/عادي */}
      <div className="header-bar mb-3">
        <div className="title-wrap">
          <span className="title-icon"><i className="fas fa-clipboard-list" /></span>
          <h4 className="m-0 fw-bold">طلباتي (العامة) والعروض عليها</h4>
        </div>
        <div className="status-filter">
          <Form.Select value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="urgent">مستعجل</option>
            <option value="normal">عادي</option>
          </Form.Select>
        </div>
      </div>

      {/* الطلبات النشطة */}
      <div className="section-card mb-3">
        <div className="section-head">
          <h6 className="m-0">
            الطلبات النشطة <Badge bg="success" className="ms-1">{activeRequests.length}</Badge>
          </h6>
          <Button size="sm" variant="outline-secondary" onClick={() => setOpenActive(v => !v)}>
            {openActive ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openActive}>
          <div>
            {activeRequests.length === 0 ? (
              <div className="text-muted small p-3">لا توجد طلبات نشطة حسب الفلترة الحالية.</div>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>التصنيف</th>
                    <th>المكان</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>تفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRequests.map((req) => renderRow(req))}
                </tbody>
              </Table>
            )}
          </div>
        </Collapse>
      </div>

      {/* الطلبات المنتهية */}
      <div className="section-card mb-3">
        <div className="section-head">
          <h6 className="m-0">
            الطلبات المنتهية <Badge bg="secondary" className="ms-1">{expiredRequests.length}</Badge>
          </h6>
          <Button size="sm" variant="outline-secondary" onClick={() => setOpenExpired(v => !v)}>
            {openExpired ? 'إخفاء' : 'عرض'}
          </Button>
        </div>
        <Collapse in={openExpired}>
          <div>
            {expiredRequests.length === 0 ? (
              <div className="text-muted small p-3">لا توجد طلبات منتهية حسب الفلترة الحالية.</div>
            ) : (
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>التصنيف</th>
                    <th>المكان</th>
                    <th>الوقت</th>
                    <th>العروض</th>
                    <th>تفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredRequests.map((req) => renderRow(req, true))}
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

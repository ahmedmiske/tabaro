import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Badge, Button, Spinner, Alert, Collapse, Image } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './ConfirmationDetails.css';

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const BLOOD_REQUEST_ROUTE   = process.env.REACT_APP_BLOOD_DETAILS_ROUTE   || '/blood-donation-details';
const GENERAL_REQUEST_ROUTE = process.env.REACT_APP_DONATION_DETAILS_ROUTE || '/donations';

const pickId = (v) => (typeof v === 'string' ? v : (v?._id || v?.id || null));
const isBloodRequestObj = (req) => {
  if (!req || typeof req !== 'object') return undefined;
  const kind = String(req.requestType || req.kind || req.category || req.type || '').toLowerCase();
  return !!(req.bloodType || req.blood_group || req.isBlood || kind === 'blood');
};
const statusVariant = (s='') => {
  const k = (s || '').toLowerCase();
  if (k === 'pending')   return 'warning';
  if (k === 'accepted')  return 'info';
  if (k === 'fulfilled') return 'primary';
  if (k === 'rated')     return 'success';
  if (k === 'canceled' || k === 'rejected') return 'secondary';
  return 'secondary';
};
const dt = (v) => (v ? new Date(v).toLocaleString('ar-MA') : '—');
const fullName = (u) => u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : '—';

export default function DonationRequestConfirmationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [data,    setData]    = useState(null);
  const [openMore, setOpenMore] = useState(true); // يبدأ مفتوحًا كما طلبت

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(''); setData(null);
      try {
        const res = await fetchWithInterceptors(`/api/donation-request-confirmations/${id}`);
        if (res?.ok && (res.body || res.data)) {
          setData(res.body?.data || res.body || res.data);
        } else {
          setError('لم يتم العثور على تأكيد طلب التبرع.');
        }
      } catch {
        setError('حدث خطأ أثناء التحميل.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const back = () => navigate(location.state?.from || '/notifications');

  const reqCandidate = data?.request || data?.requestId || data?.requestRef;
  const reqId = pickId(reqCandidate);
  const isBloodReq = isBloodRequestObj(typeof reqCandidate === 'object' ? reqCandidate : data?.request);

  const openRequest = () => { if (reqId) navigate(`${isBloodReq ? BLOOD_REQUEST_ROUTE : GENERAL_REQUEST_ROUTE}/${reqId}`); };

  const donor = data?.donor || data?.sender || data?.user;
  const donorId = donor?._id || donor?.id;
  const openChat = () => { if (donorId) navigate(`/chat/${donorId}`); };
  const openDonorProfile = () => { if (donorId) navigate(`/users/${donorId}`); };

  if (loading) {
    return <div className="p-4 text-center text-muted"><Spinner animation="border" size="sm" /> جاري التحميل...</div>;
  }
  if (error) {
    return (
      <div className="container py-3 confirm-details">
        <div className="top-actions"><Button variant="outline-secondary" onClick={back}>⬅ رجوع</Button></div>
        <Alert variant="danger" className="mb-3">{error}</Alert>
      </div>
    );
  }

  const status = data?.status || '—';
  const amount = data?.amount ?? data?.value ?? data?.quantity ?? '—';

  return (
    <div className="container py-3 confirm-details">
      <div className="top-actions"><Button variant="outline-secondary" onClick={back}>⬅ رجوع</Button></div>

      <Card className="shadow-sm cd-card wide">
        <Card.Body>
          <div className="cd-head has-chips">
            <div className="head-left">
              <h5 className="fw-bold m-0">تأكيد تبرّع عام</h5>
              <div className="cd-head-sub"><span className="mono">{id}</span><span className="dot">•</span><span>{dt(data?.createdAt)}</span></div>
            </div>
            <div className="head-right">
              <Badge bg={statusVariant(status)} className="me-2">{status}</Badge>
              <span className="chip chip-amount">💵 {amount}</span>
            </div>
          </div>

          {/* المتبرّع */}
          <div className="cd-section">
            <div className="cd-title">المتبرّع</div>
            <div className="donor-row">
              <Image
                src={resolveAvatar(donor?.profileImage)}
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')}
                roundedCircle width={64} height={64} alt="donor"
              />
              <div className="donor-info">
                <div className="donor-name">{fullName(donor)}</div>
                <div className="donor-actions">
                  <Button size="sm" variant="primary" onClick={openChat} disabled={!donorId}>💬 مراسلة</Button>
                  <Button size="sm" variant="outline-primary" onClick={openDonorProfile} disabled={!donorId}>👤 ملف المتبرّع</Button>
                  {reqId && <Button size="sm" variant="outline-secondary" onClick={openRequest}>👁️ تفاصيل الطلب</Button>}
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل إضافية (الوصف + الوثائق + الزمن) */}
          <div className="cd-section">
            <div className="d-flex align-items-center justify-content-between">
              <div className="cd-title">تفاصيل إضافية</div>
              <Button size="sm" variant="light" className="btn-soft" onClick={() => setOpenMore(v => !v)}>
                {openMore ? 'إخفاء' : 'عرض التفاصيل'}
              </Button>
            </div>

            <Collapse in={openMore}>
              <div>
                {data?.message && (
                  <div className="kv multi">
                    <span>الوصف</span>
                    <p className="prewrap">{data.message}</p>
                  </div>
                )}

                {Array.isArray(data?.proofFiles) && data.proofFiles.length > 0 && (
                  <>
                    <div className="cd-subtitle">الوثائق</div>
                    <ul className="file-list">
                      {data.proofFiles.map((p, i) => (
                        <li key={i}><a href={p} target="_blank" rel="noreferrer">ملف #{i+1}</a></li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="cd-subtitle">الزمن</div>
                <div className="kv"><span>تاريخ الإنشاء</span><span>{dt(data?.createdAt)}</span></div>
                {data?.acceptedAt   && <div className="kv"><span>تاريخ القبول</span><span>{dt(data.acceptedAt)}</span></div>}
                {data?.fulfilledAt  && <div className="kv"><span>تاريخ التنفيذ</span><span>{dt(data.fulfilledAt)}</span></div>}
                {data?.proposedTime && <div className="kv"><span>موعد مقترح</span><span>{dt(data.proposedTime)}</span></div>}
              </div>
            </Collapse>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

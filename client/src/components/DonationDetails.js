import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Card, Spinner, Table, Alert, Form } from './ui';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import useTicker from '../hooks/useTicker';
import { formatRemaining } from '../utils/time';
import './Details.css';
import './DonationDetails.css';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function RatingStars({ value = 0, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const score = hover || value;
  return (
    <div role="radiogroup" aria-label="التقييم" dir="ltr" style={{ display:'inline-flex', gap:6 }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          role="radio"
          aria-checked={score === n}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange?.(n)}
          style={{
            border:'none', background:'transparent',
            cursor: disabled ? 'default' : 'pointer',
            fontSize:22, lineHeight:1,
            color: (score >= n) ? '#FFC107' : '#E0E0E0',
          }}
          title={`${n} / 5`} aria-label={`${n} من 5`} disabled={disabled}
        >★</button>
      ))}
    </div>
  );
}
RatingStars.propTypes = { value: PropTypes.number, onChange: PropTypes.func, disabled: PropTypes.bool };

const statusLabel = (s) => ({
  pending: 'قيد الاستلام',
  accepted: 'تم الاستلام',
  fulfilled: 'تم التنفيذ',
  rated: 'تم التقييم',
}[s] || 'قيد الاستلام');
const statusVariant = (s) => ({
  pending: 'warning',
  accepted: 'info',
  fulfilled: 'primary',
  rated: 'secondary',
}[s] || 'warning');

function progressPercent(createdAt, deadline, now) {
  if (!deadline || !createdAt) return 0;
  const end = new Date(deadline), start = new Date(createdAt);
  if (Number.isNaN(end) || Number.isNaN(start)) return 0;
  const total = end - start, elapsed = new Date(now) - start;
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));
}

export default function DonationDetails() {
  const { id } = useParams();
  const q = useQuery();
  const back = q.get('back') || '/profile?view=req-general';
  const defaultTab = q.get('tab') || 'offers';

  const [tab, setTab] = useState(defaultTab);
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  const now = useTicker(1000);
  const navigate = useNavigate();
  const me = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

  const fetchData = async () => {
    try {
      const [reqRes, offRes] = await Promise.all([
        fetchWithInterceptors(`/api/donationRequests/${id}`),
        fetchWithInterceptors(`/api/donation-request-confirmations/request/${id}`),
      ]);
      if (reqRes.ok) setRequest(reqRes.body?.data || reqRes.body || null);
      const list = offRes.ok ? (Array.isArray(offRes.body) ? offRes.body : (offRes.body?.data || [])) : [];
      setOffers(list);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [id]);

  const owner = request?.userId || request?.user;
  const isOwner = owner && String(owner._id || owner) === String(me._id);
  const ownerName = owner ? [owner.firstName, owner.lastName].filter(Boolean).join(' ') : '—';

  const isExpired = (deadline) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    return Number.isNaN(d.getTime()) ? false : d < new Date();
  };

  const handleFulfill = async (offerId) => {
    const res = await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}/fulfill`, { method:'PATCH' });
    if (res.ok) fetchData();
  };
  const handleRate = async (offerId, score) => {
    const res = await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}/rate`, {
      method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ rating: score })
    });
    if (res.ok) fetchData();
  };

  // ---------- لوحة "أريد التبرع" (لغير المالك) ----------
  const [gMessage, setGMessage] = useState('');
  const [gMethod, setGMethod] = useState('call');
  const [gProposed, setGProposed] = useState('');
  const [gAmount, setGAmount] = useState('');
  const [gFiles, setGFiles] = useState([]);

  const submitGeneralDonation = async (e) => {
    e.preventDefault();
    try {
      setCreating(true); setCreateMsg(null);
      const fd = new FormData();
      fd.set('requestId', id);
      if (gMessage) fd.set('message', gMessage);
      if (gAmount) fd.set('amount', gAmount);
      if (gMethod) fd.set('method', gMethod);
      if (gProposed) fd.set('proposedTime', gProposed);
      // نفس اسم الحقل في الراوتر: .array('files',10)
      Array.from(gFiles || []).forEach(f => fd.append('files', f));

      const res = await fetchWithInterceptors('/api/donation-request-confirmations', {
        method:'POST', body: fd
      });
      if (res.ok) {
        setCreateMsg({ type:'success', text:'تم إرسال تأكيد تبرعك، شكرًا لعطائك ❤️' });
        setGMessage(''); setGAmount(''); setGMethod('call'); setGProposed(''); setGFiles([]);
        fetchData();
      } else {
        setCreateMsg({ type:'danger', text: res.body?.message || 'تعذّر الإرسال' });
      }
    } catch {
      setCreateMsg({ type:'danger', text:'تعذّر الإرسال' });
    } finally { setCreating(false); }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!request) return <p className="text-center">الطلب غير موجود.</p>;

  const expired = isExpired(request.deadline);
  const percent = progressPercent(request.createdAt || request.date, request.deadline, now);

  return (
    <div className="details-page">
      <div className="details-hero">
        <div className="details-hero__header">
          <h2 className="hero-title">تفاصيل طلب التبرع</h2>
        </div>

        <div className="hero-progress-wrap">
          <div className="hero-progress">
            <div className="hero-progress__bar" style={{ width: `${percent}%` }} />
          </div>
          <Badge bg="primary" className="ms-2">{formatRemaining(request.deadline, now)}</Badge>
          <div className="hero-badges">
            {request.place && <span className="pill pill-green">{request.place}</span>}
            {request.isUrgent && <span className="pill pill-red">مستعجل</span>}
            {(request.category || request.type) && (
              <span className="pill pill-gray">{request.category || ''}{request.type ? ` - ${request.type}` : ''}</span>
            )}
            {request.amount ? <span className="pill pill-blue">{Number(request.amount).toLocaleString()} د.م</span> : null}
          </div>
        </div>
      </div>

      <Card className="details-card w-100 mb-3" style={{ maxWidth:1200, margin:'0 auto' }}>
        <Card.Body className="p-3">
          <div className={`publisher-card ${owner?.profileImage ? '' : 'no-avatar'} ${isOwner ? 'is-owner' : 'hoverable'}`}>
            {owner?.profileImage ? (
              <img className="pub-avatar" src={`/uploads/profileImages/${owner.profileImage}`} alt="الناشر" />
            ) : null}
            <div className="pub-info">
              <div className="pub-name">{ownerName}</div>
              {request.place && <div className="text-muted small">{request.place}</div>}
              {request.description && <div className="publisher-extra text-muted small">{request.description}</div>}
            </div>
            {!isOwner && owner?._id && (
              <div className="ms-auto">
                <Button variant="outline-success" size="sm" onClick={() => navigate(`/chat/${owner._id}`)}>💬 محادثة</Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {isOwner ? (
        <>
          <div className="d-flex gap-2 w-100 mb-3" style={{ maxWidth:1200, margin:'0 auto' }}>
            <Button variant={tab === 'offers' ? 'primary' : 'light'} onClick={() => setTab('offers')}>العروض ({offers.length})</Button>
          </div>

          <Card className="details-card offers-table w-100" style={{ maxWidth:1200, margin:'0 auto' }}>
            <Table striped bordered hover responsive className="m-0">
              <thead>
                <tr>
                  <th>المتبرع</th>
                  <th className="col-sm-hide">تاريخ العرض</th>
                  <th>الحالة</th>
                  <th className="actions-col">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted">لا توجد عروض حتى الآن.</td></tr>
                )}
                {offers.map(ofr => {
                  const donor = ofr.donor || {};
                  const donorName = [donor.firstName, donor.lastName].filter(Boolean).join(' ') || '—';
                  const canManage = !expired;
                  const canRate   = ofr.status === 'fulfilled' || ofr.status === 'rated';
                  return (
                    <tr key={ofr._id}>
                      <td>{donorName}</td>
                      <td className="col-sm-hide">{ofr.createdAt ? new Date(ofr.createdAt).toLocaleString() : '—'}</td>
                      <td><Badge bg={statusVariant(ofr.status)}>{statusLabel(ofr.status)}</Badge></td>
                      <td className="actions-col">
                        <div className="d-flex flex-wrap gap-2">
                          {donor?._id && (
                            <Button size="sm" variant="outline-primary" onClick={() => navigate(`/chat/${donor._id}`)}>💬 محادثة</Button>
                          )}
                          {canManage && (ofr.status === 'pending' || ofr.status === 'accepted') && (
                            <Button size="sm" variant="success" onClick={() => handleFulfill(ofr._id)}>✅ تأكيد الاستلام</Button>
                          )}
                          {canManage && canRate && (
                            <div className="d-inline-flex align-items-center gap-2">
                              <span className="text-muted small">تقييمك:</span>
                              <RatingStars
                                value={ofr.ratingByRecipient || 0}
                                onChange={(n) => handleRate(ofr._id, n)}
                                disabled={!!ofr.ratingByRecipient}
                              />
                            </div>
                          )}
                          {!canManage && (ofr.ratingByRecipient > 0) && (
                            <div className="d-inline-flex align-items-center gap-1">
                              <span className="text-muted small">تقييم المستلم:</span>
                              <RatingStars value={ofr.ratingByRecipient} disabled />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>
        </>
      ) : (
        <Card className="details-card w-100" style={{ maxWidth:1200, margin:'0 auto' }}>
          <Card.Header className="bg-light"><strong>أريد التبرع</strong></Card.Header>
          <Card.Body>
            {createMsg && <Alert variant={createMsg.type}>{createMsg.text}</Alert>}
            <Form onSubmit={submitGeneralDonation} className="d-grid gap-3">
              <Form.Group>
                <Form.Label>الرسالة (اختياري)</Form.Label>
                <Form.Control as="textarea" rows={3} value={gMessage} onChange={(e)=>setGMessage(e.target.value)} />
              </Form.Group>

              <div className="d-flex flex-wrap gap-3">
                <Form.Group>
                  <Form.Label>المبلغ (اختياري)</Form.Label>
                  <Form.Control type="number" min="0" value={gAmount} onChange={(e)=>setGAmount(e.target.value)} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>طريقة التواصل</Form.Label>
                  <Form.Select value={gMethod} onChange={(e)=>setGMethod(e.target.value)}>
                    <option value="call">اتصال</option>
                    <option value="phone">هاتف</option>
                    <option value="whatsapp">واتساب</option>
                    <option value="chat">محادثة داخلية</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label>وقت مقترح (اختياري)</Form.Label>
                  <Form.Control type="datetime-local" value={gProposed} onChange={(e)=>setGProposed(e.target.value)} />
                </Form.Group>
              </div>

              <Form.Group>
                <Form.Label>ملفات إثبات (اختياري)</Form.Label>
                <Form.Control type="file" multiple onChange={(e)=>setGFiles(e.target.files)} />
                <div className="form-text">يمكن رفع صور/ملفات حتى 10 ملفات.</div>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button type="submit" disabled={creating || expired}>إرسال التأكيد</Button>
                {owner?._id && (
                  <Button variant="outline-primary" onClick={() => navigate(`/chat/${owner._id}`)}>💬 محادثة</Button>
                )}
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      <div className="d-flex justify-content-between align-items-center w-100 my-3" style={{ maxWidth:1200, margin:'0 auto' }}>
        <Button variant="outline-secondary" onClick={() => navigate(back)}>← رجوع</Button>
        <span />
      </div>
    </div>
  );
}

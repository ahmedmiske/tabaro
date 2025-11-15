import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, Card, Spinner, Table, Alert, Form } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { assetUrl } from '../utils/urls';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import useTicker from '../hooks/useTicker';
import { formatRemaining } from '../utils/time';
import './BloodDonationDetails.css';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

/* نجوم تقييم */
function RatingStars({ value = 0, onChange, disabled = false }) {
  const [hover, setHover] = useState(0);
  const score = hover || value;
  return (
    <div role="radiogroup" aria-label="التقييم" dir="ltr" style={{ display: 'inline-flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={score === n}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => !disabled && setHover(0)}
          onClick={() => !disabled && onChange?.(n)}
          style={{
            border: 'none', background: 'transparent', cursor: disabled ? 'default' : 'pointer',
            fontSize: 22, lineHeight: 1, color: (score >= n) ? '#FFC107' : '#E0E0E0',
          }}
          title={`${n} / 5`} aria-label={`${n} من 5`} disabled={disabled}
        >
          ★
        </button>
      ))}
    </div>
  );
}
RatingStars.propTypes = { value: PropTypes.number, onChange: PropTypes.func, disabled: PropTypes.bool };

/* حالات العروض */
const statusLabel = (s) => ({ pending: 'قيد الاستلام', accepted: 'تم الاستلام', fulfilled: 'تم التنفيذ', rated: 'تم التقييم' }[s] || 'قيد الاستلام');
const statusVariant = (s) => ({ pending: 'warning', accepted: 'info', fulfilled: 'primary', rated: 'secondary' }[s] || 'warning');

/* أدوات مساعدة */
function resolveAvatar(src) {
  if (!src) return '/default-avatar.png';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/uploads/')) return assetUrl(src);
  return assetUrl(`/uploads/profileImages/${src}`);
}

/* 👇 تحويل أي \ إلى / */
const toForward = (s) => String(s || '').replace(/\\/g, '/');

/* 👇 كشف PDF بشكل موثوق */
function isPdfDoc(d) {
  const bag = [d?.mime, d?.mimetype, d?.url, d?.path, d?.name]
    .filter(Boolean)
    .map(String)
    .join(' ')
    .toLowerCase();
  return bag.includes('application/pdf') || /\.pdf($|\?)/i.test(bag);
}

/* تطبيع الوثائق */
function normalizeDocuments(req) {
  const buckets = [
    ...(Array.isArray(req?.documents) ? req.documents : []),
    ...(Array.isArray(req?.proofDocuments) ? req.proofDocuments : []),
    ...(Array.isArray(req?.attachments) ? req.attachments : []),
    ...(Array.isArray(req?.files) ? req.files : []),
  ];

  return buckets
    .map((d) => {
      const raw = toForward(typeof d === 'string' ? d : (d.path || d.url || d.src || ''));
      if (!raw) return null;
      const url = assetUrl(raw);
      const name = (typeof d === 'string' ? d : (d.name || raw)).split('/').pop() || 'document';
      const mime = (typeof d === 'string') ? ( /\.pdf($|\?)/i.test(d) ? 'application/pdf' : '' )
                                           : (d.mime || d.mimetype || ( /\.pdf($|\?)/i.test(raw) ? 'application/pdf' : '' ));
      return { url, path: raw, name, mime };
    })
    .filter(Boolean);
}

/* وسائل تواصل */
function normalizeRequestContacts(req) {
  const fromReq = Array.isArray(req?.contactMethods) ? req.contactMethods : [];
  return fromReq
    .filter((it) => it?.method && it?.number)
    .map((it) => ({
      method: it.method,
      label: it.method === 'whatsapp' ? 'واتساب' : 'الهاتف',
      icon: it.method === 'whatsapp' ? '🟢' : '📞',
      value: it.number,
    }));
}
function personContacts(person) {
  const out = [];
  if (person?.phoneNumber) out.push({ icon: '📱', label: 'الهاتف', value: person.phoneNumber });
  if (person?.email) out.push({ icon: '✉️', label: 'البريد', value: person.email });
  return out;
}

export default function BloodDonationDetails() {
  const { id } = useParams();
  const q = useQuery();
  const defaultTab = q.get('tab') || 'offers';

  const [tab, setTab] = useState(defaultTab);
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);
  const [msg, setMsg] = useState('');
  const [proposedTime, setProposedTime] = useState('');

  const now = useTicker(1000);
  const navigate = useNavigate();
  const me = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

  const fetchData = async () => {
    try {
      const [reqRes, offRes] = await Promise.all([
        fetchWithInterceptors(`/api/blood-requests/${id}`),
        fetchWithInterceptors(`/api/donation-confirmations/request/${id}`),
      ]);
      if (reqRes.ok) setRequest(reqRes.body?.data || reqRes.body || null);
      if (offRes.ok) setOffers(Array.isArray(offRes.body) ? offRes.body : (offRes.body?.data || []));
    } catch (e) {
      console.error('Load details error:', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [id]);

  /* الناشر/المالك */
  const requester = request?.requester || request?.beneficiary || request?.userId || request?.user || {};
  const publisher  = request?.publisher || request?.publishedBy || request?.createdBy || requester;

  const requesterName   = [requester.firstName, requester.lastName].filter(Boolean).join(' ') || '—';
  const publisherName   = [publisher.firstName, publisher.lastName].filter(Boolean).join(' ') || '—';
  const requesterAvatar = resolveAvatar(requester.profileImage);
  const publisherAvatar = resolveAvatar(publisher.profileImage);

  const isOwner       = requester && String(requester._id || requester) === String(me._id);
  const amPublisher   = publisher && String(publisher._id || publisher) === String(me._id);
  const isSelfContext = isOwner || amPublisher;
  const twoDifferent  = requester?._id && publisher?._id && String(requester._id) !== String(publisher._id);

  const myOffer = useMemo(() => {
    const uid = String(me?._id || '');
    return (offers || []).find((o) => String(o?.donor?._id || o?.donor) === uid) || null;
  }, [offers, me]);

  const isExpired = (deadline) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    return Number.isNaN(d.getTime()) ? false : d < new Date();
  };

  const handleFulfill = async (offerId) => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/fulfill`, { method: 'PATCH' });
      if (res.ok) fetchData();
    } catch (e) { console.error('fulfill failed', e); }
  };
  const handleRate = async (offerId, score) => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/rate`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: score }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error('rate failed', e); }
  };
  const handleCancelMine = async () => {
    if (!myOffer) return;
    if (!window.confirm('هل تريد إلغاء إعلان تبرعك؟')) return;
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${myOffer._id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (e) { console.error('cancel failed', e); }
  };

  const submitDonation = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateMsg(null);
      const res = await fetchWithInterceptors('/api/donation-confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: id,
          message: msg,
          proposedTime: proposedTime || undefined,
          method: 'chat', // اختيارية (افتراضي في السيرفر)
        }),
      });
      if (res.ok) {
        setCreateMsg({ type: 'success', text: res.body?.already ? 'لديك إعلان سابق لهذا الطلب.' : 'تم إرسال إعلان تبرعك، شكرًا لك ❤️' });
        setMsg(''); setProposedTime(''); fetchData();
      } else setCreateMsg({ type: 'danger', text: res.body?.message || 'تعذّر الإرسال' });
    } catch {
      setCreateMsg({ type: 'danger', text: 'تعذّر الإرسال' });
    } finally { setCreating(false); }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!request) return <p className="text-center">لم يتم العثور على الطلب.</p>;

  const documents          = normalizeDocuments(request);
  const reqContacts        = normalizeRequestContacts(request);
  const publisherContacts  = personContacts(publisher);
  const requesterContacts  = personContacts(requester);

  return (
    <div className="blood-details-container">
      <Card className="details-card w-100 mb-3" style={{ maxWidth: 1200 }}>
        <Card.Header className="details-header-compact text-white">
          <div className="d-flex justify-content-between align-items-center ">
            <Button
              variant="outline-light" size="sm"
              onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/profile?view=req-blood'); }}
            >
              ← رجوع
            </Button>
            <div className="fw-bold"  >
             <h5> تفاصيل طلب التبرع بالدم </h5>
              {request.bloodType && <Badge bg="green" className="me-2">🩸 {request.bloodType}</Badge>}
            </div>
            <span />
          </div>
        </Card.Header>

        <Card.Body className="p-3">
          {/* الناشر */}
          <div className="section-card">
            <div className="publisher-strip">
              {!isSelfContext && <img className="pub-avatar" src={publisherAvatar} alt="الناشر" />}
              <div className="pub-text">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="role-chip publisher">الناشر</span>
                  <div className="pub-name">{publisherName}</div>
                  {isSelfContext && <span className="self-chip">أنت صاحب هذا الطلب</span>}
                </div>
                {twoDifferent && (
                  <div className="small text-muted">
                    صاحب الطلب: <strong>{requesterName}</strong>
                  </div>
                )}
              </div>
              {!isSelfContext && publisher?._id && (
                <div className="ms-auto d-flex flex-wrap gap-2">
                  <Button variant="outline-success" size="sm" onClick={() => navigate(`/chat/${publisher._id}`)}>💬 محادثة</Button>
                  <Button variant="outline-primary" size="sm" onClick={() => navigate(`/users/${publisher._id}`)}>👤 الملف الشخصي</Button>
                </div>
              )}
            </div>
          </div>

          {/* تفاصيل الطلب */}
          <div className="section-card mt-3">
            <div className="section-title">تفاصيل الطلب</div>
            <div className="meta-row">
              <span className="chip">🩸 الفصيلة: <strong>{request.bloodType || '—'}</strong></span>
              <span className="chip"><span className="icon">📍</span>الموقع: <strong>{request.location || '—'}</strong></span>
              <span className="chip">⏳ المهلة: <strong>{formatRemaining(request.deadline, now)}</strong></span>
              <span className={`chip ${request.isUrgent ? 'danger' : ''}`}>{request.isUrgent ? 'مستعجل' : 'عادي'}</span>
            </div>
            {request.description && (
              <div className="text-muted small mt-2" style={{ whiteSpace: 'pre-wrap' }}>
                {request.description}
              </div>
            )}
          </div>

          {/* وسائل التواصل */}
          {(publisherContacts.length > 0 || reqContacts.length > 0 || requesterContacts.length > 0) && (
            <div className="section-card mt-3">
              <div className="section-title">وسائل التواصل</div>

              {publisherContacts.length > 0 && (
                <>
                  <div className="subsection-title">الناشر</div>
                  <div className="contact-row">
                    {publisherContacts.map((c, i) => (
                      <span key={`pub-${i}`} className="contact-chip">{c.icon} {c.label}: {c.value}</span>
                    ))}
                  </div>
                </>
              )}

              {twoDifferent && requesterContacts.length > 0 && (
                <>
                  <div className="subsection-title">صاحب الطلب</div>
                  <div className="contact-row">
                    {requesterContacts.map((c, i) => (
                      <span key={`reqr-${i}`} className="contact-chip">{c.icon} {c.label}: {c.value}</span>
                    ))}
                  </div>
                </>
              )}

              {reqContacts.length > 0 && (
                <>
                  <div className="subsection-title">الخاصة بالطلب</div>
                  <div className="contact-row">
                    {reqContacts.map((c) => (
                      <span key={`${c.method}-${c.value}`} className="contact-chip">
                        {c.icon} {c.label}: {c.value}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* الوثائق */}
          {documents.length > 0 && (
            <div className="section-card mt-3">
              <div className="section-title">الوثائق الداعمة</div>
              <div className="docs-grid">
                {documents.map((d, i) => {
                  const pdf = isPdfDoc(d);
                  const openInNewTab = (url) => window.open(url, '_blank', 'noopener,noreferrer');
                  const onTileKey = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInNewTab(d.url); }
                  };
                  return (
                    <div
                      key={i}
                      className="doc-tile"
                      role="button"
                      tabIndex={0}
                      onClick={() => openInNewTab(d.url)}
                      onKeyDown={onTileKey}
                    >
                      <div className="doc-thumb">
                        {pdf ? (
                          <div className="pdf-thumb">
                            <span className="pdf-emoji">📄</span>
                            <span className="pdf-text">PDF</span>
                          </div>
                        ) : (
                          <img src={d.url} alt={d.name || 'document'} />
                        )}
                      </div>
                      <div className="doc-name" title={d.name}>{d.name || 'ملف'}</div>
                      <div className="doc-actions">
                        <a className="btn btn-sm btn-outline-primary" href={d.url} target="_blank" rel="noopener noreferrer">فتح</a>
                        <a className="btn btn-sm btn-outline-secondary" href={d.url} download>تنزيل</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* العروض أو نموذج التبرع */}
      {isOwner ? (
        <>
          <div className="d-flex gap-2 w-100 mb-3" style={{ maxWidth: 1200 }}>
            <Button variant={tab === 'offers' ? 'primary' : 'light'} onClick={() => setTab('offers')}>
              العروض ({offers.length})
            </Button>
          </div>

          <Card className="details-card offers-table w-100" style={{ maxWidth: 1200 }}>
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
                {offers.map((ofr) => {
                  const donor = ofr.donor || {};
                  const donorName = [donor.firstName, donor.lastName].filter(Boolean).join(' ') || '—';
                  const canManage = !isExpired(request.deadline);
                  const canRate = ofr.status === 'fulfilled' || ofr.status === 'rated';
                  return (
                    <tr key={ofr._id}>
                      <td>{donorName}</td>
                      <td className="col-sm-hide">{ofr.createdAt ? new Date(ofr.createdAt).toLocaleString() : '—'}</td>
                      <td><Badge bg={statusVariant(ofr.status)}>{statusLabel(ofr.status)}</Badge></td>
                      <td className="actions-col">
                        <div className="d-flex flex-wrap gap-2">
                          {donor?._id && (
                            <Button size="sm" variant="outline-primary" onClick={() => navigate(`/chat/${donor._id}`)}>
                              💬 محادثة
                            </Button>
                          )}
                          {canManage && (ofr.status === 'pending' || ofr.status === 'accepted') && (
                            <Button size="sm" variant="success" onClick={() => handleFulfill(ofr._id)}>
                              ✅ تأكيد الاستلام
                            </Button>
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
        <Card className="details-card w-100" style={{ maxWidth: 1200 }}>
          <Card.Header className="bg-light"><strong>أريد التبرع</strong></Card.Header>
          <Card.Body>
            {createMsg && <Alert variant={createMsg.type}>{createMsg.text}</Alert>}

            {myOffer ? (
              <div className="d-grid gap-2">
                <div>
                  لقد أعلنت تبرعك لهذا الطلب في{' '}
                  <strong>{myOffer.createdAt ? new Date(myOffer.createdAt).toLocaleString() : '—'}</strong>،
                  وحالة إعلانك الآن: <Badge bg={statusVariant(myOffer.status)}>{statusLabel(myOffer.status)}</Badge>.
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {requester?._id && (
                    <>
                      <Button variant="outline-primary" onClick={() => navigate(`/chat/${requester._id}`)}>💬 محادثة صاحب الطلب</Button>
                      <Button variant="outline-secondary" onClick={() => navigate(`/users/${requester._id}`)}>👤 الملف الشخصي</Button>
                    </>
                  )}
                  {myOffer.status === 'pending' && (
                    <Button variant="outline-danger" onClick={handleCancelMine}>إلغاء الإعلان</Button>
                  )}
                </div>
              </div>
            ) : (
              <Form onSubmit={submitDonation} className="d-grid gap-3">
                <Form.Group>
                  <Form.Label>رسالتك (اختياري)</Form.Label>
                  <Form.Control as="textarea" rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} />
                </Form.Group>

                <Form.Group>
                  <Form.Label>وقت مقترح (اختياري)</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" disabled={creating || isExpired(request.deadline)}>إرسال الإعلان</Button>
                  {requester?._id && (
                    <>
                      <Button variant="outline-success" onClick={() => navigate(`/chat/${requester._id}`)}>💬 محادثة صاحب الطلب</Button>
                      <Button variant="outline-secondary" onClick={() => navigate(`/users/${requester._id}`)}>👤 الملف الشخصي</Button>
                    </>
                  )}
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

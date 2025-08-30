import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate } from 'react-router-dom';
import './MyRequestsWithOffersGeneral.css';

const MyRequestsWithOffersGeneral = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRequests = async () => {
    try {
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

  const isExpired = (deadline) => {
    if (!deadline) return false;
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) return false;
    return d < new Date();
  };

  const toggleExpand = (id) => setExpandedRequestId(expandedRequestId === id ? null : id);

  const handleFulfill = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}/fulfill`, { method: 'PATCH' });
    fetchRequests();
  };

  const handleRate = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}/rate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5 }), // TODO: اربطه بمودال تقييم لاحقًا
    });
    fetchRequests();
  };

  const statusBadge = (status) => {
    const map = {
      pending:   { text: 'قيد الاستلام', variant: 'warning' },
      accepted:  { text: 'قيد الاستلام', variant: 'warning' }, // توافق قديم
      fulfilled: { text: 'تم الاستلام',  variant: 'info' },
      rated:     { text: 'تم التقييم',   variant: 'secondary' },
    };
    const conf = map[status] || map.pending;
    return <Badge bg={conf.variant}>{conf.text}</Badge>;
  };

  const renderRequestRow = (req, expired = false) => (
    <React.Fragment key={req._id}>
      <tr className={expired ? 'bg-light text-muted' : ''}>
        <td>{req.description || '—'}</td>
        <td>
          {(req.category || '—')} / {(req.type || '—')}{' '}
          <Badge bg={req.isUrgent ? 'danger' : 'secondary'}>
            {req.isUrgent ? 'مستعجل' : 'عادي'}
          </Badge>
        </td>
        <td>{req.place || '—'}</td>
        <td>{req.amount ? Number(req.amount).toLocaleString('ar-MA') : '—'}</td>
        <td>{req.deadline ? new Date(req.deadline).toLocaleDateString() : '—'}</td>
        <td>
          {(req.offers || []).length > 0
            ? <Badge bg="info">{req.offers.length} عرض</Badge>
            : <span className="text-muted">لا توجد عروض</span>}
        </td>
        <td>
          <Button size="sm" className="me-2 mb-1" onClick={() => req._id && navigate(`/donations/${req._id}`)}>
            تفاصيل أكثر
          </Button>
          <Button size="sm" variant="info" className="mb-1" onClick={() => toggleExpand(req._id)}>
            {expandedRequestId === req._id ? 'إخفاء العروض' : 'عرض العروض'}
          </Button>
        </td>
      </tr>

      {expandedRequestId === req._id &&
        (req.offers || []).length > 0 &&
        (req.offers || []).map((offer) => (
          <tr key={offer._id} className="bg-white">
            <td colSpan="7">
              <strong>المتبرع:</strong> {offer?.donor?.firstName || ''} {offer?.donor?.lastName || ''}<br />
              <strong>الرسالة:</strong> {offer.message || '—'}<br />
              <strong>التاريخ:</strong> {offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : '—'}<br />
              <strong>الحالة:</strong> {statusBadge(offer.status)}

              <div className="mt-2 d-flex flex-wrap gap-2">
                {String(offer.recipientId || req.user) === String(currentUser._id) && !isExpired(req.deadline) && (
                  <>
                    {(offer.status === 'pending' || offer.status === 'accepted') && (
                      <Button variant="primary" size="sm" onClick={() => handleFulfill(offer._id)}>
                        ✅ تأكيد الاستلام
                      </Button>
                    )}
                    {offer.status === 'fulfilled' && (
                      <Button variant="warning" size="sm" onClick={() => handleRate(offer._id)}>
                        ⭐ تقييم
                      </Button>
                    )}
                  </>
                )}

                {offer?.donor?._id && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => navigate(`/chat/${offer.donor._id}`)}
                  >
                    💬 محادثة
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
    </React.Fragment>
  );

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!Array.isArray(requests) || requests.length === 0)
    return <p className="text-center">ليس لديك أي طلبات تبرع عامة حالياً.</p>;

  const activeRequests  = (requests || []).filter(r => !isExpired(r.deadline));
  const expiredRequests = (requests || []).filter(r => isExpired(r.deadline));

  return (
    <div className="my-donation-offers">
      <h5 className="text-center mb-3">
        <i className="fas fa-clipboard-list me-2 m-2" /> طلباتي (العامة) والعروض عليها
      </h5>

      {activeRequests.length > 0 && (
        <>
          <h6 className="mt-3 mb-2 text-success">🟢 الطلبات النشطة ({activeRequests.length})</h6>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>الوصف</th>
                <th>التصنيف</th>
                <th>المكان</th>
                <th>المبلغ</th>
                <th>آخر أجل</th>
                <th>العروض</th>
                <th>تفاصيل</th>
              </tr>
            </thead>
            <tbody>{activeRequests.map(req => renderRequestRow(req))}</tbody>
          </Table>
        </>
      )}

      {expiredRequests.length > 0 && (
        <>
          <h6 className="mt-4 mb-2 text-danger">🔴 الطلبات المنتهية ({expiredRequests.length})</h6>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>الوصف</th>
                <th>التصنيف</th>
                <th>المكان</th>
                <th>المبلغ</th>
                <th>آخر أجل</th>
                <th>العروض</th>
                <th>تفاصيل</th>
              </tr>
            </thead>
            <tbody>{expiredRequests.map(req => renderRequestRow(req, true))}</tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default MyRequestsWithOffersGeneral;

import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate } from 'react-router-dom';
import './MyDonationOffersGeneral.css';

const MyDonationOffersGeneral = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':  return 'تم القبول';
      case 'rejected':  return 'مرفوض';
      case 'fulfilled': return 'تم التنفيذ';
      default:          return 'قيد الانتظار';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':  return 'success';
      case 'rejected':  return 'danger';
      case 'fulfilled': return 'info';
      default:          return 'warning';
    }
  };

  const getRemainingTime = (deadline) => {
    if (!deadline) return '—';
    const diff = new Date(deadline) - new Date();
    if (Number.isNaN(diff)) return '—';
    if (diff <= 0) return 'انتهى الأجل';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `متبقي ${days} يوم`;
  };

  const handleCancelOffer = async (offerId, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;
    try {
      const res = await fetchWithInterceptors(`/api/donation-request-confirmations/${offerId}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers(prev => (Array.isArray(prev) ? prev.filter(o => o._id !== offerId) : []));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض العام:', err);
    }
  };

  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (!Array.isArray(offers) || offers.length === 0) return <p>لم تقم بإرسال أي عروض تبرع عامة بعد.</p>;

  return (
    <div className="my-donation-offers">
      <h5 className="text-center mb-3">
        <i className="fas fa-hand-holding-heart me-2" /> عروضي على طلبات التبرع العامة
      </h5>

      <div className="filter-wrapper">
        <select
          className="form-select w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">جميع الحالات</option>
          <option value="pending">قيد الانتظار</option>
          <option value="accepted">تم القبول</option>
          <option value="rejected">مرفوض</option>
          <option value="fulfilled">تم التنفيذ</option>
        </select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>صاحب الطلب</th>
            <th>المجال/النوع</th>
            <th>الرسالة</th>
            <th>الطريقة</th>
            <th>الوقت المتبقي</th>
            <th>الحالة</th>
            <th>الدردشة</th>
          </tr>
        </thead>
        <tbody>
          {(offers || [])
            .filter((o) => !filterStatus || o.status === filterStatus)
            .map((offer) => {
              const req = offer.request || {};
              const reqId = req._id || offer.requestId;
              return (
                <tr
                  key={offer._id}
                  onClick={() => reqId && navigate(`/donations/${reqId}`)}
                  className="clickable-row"
                  style={{ cursor: reqId ? 'pointer' : 'default' }}
                >
                  <td>{req?.user?.firstName || ''} {req?.user?.lastName || ''}</td>
                  <td>{req?.category || '—'}{req?.type ? ` / ${req.type}` : ''}</td>
                  <td>{offer.message || '—'}</td>
                  <td>{offer.method || '—'}</td>
                  <td>{getRemainingTime(req?.deadline)}</td>
                  <td><Badge bg={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge></td>
                  <td>
                    {offer.status === 'accepted' && req?.user?._id && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${req.user._id}`); }}
                      >
                        <i className="fas fa-comments" /> دردشة
                      </Button>
                    )}
                    {offer.status === 'pending' && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={(e) => handleCancelOffer(offer._id, e)}
                      >
                        <i className="fas fa-trash" /> إلغاء العرض
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>

      <ToastContainer position="bottom-start" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
          <Toast.Body className="text-white">✅ تم إلغاء العرض بنجاح.</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MyDonationOffersGeneral;

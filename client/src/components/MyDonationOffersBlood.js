import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Toast, ToastContainer } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate } from 'react-router-dom';
import './MyDonationOffersBlood.css';

const MyDonationOffersBlood = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const fetchMyOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations/sent');
      if (res.ok) {
        const list = Array.isArray(res.body) ? res.body : [];
        setOffers(list);
      }
    } catch (err) {
      console.error('خطأ في جلب العروض المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyOffers(); }, []);

  // 🔁 الآن لا يوجد "رفض"، ونعرض pending باسم "قيد الاستلام"
  const getStatusLabel = (status) => {
    switch (status) {
      case 'fulfilled': return 'تم الاستلام';
      case 'accepted':  return 'قيد الاستلام'; // للتوافق إن وُجدت بيانات قديمة
      case 'rated':     return 'تم التقييم';
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

  const getRemainingTime = (deadline) => {
    if (!deadline) return '—';
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    if (Number.isNaN(diff)) return '—';
    if (diff <= 0) return 'انتهى الأجل';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `متبقي ${days} يوم`;
  };

  const handleCancelOffer = async (offerId, e) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}`, { method: 'DELETE' });
      if (res.ok) {
        setOffers(prev => (Array.isArray(prev) ? prev.filter(o => o._id !== offerId) : []));
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (err) {
      console.error('فشل في إلغاء العرض:', err);
    }
  };

  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (!Array.isArray(offers) || offers.length === 0) return <p>لم تقم بإرسال أي عروض تبرع بالدم بعد.</p>;

  return (
    <div className="my-donation-offers">
      <h5 className="text-center mb-3">
        <i className="fas fa-hand-holding-heart me-2" /> عروضي على طلبات التبرع بالدم
      </h5>

      <div className="filter-wrapper">
        <select
          className="form-select w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">جميع الحالات</option>
          <option value="pending">قيد الاستلام</option>
          <option value="accepted">قيد الاستلام</option>
          <option value="fulfilled">تم الاستلام</option>
          <option value="rated">تم التقييم</option>
        </select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>صاحب الطلب</th>
            <th>فصيلة الدم</th>
            <th>الرسالة</th>
            <th>الطريقة</th>
            <th>الوقت المتبقي</th>
            <th>الحالة</th>
            <th>الدردشة</th>
          </tr>
        </thead>
        <tbody>
          {(offers || [])
            .filter((o) => !filterStatus || o.status === filterStatus || (filterStatus === 'pending' && o.status === 'accepted'))
            .map((offer) => {
              // ✅ السيرفر يرجّع requestId مع userId (وليس request.user)
              const req = offer.request || offer.requestId || {};
              const reqId = req?._id || offer.requestId?._id || offer.requestId;
              const owner = req?.user || req?.userId || {};
              const ownerName = [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') || '—';
              const deadline = req?.deadline;

              return (
                <tr
                  key={offer._id}
                  onClick={() => reqId && navigate(`/blood-donation-details/${reqId}`)}
                  className="clickable-row"
                  style={{ cursor: reqId ? 'pointer' : 'default' }}
                >
                  <td>{ownerName}</td>
                  <td>{req?.bloodType || '—'}</td>
                  <td>{offer.message || '—'}</td>
                  <td>{offer.method || '—'}</td>
                  <td>{getRemainingTime(deadline)}</td>
                  <td>
                    <Badge bg={getStatusColor(offer.status)}>{getStatusLabel(offer.status)}</Badge>
                  </td>
                  <td>
                    {(owner?._id) && (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${owner._id}`); }}
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

export default MyDonationOffersBlood;

import React, { useEffect, useState } from 'react';
import { Table, Badge, Button } from './ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer } from './ui';

import './MyDonationOffers.css'; // Ensure you have this CSS file for styling

const MyDonationOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  // حالة التصفية: قيد الانتظار، تم القبول، مرفوض، تم التنفيذ

  const fetchMyOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations/sent');
      if (res.ok) setOffers(res.body || []);
    } catch (err) {
      console.error('خطأ في جلب العروض المرسلة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'تم القبول';
      case 'rejected':
        return 'مرفوض';
      case 'fulfilled':
        return 'تم التنفيذ';
      default:
        return 'قيد الانتظار';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'fulfilled':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getRemainingTime = (deadline) => {
    if (!deadline) return '—';
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;
    if (diff <= 0) return 'انتهى الأجل';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `متبقي ${days} يوم`;
  };
  const handleCancelOffer = async (offerId, e) => {
  e.stopPropagation();
  if (!window.confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;

  try {
    const res = await fetchWithInterceptors(`/api/donation-confirmations/${offerId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setOffers((prev) => prev.filter((offer) => offer._id !== offerId));
      setShowToast(true);
        setTimeout(() => setShowToast(false), 3000); // إخفاء التوست بعد 3 ثواني
    }
  } catch (err) {
    console.error('فشل في إلغاء العرض:', err);
  }
};




  if (loading) return <p>⏳ جاري تحميل عروضي...</p>;
  if (offers.length === 0) return <p>لم تقم بإرسال أي عروض تبرع بعد.</p>;

  return (
    <div className="my-donation-offers ">
      <h5 className="text-center mb-3">
        <i className="fas fa-hand-holding-heart me-2"></i>عروضي على طلبات التبرع
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
            <th>نوع الطلب</th>
            <th>الرسالة</th>
            <th>الطريقة</th>
            <th>الوقت المتبقي</th>
            <th>الحالة</th>
            <th>الدردشة</th>
          </tr>
        </thead>
        <tbody>
           {offers
  .filter((offer) => !filterStatus || offer.status === filterStatus)
  .map((offer) => (
    <tr
      key={offer._id}
      onClick={() => navigate(`/blood-donation-details/${offer.requestId}`)}
      className="clickable-row"
      style={{ cursor: 'pointer' }}
    >
      <td>{offer.request?.user?.firstName} {offer.request?.user?.lastName}</td>
      <td>{offer.request?.bloodType || '—'}</td>
      <td>{offer.message}</td>
      <td>{offer.method}</td>
      <td>{getRemainingTime(offer.request?.deadline)}</td>
      <td>
        <Badge bg={getStatusColor(offer.status)}>
          {getStatusLabel(offer.status)}
        </Badge>
      </td>
      <td>
        {offer.status === 'accepted' && (
          <Button
             variant="outline-primary"
             size="sm"
             onClick={(e) => {
             e.stopPropagation();
             navigate(`/chat/${offer.request?.user?._id}`);
             }}
           >
            <i className="fas fa-comments"></i> دردشة
          </Button>

        )}
        {offer.status === 'pending' && (
          <Button
            variant="outline-danger"
            size="sm"
            className="ms-2"
            onClick={(e) => handleCancelOffer(offer._id, e)}
          >
            <i className="fas fa-trash"></i> إلغاء العرض
          </Button>
        )}
      </td>
    </tr>
))}

        </tbody>
      </Table>
      <ToastContainer position="bottom-start" className="p-3">
  <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg="success">
    <Toast.Body className="text-white">
      ✅ تم إلغاء العرض بنجاح.
    </Toast.Body>
  </Toast>
</ToastContainer>

    </div>
  );
};

export default MyDonationOffers;

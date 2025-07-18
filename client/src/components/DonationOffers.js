import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './DonationOffers.css';

const DonationOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOffers = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations/mine');
      if (res.ok) setOffers(res.body || []);
    } catch (err) {
      console.error('خطأ في جلب العروض', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id, e) => {
    e.stopPropagation(); // 🔒 يمنع التنقل عند الضغط على الزر
    try {
      await fetchWithInterceptors(`/api/donation-confirmations/${id}/accept`, {
        method: 'PATCH'
      });
      fetchOffers();
    } catch (err) {
      console.error('فشل في قبول العرض', err);
    }
  };

  const handleReject = async (id, e) => {
    e.stopPropagation(); // 🔒 يمنع التنقل عند الضغط على الزر
    try {
      await fetchWithInterceptors(`/api/donation-confirmations/${id}/reject`, {
        method: 'PATCH'
      });
      fetchOffers();
    } catch (err) {
      console.error('فشل في رفض العرض', err);
    }
  };

  const handleRowClick = (requestId) => {
    navigate(`/blood-donation-details/${requestId}`);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  if (loading) return <p>جاري التحميل...</p>;
  if (offers.length === 0) return <p>لا توجد عروض تبرع بعد.</p>;

  return (
    <div className="blood-list-offer-container mt-4">
      <h2 className="mb-3">📥 عروض التبرع التي استلمتها</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>المرسل</th>
            <th>الرسالة</th>
            <th>الطريقة</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr
              key={offer._id}
              className="clickable-row"
              onClick={() => handleRowClick(offer.requestId)}
            >
              <td>{offer.donor?.firstName} {offer.donor?.lastName}</td>
              <td>{offer.message}</td>
              <td>{offer.method}</td>
              <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
              <td>
                <Badge bg={
                  offer.status === 'accepted' ? 'success' :
                  offer.status === 'rejected' ? 'danger' :
                  'warning'
                }>
                 {offer.status === 'pending' && 'قيد الانتظار'}
                    {offer.status === 'accepted' && 'تم القبول'}
                    {offer.status === 'rejected' && 'مرفوض'}
                 {!['pending', 'accepted', 'rejected'].includes(offer.status) && 'غير معروف'}
                </Badge>
              </td>
              <td className="action-buttons">
                {offer.status === 'pending' && (
                  <>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={(e) => handleAccept(offer._id, e)}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={(e) => handleReject(offer._id, e)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DonationOffers;
// This component displays a list of donation offers received by the user.
// It allows the user to accept or reject offers and navigate to the donation request details.
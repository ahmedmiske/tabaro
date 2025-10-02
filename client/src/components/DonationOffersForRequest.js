import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from './ui';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useParams, useNavigate } from 'react-router-dom';
import './DonationOffersForRequest.css';

const DonationOffersForRequest = () => {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchOffers = async () => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/request/${requestId}`);
      if (res.ok) setOffers(res.body || []);
    } catch (err) {
      console.error('خطأ في جلب عروض الطلب', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDetails = (offerId) => {
    setSelectedRowId(selectedRowId === offerId ? null : offerId);
  };

  const handleAccept = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/accept`, { method: 'PATCH' });
    fetchOffers();
  };

  const handleReject = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/reject`, { method: 'PATCH' });
    fetchOffers();
  };

  const handleFulfill = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/fulfill`, { method: 'PATCH' });
    fetchOffers();
  };

  const handleRate = async (offerId) => {
    await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/rate`, { method: 'PATCH' });
    fetchOffers();
  };

  useEffect(() => {
    fetchOffers();
  }, [requestId]);

  if (loading) return <p>⏳ جاري تحميل عروض التبرع...</p>;
  if (offers.length === 0) return <p>لا توجد عروض تبرع لهذا الطلب بعد.</p>;

  return (
    <div className="blood-list-offer-container mt-4">
      <h2 className="mb-3">📋 العروض المقدمة لهذا الطلب</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>المتبرع</th>
            <th>الرسالة</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <React.Fragment key={offer._id}>
              <tr>
                <td>
                  {offer.donor?.firstName} {offer.donor?.lastName}
                  <br />
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleToggleDetails(offer._id)}
                    className="mt-1"
                  >
                    {selectedRowId === offer._id ? 'إخفاء' : 'تفاصيل'}
                  </Button>
                </td>
                <td>{offer.message}</td>
                <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
                <td>
                  <Badge bg={
                    offer.status === 'accepted' ? 'success' :
                    offer.status === 'fulfilled' ? 'info' :
                    offer.status === 'rated' ? 'secondary' :
                    offer.status === 'rejected' ? 'danger' :
                    'warning'
                  }>
                    {offer.status === 'accepted' ? 'تم القبول' :
                    offer.status === 'fulfilled' ? 'تم التنفيذ' :
                    offer.status === 'rated' ? 'تم التقييم' :
                    offer.status === 'rejected' ? 'مرفوض' :
                    'قيد الانتظار'}
                  </Badge>
                </td>
                <td>
                  {String(offer.recipientId) === String(currentUser._id) && (
                    <>
                      {offer.status === 'pending' && (
                        <>
                          <Button variant="success" size="sm" onClick={() => handleAccept(offer._id)} className="me-2 mb-1">
                            قبول
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(offer._id)}>
                            رفض
                          </Button>
                        </>
                      )}
                      {offer.status === 'accepted' && (
                        <Button variant="primary" size="sm" onClick={() => handleFulfill(offer._id)}>
                          تم التنفيذ
                        </Button>
                      )}
                      {offer.status === 'fulfilled' && (
                        <Button variant="warning" size="sm" onClick={() => handleRate(offer._id)}>
                          تقييم
                        </Button>
                      )}
                    </>
                  )}
                </td>
              </tr>

              {selectedRowId === offer._id && (
                <tr className="bg-light">
                  <td colSpan="5">
                    <strong>📄 تفاصيل المتبرع:</strong><br />
                    الاسم: {offer.donor?.firstName} {offer.donor?.lastName} <br />
                    الهاتف: {offer.donor?.phoneNumber || '—'} <br />
                    البريد الإلكتروني: {offer.donor?.email || '—'} <br />
                    العنوان: {offer.donor?.address || '—'} <br />
                    <div className="mt-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/chat/${offer.donor._id}`)}
                      >
                        💬 محادثة
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DonationOffersForRequest;

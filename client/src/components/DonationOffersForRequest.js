import React, { useEffect, useState } from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { useParams } from 'react-router-dom';
import './DonationOffers.css';

const DonationOffersForRequest = () => {
  const { id: requestId } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleAccept = async (offerId) => {
    try {
      await fetchWithInterceptors(`/api/donation-confirmations/${offerId}/accept`, {
        method: 'PATCH'
      });
      fetchOffers();
    } catch (err) {
      console.error('فشل في قبول العرض', err);
    }
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
            <th>الطريقة</th>
            <th>التاريخ</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer._id}>
              <td>{offer.donor?.firstName} {offer.donor?.lastName}</td>
              <td>{offer.message}</td>
              <td>{offer.method}</td>
              <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
              <td>
                <Badge bg={
                  offer.status === 'accepted' ? 'success' :
                  offer.status === 'fulfilled' ? 'info' :
                  'warning'
                }>
                  {offer.status === 'accepted' ? 'تم القبول' :
                   offer.status === 'fulfilled' ? 'تم التنفيذ' :
                   'قيد الانتظار'}
                </Badge>
              </td>
              <td>
                {offer.status === 'initiated' && offer.recipientId === currentUser._id && (
                  <Button variant="success" size="sm" onClick={() => handleAccept(offer._id)}>
                    قبول التبرع
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DonationOffersForRequest;
// This component displays a list of donation offers for a specific request.
// It allows the user to accept offers and view details of each offer.
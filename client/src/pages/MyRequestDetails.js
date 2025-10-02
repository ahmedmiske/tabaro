import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { Card, ListGroup, Badge, Spinner, Button } from '../components/ui';
import DonationOffersForRequest from '../components/DonationOffersForRequest';
import './MyRequestDetails.css';

const MyRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetchWithInterceptors(`/api/blood-requests/${id}`);
        if (!res.ok) throw new Error('فشل في تحميل الطلب');
        const req = res.body;

        const offersRes = await fetchWithInterceptors(`/api/donation-confirmations/request/${id}`);
        if (offersRes.ok) {
          req.offers = offersRes.body;
        }

        setRequest(req);
      } catch (err) {
        console.error('خطأ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!request) return <p className="text-center">❌ لا يوجد طلب بهذا المعرف.</p>;

  return (
    <div className="container caontainer-myrequest-details mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4><i className="fas fa-clipboard-list me-2"></i>تفاصيل الطلب والعروض</h4>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-right ms-1"></i>رجوع
        </Button>
      </div>

      <Card className="details-card shadow mb-4">
        <Card.Header className="card-header text-white">
          <strong>📌 تفاصيل الطلب</strong>
        </Card.Header>
        <ListGroup variant="flush" className="details-list">
          <ListGroup.Item className='details-list-item'><strong>الفصيلة:</strong><span>{request.bloodType}</span></ListGroup.Item>
          <ListGroup.Item className='details-list-item'><strong>الوصف:</strong> {request.description}</ListGroup.Item>
          <ListGroup.Item className='details-list-item'><strong>الموقع:</strong> {request.location}</ListGroup.Item>
          <ListGroup.Item className='details-list-item'><strong>آخر أجل:</strong><span>{new Date(request.deadline).toLocaleDateString()}</span></ListGroup.Item>
          <ListGroup.Item className='details-list-item'><strong>عدد العروض:</strong> {request.offers?.length || 0}</ListGroup.Item>
        </ListGroup>
      </Card>

      <div className="offers-section">
        {request.offers?.length === 0 ? (
          <p className="text-muted">لا توجد عروض تبرع لهذا الطلب حالياً.</p>
        ) : (
          <DonationOffersForRequest />
        )}
      </div>
    </div>
  );
};

export default MyRequestDetails;

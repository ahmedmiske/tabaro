import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Spinner, ListGroup, Image } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './BloodDonationDetails.css';

const BloodDonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await fetchWithInterceptors(`/api/blood-requests/${id}`);
        if (res.ok) setDonation(res.body);
      } catch (err) {
        console.error('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!donation) return <p>لا يوجد طلب.</p>;

  return (
    <div className="blood-details-container">
      <Card className="details-card shadow">
        <Card.Header className="text-center card-header text-white">
          <h4><i className="fas fa-tint me-2"></i>تفاصيل طلب التبرع</h4>
        </Card.Header>
        <Card.Body dir="rtl">
          <ListGroup variant="flush">
            <ListGroup.Item>
              <strong><i className="fas fa-tint text-danger me-2"></i>فصيلة الدم:</strong> {donation.bloodType}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong><i className="fas fa-exclamation-triangle text-warning me-2"></i>الحالة:</strong>{' '}
              {donation.isUrgent ? <span className="text-danger fw-bold">مستعجل</span> : 'عادي'}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong><i className="fas fa-phone-alt text-primary me-2"></i>طرق التواصل:</strong>
              <ul className="mt-2">
                {donation.contactMethods?.map((method, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle text-success me-1"></i> {method.method}: {method.number}
                  </li>
                ))}
              </ul>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong><i className="fas fa-calendar-plus text-secondary me-2"></i>تاريخ الإضافة:</strong>{' '}
              {new Date(donation.createdAt).toLocaleDateString()}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong><i className="fas fa-user text-dark me-2"></i>الناشر:</strong>{' '}
              {donation.userId?.firstName} {donation.userId?.lastName}
            </ListGroup.Item>

             {donation.files?.length > 0 && (
  <ListGroup.Item>
    <strong><i className="fas fa-paperclip text-secondary me-2"></i>الوثائق الداعمة:</strong>
    <div className="docs-preview mt-3 d-flex flex-wrap gap-3">
      {donation.files.map((file, i) => {
        const extension = file.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
        const fileUrl = `http://localhost:5000/uploads/blood-requests/${file}`;

        return (
          <div key={i} className="doc-box text-center border p-2 rounded shadow-sm">
            {isImage ? (
              <>
                <Image src={fileUrl} thumbnail width={100} height={100} />
                <div className="small mt-1 text-muted">صورة {i + 1}</div>
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf fa-3x text-danger mb-2"></i>
                <div className="small text-muted mb-1">وثيقة {i + 1}</div>
                <div className="d-flex justify-content-center gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-eye me-1"></i> معاينة
                  </a>
                  <a
                    href={fileUrl}
                    download
                    className="btn btn-sm btn-outline-success"
                  >
                    <i className="fas fa-download me-1"></i> تحميل
                  </a>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  </ListGroup.Item>
)}

          </ListGroup>

          <div className="text-center mt-4 d-flex gap-3 justify-content-center flex-wrap">
             <Button variant="success" onClick={() => alert("ميزة المحادثة قيد التطوير!")}>
              <i className="fas fa-comments ms-2"></i>تحدث مع صاحب الطلب
            </Button>
            <Link to="/donations" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-right ms-2"></i>العودة
            </Link>
           
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BloodDonationDetails;

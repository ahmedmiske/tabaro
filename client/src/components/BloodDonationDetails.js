import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Spinner, ListGroup, Image, Modal } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from '../components/ChatBox'; // ✅ تأكد من وجوده
import './BloodDonationDetails.css';

const BloodDonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ المحادثة
  const [showChat, setShowChat] = useState(false);
  const currentUserId = "664bde4b6b1d697c6cecab58"; // TODO: استبدل هذا بـ user من السياق

  // ✅ معاينة الملفات
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const openPreview = (fileUrl, type) => {
    setSelectedFile(fileUrl);
    setSelectedType(type);
    setShowModal(true);
  };

  const closePreview = () => {
    setShowModal(false);
    setSelectedFile(null);
    setSelectedType('');
  };

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
                    const ext = file.split('.').pop().toLowerCase();
                    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
                    const fileUrl = `http://localhost:5000/uploads/blood-requests/${file}`;
                    return (
                      <div key={i} className="doc-box text-center border p-2 rounded shadow-sm">
                        {isImage ? (
                          <>
                            <Image src={fileUrl} thumbnail width={100} height={100} />
                            <div className="small text-muted mt-1">صورة {i + 1}</div>
                            <div className="d-flex justify-content-center gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => openPreview(fileUrl, 'image')}>
                                <i className="fas fa-eye me-1"></i>معاينة
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf fa-3x text-danger mb-2"></i>
                            <div className="small text-muted mb-1">وثيقة {i + 1}</div>
                            <div className="d-flex justify-content-center gap-2">
                              <Button size="sm" variant="outline-primary" onClick={() => openPreview(fileUrl, 'pdf')}>
                                <i className="fas fa-eye me-1"></i>معاينة
                              </Button>
                              <a href={fileUrl} download className="btn btn-sm btn-outline-success">
                                <i className="fas fa-download me-1"></i>تحميل
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
            <Link to="/donations" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-right ms-2"></i>العودة
            </Link>
            <Button
              variant={showChat ? 'danger' : 'success'}
              onClick={() => setShowChat(!showChat)}
            >
              <i className="fas fa-comments ms-2"></i>
              {showChat ? 'إغلاق المحادثة' : 'تحدث مع صاحب الطلب'}
            </Button>
          </div>

          {showChat && (
            <div className="mt-4">
              <ChatBox currentUserId={currentUserId} recipientId={donation.userId?._id} />
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={closePreview} centered size="lg" className='preview-modal'>
        <Modal.Header closeButton>
          <Modal.Title>معاينة الوثيقة</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedType === 'image' ? (
            <Image src={selectedFile} fluid />
          ) : (
            <iframe src={selectedFile} width="100%" height="500px" title="معاينة PDF" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closePreview}>إغلاق</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BloodDonationDetails;

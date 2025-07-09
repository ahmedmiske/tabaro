import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Spinner, ListGroup, Image, Modal, Alert } from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from '../components/ChatBox';
import socket from '../socket'; // استخدم سوكيت الإشعارات
import './BloodDonationDetails.css';

const BloodDonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showChat, setShowChat] = useState(false);
  const [donationAlert, setDonationAlert] = useState(false); // إشعار بعد الضغط على زر التبرع

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?._id;

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

  const handleNotifyDonor = () => {
    if (!donation?.userId?._id) return;

    // إشعار مباشر باستخدام socket
    socket.emit('sendMessage', {
      recipientId: donation.userId._id,
      content: `🩸 يريد ${currentUser.firstName} التبرع لك. سيتم التواصل معك قريبا.`
    });

    setDonationAlert(true);
    setTimeout(() => setDonationAlert(false), 4000);
  };

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await fetchWithInterceptors(`/api/blood-requests/${id}`);
        if (res.ok) setDonation(res.body);
      } catch {
        console.error('خطأ في جلب البيانات');
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
            <ListGroup.Item><strong><i className="fas fa-tint text-danger me-2"></i>فصيلة الدم:</strong> {donation.bloodType}</ListGroup.Item>
            <ListGroup.Item><strong><i className="fas fa-exclamation-triangle text-warning me-2"></i>الحالة:</strong> {donation.isUrgent ? <span className="text-danger fw-bold">مستعجل</span> : 'عادي'}</ListGroup.Item>
            <ListGroup.Item><strong><i className="fas fa-map-marker-alt text-info me-2"></i>الموقع:</strong> {donation.location || 'غير محدد'}</ListGroup.Item>
            <ListGroup.Item><strong><i className="fas fa-phone-alt text-primary me-2"></i>طرق التواصل:</strong>
              <ul className="mt-2">
                {donation.contactMethods?.map((method, index) => (
                  <li key={index}><i className="fas fa-check-circle text-success me-1"></i> {method.method}: {method.number}</li>
                ))}
              </ul>
            </ListGroup.Item>
            <ListGroup.Item><strong><i className="fas fa-calendar-plus text-secondary me-2"></i>تاريخ الإضافة:</strong> {new Date(donation.createdAt).toLocaleDateString()}</ListGroup.Item>
            <ListGroup.Item><strong><i className="fas fa-user text-dark me-2"></i>الناشر:</strong> {donation.userId?.firstName} {donation.userId?.lastName}</ListGroup.Item>

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

          {/* إشعار بعد الضغط على "تبرع الآن" */}
          {donationAlert && (
            <Alert variant="success" className="text-center mt-3">
              ✅ تم إشعار صاحب الطلب، سيتم التواصل معك قريبًا.
            </Alert>
          )}

          {/* الأزرار السفلية */}
          <div className="text-center mt-4 d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/donations" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-right ms-2"></i>العودة
            </Link>
            <Button variant="info" onClick={handleNotifyDonor}>
              <i className="fas fa-hand-holding-heart ms-2"></i>تبرع الآن
            </Button>
            <Button variant={showChat ? 'danger' : 'success'} onClick={() => setShowChat(!showChat)}>
              <i className="fas fa-comments ms-2"></i>{showChat ? 'إغلاق المحادثة' : 'تحدث مع صاحب الطلب'}
            </Button>
          </div>

          {/* مربع المحادثة */}
          {showChat && (
            <div className="mt-4">
              <h5 className="text-center mb-3">محادثة مع {donation.userId?.firstName}</h5>
              <ChatBox recipientId={donation.userId?._id} />
            </div>
          )}
        </Card.Body>
      </Card>

      {/* المعاينة */}
      <Modal show={showModal} onHide={closePreview} centered size="lg" className='preview-modal'>
        <Modal.Header closeButton>
          <Modal.Title>معاينة الوثيقة</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedType === 'image' ? (
            <Image src={selectedFile} fluid />
          ) : (
            <iframe src={selectedFile} width="100%" height="500px" title="PDF Preview" />
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
// This component displays the details of a blood donation request.
// It includes the blood type, urgency, location, contact methods, and supporting documents.
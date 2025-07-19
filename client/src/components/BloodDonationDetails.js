import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card, Button, Spinner, ListGroup, Image,
  Modal, Toast, ToastContainer
} from 'react-bootstrap';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import ChatBox from '../components/ChatBox';
import socket from '../socket';
import DonationOffersForRequest from '../components/DonationOffersForRequest';
import './BloodDonationDetails.css';

const BloodDonationDetails = () => {
  const { id } = useParams();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationStatus, setDonationStatus] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

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

  const handleSendDonationOffer = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor: currentUserId,
          requestId: donation._id,
          recipientId: donation.userId._id,
          message: 'أرغب بالتبرع',
          method: 'call',
          proposedTime: new Date()
        })
      });

   if (res.ok) {
  socket.emit('sendMessage', {
    recipientId: donation.userId._id,
    content: `🩸 ${currentUser.firstName} ${currentUser.lastName} عرض التبرع لك لطلب فصيلة ${donation.bloodType}`,
    requestId: donation._id // ✅ مهم لربط الرسالة بالطلب
  });

  setDonationStatus('initiated');
  setShowToast(true);
}

    } catch (err) {
      console.error('فشل إرسال عرض التبرع:', err);
    }
  };

  const calculateTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return '⛔ انتهت المهلة';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${days}ي ${hours}س ${minutes}د ${seconds}ث`;
  };

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await fetchWithInterceptors(`/api/blood-requests/${id}`);
        if (res.ok) {
          setDonation(res.body);
          setDonationStatus(res.body.donationStatus || '');
        }
      } catch {
        console.error('خطأ في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id]);

  useEffect(() => {
    if (!donation?.deadline) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(donation.deadline));
    }, 1000);
    return () => clearInterval(interval);
  }, [donation?.deadline]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (!donation) return <p>لا يوجد طلب.</p>;

  const isOwner = donation.userId?._id === currentUserId;

  return (
    <div className="blood-details-container">
      <Card className="details-card shadow">
        <Card.Header className="text-center card-header text-white">
          <h4><i className="fas fa-tint me-2"></i>تفاصيل طلب التبرع</h4>
        </Card.Header>
        <Card.Body dir="rtl">
          <ListGroup variant="flush">
            <ListGroup.Item><strong>فصيلة الدم:</strong> {donation.bloodType}</ListGroup.Item>
            <ListGroup.Item><strong>الحالة:</strong> {donation.isUrgent ? <span className="text-danger fw-bold">مستعجل</span> : 'عادي'}</ListGroup.Item>
            <ListGroup.Item><strong>الموقع:</strong> {donation.location || 'غير محدد'}</ListGroup.Item>

            {donation.deadline && (
              <ListGroup.Item>
                <strong>⏳ آخر أجل:</strong> {new Date(donation.deadline).toLocaleString()}
                <div className="text-danger mt-2">
                  ⏱️ الوقت المتبقي: {timeLeft}
                </div>
              </ListGroup.Item>
            )}

            {isOwner || donationStatus === 'accepted' ? (
              <ListGroup.Item>
                <strong>📞 وسائل التواصل:</strong>
                <ul>
                  {donation.contactMethods?.map((method, index) => (
                    <li key={index}>{method.method}: {method.number}</li>
                  ))}
                </ul>
              </ListGroup.Item>
            ) : (
              <ListGroup.Item className="text-muted">
                🛡️ سيتم عرض وسائل التواصل فقط بعد موافقة صاحب الطلب على عرض التبرع.
              </ListGroup.Item>
            )}

            <ListGroup.Item><strong>تاريخ الإضافة:</strong> {new Date(donation.createdAt).toLocaleDateString()}</ListGroup.Item>
            <ListGroup.Item><strong>الناشر:</strong> {donation.userId?.firstName} {donation.userId?.lastName}</ListGroup.Item>

            {donation.files?.length > 0 && (
              <ListGroup.Item>
                <strong>📎 الوثائق الداعمة:</strong>
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
                            <Button size="sm" variant="outline-primary" onClick={() => openPreview(fileUrl, 'image')}>
                              <i className="fas fa-eye me-1"></i>معاينة
                            </Button>
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
            <Link to="/donations" className="btn btn-outline-secondary">العودة</Link>

            {!isOwner && (
              <Button variant={showChat ? 'danger' : 'success'} onClick={() => setShowChat(!showChat)}>
                <i className="fas fa-comments ms-2"></i>{showChat ? 'إغلاق المحادثة' : 'تحدث مع صاحب الطلب'}
              </Button>
            )}

            {!isOwner && donationStatus !== 'accepted' && (
              <Button variant="info" onClick={() => setShowConfirmModal(true)}>
                <i className="fas fa-hand-holding-heart ms-2"></i>تبرع الآن
              </Button>
            )}
          </div>

          {showChat && (
            <div className="mt-4">
              <h5 className="text-center mb-3">محادثة مع {donation.userId?.firstName}</h5>
              <ChatBox recipientId={donation.userId?._id} />
            </div>
          )}
        </Card.Body>
      </Card>

      {isOwner && (
        <DonationOffersForRequest />
      )}

      <Modal show={showModal} onHide={closePreview} centered size="lg">
        <Modal.Header closeButton><Modal.Title>معاينة الوثيقة</Modal.Title></Modal.Header>
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

      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>تأكيد التبرع</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>✅ سيتم إرسال عرضك لصاحب الطلب.</p>
          <p>⚠️ لن تُعرض بيانات التواصل حتى يقبل صاحب الطلب عرضك.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>إلغاء</Button>
          <Button variant="primary" onClick={() => {
            handleSendDonationOffer();
            setShowConfirmModal(false);
          }}>تأكيد</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-start" className="p-3">
        <Toast bg="success" show={showToast} onClose={() => setShowToast(false)} delay={4000} autohide>
          <Toast.Header><strong className="me-auto">تم الإرسال</strong></Toast.Header>
          <Toast.Body className="text-white">تم إرسال العرض، بانتظار الموافقة.</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default BloodDonationDetails;
// This component displays the details of a specific blood donation request.
// It allows users to view the request details, contact the requester, and send a donation offer
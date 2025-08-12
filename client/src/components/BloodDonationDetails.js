import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Button, Spinner, ListGroup, Badge, Alert
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
  const [timeLeft, setTimeLeft] = useState('');
  const [donationStatus, setDonationStatus] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [showOfferConfirm, setShowOfferConfirm] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = currentUser?._id;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const calculateTimeLeft = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return '⛔ انتهت المهلة';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    return `${days}j ${hours}h ${minutes}m`;
  };

  const isRequestActive = (deadline) => {
    const now = new Date();
    return new Date(deadline) >= now;
  };

  const checkExistingOffer = async () => {
    try {
      const res = await fetchWithInterceptors(`/api/donation-confirmations/request/${id}`);
      if (res.ok) {
        const offers = res.body;
        const myOffer = offers.find(o => o.donor?._id === currentUserId);
        if (myOffer) {
          setExistingOffer(myOffer);
          if (['pending', 'accepted'].includes(myOffer.status)) {
            setInfoMessage(`لقد قمت مسبقًا بإرسال عرض لهذا الطلب. الحالة: ${myOffer.status}`);
          }
        }
      }
    } catch (err) {
      console.error('فشل في التحقق من العروض السابقة:', err);
    }
  };

  const recipientId = typeof donation?.userId === 'object'
    ? donation?.userId?._id
    : donation?.userId;

  const handleConfirmSendDonationOffer = async () => {
    try {
      const res = await fetchWithInterceptors('/api/donation-confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: donation._id,
          message: 'أرغب بالتبرع',
          method: 'call',
          proposedTime: new Date()
        })
      });

      if (res.ok) {
        socket.emit('sendMessage', {
          recipientId: recipientId,
          content: `🩸 ${currentUser.firstName} عرض التبرع لك لطلب فصيلة ${donation.bloodType}`,
          requestId: donation._id, // ✅ تمرير المعرف
          offerId: null, // لو كان لديك offerId ضعه هنا
          type: 'offer'
        });

        setDonationStatus('initiated');
        setInfoMessage('✅ تم إرسال العرض، بانتظار موافقة صاحب الطلب.');
        setShowOfferConfirm(false);
        checkExistingOffer();
      }
    } catch (err) {
      console.error('فشل إرسال عرض التبرع:', err);
    }
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
    checkExistingOffer();
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

  const isOwner = donation.userId?._id === currentUserId || donation.userId === currentUserId;
  const isActive = isRequestActive(donation.deadline);

  if (!isActive && !isOwner) {
    return (
      <div className="alert alert-warning mt-4 text-center">
        ⛔ هذا الطلب لم يعد نشطًا.
      </div>
    );
  }

  return (
    <div className="blood-details-container mt-4">
      <Card className="details-card shadow">
        <Card.Header className="text-center card-header text-white">
          <h4><i className="fas fa-tint me-2"></i>تفاصيل طلب التبرع</h4>
        </Card.Header>
        <Card.Body dir="rtl">
          <ListGroup variant="flush">
            <ListGroup.Item><strong>فصيلة الدم:</strong> {donation.bloodType}</ListGroup.Item>
            <ListGroup.Item><strong>الحالة:</strong> {donation.isUrgent ? <span className="text-danger fw-bold">مستعجل</span> : 'عادي'}</ListGroup.Item>
            <ListGroup.Item><strong>📍 الموقع:</strong> {donation.location || 'غير محدد'}</ListGroup.Item>
            <ListGroup.Item>
              <strong>🔄 حالة الطلب:</strong>{' '}
              <Badge bg={isActive ? 'success' : 'secondary'}>
                {isActive ? 'نشط' : 'غير نشط'}
              </Badge>
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>⏳ آخر أجل:</strong>{' '}
              <Badge bg="danger" className="ms-2">
                {formatDate(donation.deadline)}
              </Badge>
              <div className="text-danger mt-2 fw-bold">
                ⏱️ الوقت المتبقي: {timeLeft}
              </div>
            </ListGroup.Item>

            {(isOwner || existingOffer?.status === 'accepted') ? (
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

            <ListGroup.Item><strong>📅 تاريخ الإضافة:</strong> {formatDate(donation.createdAt)}</ListGroup.Item>
            <ListGroup.Item><strong>👤 الناشر:</strong> {donation.userId?.firstName || ''} {donation.userId?.lastName || ''}</ListGroup.Item>
          </ListGroup>

          <div className="text-center mt-4 d-flex gap-3 justify-content-center flex-wrap">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-right ms-2"></i>العودة
            </Button>

            {!isOwner && recipientId && (
              <Button variant={showChat ? 'danger' : 'success'} onClick={() => setShowChat(!showChat)}>
                <i className="fas fa-comments ms-2"></i>{showChat ? 'إغلاق المحادثة' : 'تحدث مع صاحب الطلب'}
              </Button>
            )}

            {!isOwner && !existingOffer && (
              <Button variant="info" onClick={() => setShowOfferConfirm(true)}>
                <i className="fas fa-hand-holding-heart ms-2"></i>تبرع الآن
              </Button>
            )}
          </div>

          {showOfferConfirm && (
            <Alert variant="light" className="mt-4 border shadow-sm">
              <h6 className="fw-bold">تأكيد عرض التبرع</h6>
              <p className="mb-2">
                سيتم إشعار صاحب الطلب بعرض التبرع الخاص بك، وفي حالة القبول يمكنك التواصل لاحقًا.
                <br /> هل ترغب في المتابعة؟
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Button variant="success" size="sm" onClick={handleConfirmSendDonationOffer}>
                  ✅ تأكيد
                </Button>
                <Button variant="danger" size="sm" onClick={() => setShowOfferConfirm(false)}>
                  ❌ إلغاء
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowOfferConfirm(false)}>
                  إغلاق
                </Button>
              </div>
            </Alert>
          )}

          {infoMessage && (
            <Alert variant="info" className="mt-4 d-flex justify-content-between align-items-center">
              <div>{infoMessage}</div>
              <Button variant="outline-secondary" size="sm" onClick={() => setInfoMessage('')}>×</Button>
            </Alert>
          )}

          {showChat && recipientId && (
            <div className="mt-4">
              <h5 className="text-center mb-3">محادثة مع {donation.userId?.firstName || ''}</h5>
              <ChatBox recipientId={recipientId} />
            </div>
          )}
        </Card.Body>
      </Card>

      {isOwner && <DonationOffersForRequest />}
    </div>
  );
};

export default BloodDonationDetails;

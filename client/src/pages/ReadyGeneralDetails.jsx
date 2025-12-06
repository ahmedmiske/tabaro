// src/pages/ReadyToDonateGeneralDetails.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import {
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiPhone,
  FiMessageCircle,
  FiArrowRight,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
} from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { assetUrl } from '../utils/urls';
import './ReadyGeneralDetails.css';
import TitleMain from '../components/TitleMain.jsx';

// تاريخ بصيغة DD/MM/YYYY
const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
};

// ==== أدوات المرفقات ====

// استخراج رابط الملف من الكائن أو السلسلة مع تحويله لمسار سيرفر
const getFileUrl = (file) => {
  if (!file) return '';

  let raw = '';
  if (typeof file === 'string') {
    raw = file;
  } else {
    raw = file.url || file.path || file.href || '';
  }
  if (!raw) return '';

  // إذا كان HTTP جاهز
  if (/^https?:\/\//i.test(raw)) return raw;

  // إزالة file:///
  raw = raw.replace(/^file:\/\//i, '');

  // اسم الملف
  const filename = raw.split(/[\\/]/).pop();
  if (!filename) return '';

  // داخل مجلد ready-general
  if (raw.includes('ready-general')) {
    return assetUrl(`/uploads/ready-general/${filename}`);
  }

  // يبدأ بـ /uploads
  if (raw.startsWith('/uploads')) {
    return assetUrl(raw);
  }

  // افتراضي
  return assetUrl(`/uploads/${filename}`);
};

const getFileName = (file) => {
  const url = getFileUrl(file);
  if (!url) return 'مرفق';
  return decodeURIComponent(url.split('/').pop() || 'مرفق');
};

const isImageAttachment = (file) => {
  const url = getFileUrl(file);
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url);
};

const ReadyToDonateGeneralDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🎞️ حالة عارض الصور (Lightbox)
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetchWithInterceptors(
          `/api/ready-to-donate-general/${id}`
        );
        const data = res?.body?.data || res?.body || res?.data;
        setOffer(data || null);
      } catch (e) {
        console.error('details ready-general error:', e);
        setError(
          e?.body?.message ||
            e?.message ||
            'تعذر تحميل تفاصيل العرض، حاول لاحقًا.'
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const contactPhone = useMemo(
    () =>
      (offer?.contactMethods || []).find((m) => m.method === 'phone')?.number ||
      '',
    [offer]
  );

  const contactWhatsapp = useMemo(
    () =>
      (offer?.contactMethods || []).find((m) => m.method === 'whatsapp')
        ?.number || '',
    [offer]
  );

  // المرفقات من extra أو من حقل files
  const attachments = useMemo(
    () => offer?.extra?.attachments || offer?.files || [],
    [offer]
  );

  const imageAttachments = useMemo(
    () => (attachments || []).filter(isImageAttachment),
    [attachments]
  );

  const otherAttachments = useMemo(
    () => (attachments || []).filter((f) => !isImageAttachment(f)),
    [attachments]
  );

  const attachmentsCount = (attachments || []).length;

  const isStillValid = useMemo(() => {
    if (!offer?.availableUntil) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(offer.availableUntil);
    return !Number.isNaN(end.getTime()) && end >= today;
  }, [offer]);

  // دوال عارض الصور
  const openViewer = (idx) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  };

  const closeViewer = () => setViewerOpen(false);

  const goNext = () => {
    if (!imageAttachments.length) return;
    setViewerIndex((prev) => (prev + 1) % imageAttachments.length);
  };

  const goPrev = () => {
    if (!imageAttachments.length) return;
    setViewerIndex((prev) =>
      (prev - 1 + imageAttachments.length) % imageAttachments.length
    );
  };

  if (loading) {
    return (
      <Container className="ready-general-details-page py-5" dir="rtl">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-3">جاري تحميل تفاصيل العرض...</p>
        </div>
      </Container>
    );
  }

  if (error || !offer) {
    return (
      <Container className="ready-general-details-page py-5" dir="rtl">
        <Card className="rgd-error-card">
          <Card.Body className="text-center">
            <Alert variant="danger" className="mb-4">
              {error || 'العرض غير موجود.'}
            </Alert>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FiArrowRight className="ms-1" />
              رجوع
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const donationType =
    offer?.extra?.donationType === 'inkind' ? 'تبرع عيني' : 'تبرع مالي';

  const categoryLabel = offer?.extra?.categoryLabel || offer?.categoryLabel;

  const displayLocation =
    offer.city ||
    offer.location ||
    [offer.city, offer.country].filter(Boolean).join(' - ');

  const currentImageUrl =
    imageAttachments.length > 0
      ? getFileUrl(imageAttachments[viewerIndex])
      : '';

  return (
    <Container className="ready-general-details-page py-5" dir="rtl">
      <TitleMain title="تفاصيل عرض استعداد المتبرع" />
      <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FiArrowRight className="ms-1" />
              رجوع 
       </Button>
      <Card className="rgd-card">
        <Card.Body>
          {/* رأس البطاقة */}
          <div className="rgd-header">
            <div className="rgd-avatar">م</div>
            <div className="rgd-header-main">
              <h2 className="rgd-title">عرض استعداد المتبرع</h2>
              <div className="rgd-badges">
                {categoryLabel && (
                  <Badge bg="warning" className="me-2 rgd-badge-pill">
                    {categoryLabel}
                  </Badge>
                )}
                <Badge
                  bg={offer?.extra?.donationType === 'inkind' ? 'info' : 'success'}
                  className="rgd-badge-pill"
                >
                  {donationType}
                </Badge>
              </div>
            </div>
          </div>

          {/* ملخص سريع */}
          <Row className="rgd-summary-row mt-4 g-3">
            {displayLocation && (
              <Col xs={12} md={4}>
                <div className="rgd-summary-box">
                  <div className="rgd-summary-icon">
                    <FiMapPin />
                  </div>
                  <div className="rgd-summary-label">الموقع</div>
                  <div className="rgd-summary-value">{displayLocation}</div>
                </div>
              </Col>
            )}

            <Col xs={12} md={4}>
              <div className="rgd-summary-box">
                <div className="rgd-summary-icon">
                  <FiCalendar />
                </div>
                <div className="rgd-summary-label">متاح حتى</div>
                <div className="rgd-summary-value">
                  {offer.availableUntil
                    ? formatDate(offer.availableUntil)
                    : 'بدون تاريخ انتهاء'}
                </div>
              </div>
            </Col>

            <Col xs={12} md={4}>
              <div className="rgd-summary-box">
                <div className="rgd-summary-icon">
                  <FiFileText />
                </div>
                <div className="rgd-summary-label">المرفقات</div>
                <div className="rgd-summary-value">
                  {attachmentsCount ? `${attachmentsCount} ملف` : 'لا توجد مرفقات'}
                </div>
              </div>
            </Col>
          </Row>

          {/* حالة العرض */}
          <div
            className={`rgd-status-box mt-4 ${
              isStillValid ? 'active' : 'expired'
            }`}
          >
            {isStillValid
              ? 'العرض ساري المفعول إلى تاريخ الانتهاء.'
              : 'انتهت مدة هذا العرض.'}
          </div>

          {/* تفاصيل العرض */}
          {offer.note && (
            <section className="rgd-section mt-4">
              <h5 className="rgd-section-title">تفاصيل العرض</h5>
              <p className="rgd-section-text">{offer.note}</p>
            </section>
          )}

          {/* المبلغ التقريبي */}
          {offer?.extra?.amount && (
            <section className="rgd-section mt-3">
              <h6 className="rgd-section-subtitle">
                <FiDollarSign className="me-1" />
                المبلغ التقريبي
              </h6>
              <p className="rgd-section-text rgd-amount-text">
                {offer.extra.amount}
              </p>
            </section>
          )}

          {/* صور توضيحية */}
          {imageAttachments.length > 0 && (
            <section className="rgd-section mt-4">
              <h5 className="rgd-section-title">صور توضيحية للعرض</h5>
              <div className="rgd-attachments-grid">
                {imageAttachments.map((file, idx) => {
                  const url = getFileUrl(file);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="rgd-image-thumb"
                      onClick={() => openViewer(idx)}
                    >
                      <img src={url} alt={`مرفق ${idx + 1}`} />
                      <span className="rgd-image-label">صورة {idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* مرفقات أخرى (يمكن تحميلها) */}
          {otherAttachments.length > 0 && (
            <section className="rgd-section mt-4">
              <h5 className="rgd-section-title">مرفقات أخرى</h5>
              <ul className="rgd-files-list">
                {otherAttachments.map((file, idx) => {
                  const url = getFileUrl(file);
                  const name = getFileName(file);
                  return (
                    <li key={idx} className="rgd-file-item">
                      <FiFileText className="rgd-file-icon" />
                      <div className="rgd-file-main">
                        <span className="rgd-file-name">{name}</span>
                        <div className="rgd-file-actions">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            عرض
                          </a>
                          <a
                            href={url}
                            download
                            className="rgd-file-download"
                          >
                            <FiDownload className="ms-1" />
                            تحميل
                          </a>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* التواصل */}
          <section className="rgd-section mt-4">
            <h5 className="rgd-section-title">التواصل مع المتبرع</h5>
            <div className="d-flex flex-wrap gap-2">

              <Button variant='outline-success' >      
                <FiMessageCircle className="ms-1" />
                <Link to={`/chat/${offer._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                 محادثة عبر النظام
                </Link>
              </Button>
              {contactWhatsapp && (
                <Button
                  variant="success"
                  as="a"
                  href={`https://wa.me/${contactWhatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiMessageCircle className="ms-1" />
                  واتساب
                </Button>
              )}
              {contactPhone && (
                <Button
                  variant="outline-success"
                  as="a"
                  href={`tel:${contactPhone}`}
                >
                  <FiPhone className="ms-1" />
                  اتصال هاتفي
                </Button>
              )}
              {!contactPhone && !contactWhatsapp && (
                <span className="text-muted">
                  لم يحدّد صاحب العرض أي وسيلة تواصل.
                </span>
              )}
            </div>
          </section>

          {/* فوتر */}
          <div className="rgd-footer mt-4 d-flex flex-wrap gap-2">
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              <FiArrowRight className="ms-1" />
              رجوع 
            </Button>
            <Link to="/general-donors" className="btn go-to-list-btn">
              الذهاب إلى قائمة العروض العامة
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* 🎞️ Lightbox لعرض الصور في مكان واحد مع تنقل */}
      <Modal
        show={viewerOpen}
        onHide={closeViewer}
        centered
        size="lg"
        className="rgd-lightbox-modal"
      >
        <Modal.Body>
          {currentImageUrl && (
            <div className="rgd-lightbox-content">
              {imageAttachments.length > 1 && (
                <>
                  <button
                    type="button"
                    className="rgd-lightbox-arrow left"
                    onClick={goPrev}
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="rgd-lightbox-arrow right"
                    onClick={goNext}
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
              <img
                src={currentImageUrl}
                alt={`صورة ${viewerIndex + 1}`}
                className="rgd-lightbox-image"
              />
            </div>
          )}
          <div className="rgd-lightbox-footer">
            <div className="rgd-lightbox-counter">
              صورة {viewerIndex + 1} من {imageAttachments.length}
            </div>
            {currentImageUrl && (
              <div className="rgd-lightbox-actions">
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  فتح في تبويب جديد
                </a>
                <a href={currentImageUrl} download className="rgd-file-download">
                  <FiDownload className="ms-1" />
                  تحميل الصورة
                </a>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ReadyToDonateGeneralDetails;

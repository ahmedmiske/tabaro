// src/pages/GeneralDonors.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Alert,
  Spinner,
} from 'react-bootstrap';
import {
  FiSearch,
  FiMapPin,
  FiPhone,
  FiHeart,
  FiCalendar,
  FiFilter,
  FiDollarSign,
  FiFileText,
  FiMessageCircle 
} from 'react-icons/fi';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../AuthContext.jsx';
import { Navigate, Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './GeneralDonors.css';
import {
  GENERAL_CATEGORY_META,
  codeToLabel,
  labelToCode,
} from '../constants/donationCategories';
import QuranVerse from '../components/QuranVerse.jsx';

// يلتقط مصفوفة البيانات من عدة أشكال شائعة للاستجابة
const pickArray = (body) => {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.items)) return body.items;
  if (Array.isArray(body.docs)) return body.docs;
  if (Array.isArray(body.results)) return body.results;
  if (Array.isArray(body.list)) return body.list;
  if (body.data && Array.isArray(body.data.items)) return body.data.items;
  return [];
};

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`; // أرقام عادية
};

const GeneralDonors = () => {
  const { user } = useAuth();

  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فلاتر الواجهة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // نستخدم هذا العلم لمعرفة إن كانت الفئة اختيرت يدويًا
  const categoryChosenManually = useRef(false);

  const categories = Object.values(GENERAL_CATEGORY_META).map((v) => v.label);

  const getCategoryColor = (categoryAr) => {
    const entry = Object.entries(GENERAL_CATEGORY_META).find(
      ([, v]) => v.label === categoryAr
    );
    return entry ? entry[1].color : 'secondary';
  };

  const fetchOnce = async (url) => {
    try {
      const res = await fetchWithInterceptors(url);
      return { ok: true, body: res?.body };
    } catch (e) {
      return { ok: false, error: e };
    }
  };

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();

      if (categoryChosenManually.current && filterCategory) {
        const categoryCode = labelToCode(filterCategory) || '';
        if (categoryCode) qs.set('category', categoryCode);
      }

      if (filterLocation) qs.set('city', filterLocation);
      if (searchTerm) qs.set('q', searchTerm);

      const url1 = `/api/ready-to-donate-general?${qs.toString()}`;
      let r1 = await fetchOnce(url1);

      let ok = r1.ok;
      let body = r1.body;
      let usedUrl = url1;

      // مسار احتياطي قديم
      if (!ok) {
        const qs2 = new URLSearchParams(qs);
        if (!qs2.get('type')) qs2.set('type', 'general');
        const url2 = `/api/ready-to-donate?${qs2.toString()}`;
        const r2 = await fetchOnce(url2);
        ok = r2.ok;
        body = r2.body;
        usedUrl = url2;
      }

      if (!ok) throw new Error('تعذّر جلب العروض. تحقق من مسار الـ API.');

      const arr = pickArray(body);
      console.info(
        '[GENERAL OFFERS] URL:',
        usedUrl,
        'count:',
        arr.length,
        'raw:',
        body
      );

      const mapped = arr.map((d) => {
        const phone =
          (d.contactMethods || []).find((m) => m.method === 'phone')?.number ||
          '';
        const whatsapp =
          (d.contactMethods || []).find((m) => m.method === 'whatsapp')
            ?.number || '';

        const catCode = d?.extra?.category || d?.category || d?.extraCategory;
        const catAr = codeToLabel(catCode);

        const attachmentsArr = d.extra.attachments || d.files || [];
        const attachmentsCount = Array.isArray(attachmentsArr)
          ? attachmentsArr.length
          : 0;

        return {
          _id: d._id || d.id,
          // لا نظهر اسم المتبرع في الكارت – نستخدم عنوانًا عامًا
          title: 'عرض استعداد للتبرع',
          category: catAr,
          donationType:
            d?.extra?.donationType === 'inkind' ? 'تبرع عيني' : 'تبرع مالي',
          location: d.city || d.location || '',
          availableUntil: d.availableUntil || d.until || null,
          attachmentsCount,
          description: d.note || d.description || '',
          whatsapp,
          phone,
          isActive: d.isActive !== false,
          createdAt: d.createdAt,
        };
      });

      setOffers(mapped);
    } catch (err) {
      console.error('Error fetching general offers:', err);
      const msg =
        err?.body?.error || err?.message || 'حدث خطأ في تحميل البيانات';
      setError(msg);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOffers = () => {
    let filtered = offers;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.location?.toLowerCase().includes(q) ||
          o.category?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((o) => o.category === filterCategory);
    }

    if (filterLocation) {
      const q = filterLocation.toLowerCase();
      filtered = filtered.filter((o) =>
        o.location?.toLowerCase().includes(q)
      );
    }

    setFilteredOffers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
    categoryChosenManually.current = false;
    if (window && window.history && window.location) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // عند أول تحميل
  useEffect(() => {
    if (window && window.history && window.location) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
    categoryChosenManually.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterLocation, filterCategory, searchTerm]);

  useEffect(() => {
    filterOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, searchTerm, filterCategory, filterLocation]);

  if (!user) return <Navigate to="/login?next=/donors/general" replace />;

  if (loading) {
    return (
      <Container className="donors-page py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">جاري تحميل قائمة العروض...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container className="donors-page" dir="rtl">
      {/* العنوان */}
      <div className="page-header text-center mb-5">
        <h1 className="page-title">
          <FiHeart className="me-2" />
          تبرعات عامة
        </h1>
        <p className="page-subtitle">
          عروض الاستعداد للتبرع المالي أو العيني في مختلف المجالات
        </p>
        <QuranVerse verse="﴿وَيُؤْثِرُونَ عَلَى أَنفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ﴾" />
        <div className="title-divider"></div>
      </div>
      
        {/* إحصاءات بسيطة */}
      <Row className="stats-row mb-2">
        <div className="stat-card">
          <div className="stat-number">{offers.length}</div>
          <div className="stat-label">إجمالي العروض</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredOffers.length}</div>
          <div className="stat-label">النتائج المعروضة</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {offers.filter((o) => o.isActive).length}
          </div>
          <div className="stat-label">عروض نشطة</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {new Set(offers.map((o) => o.location).filter(Boolean)).size}
          </div>
          <div className="stat-label">مدن مختلفة</div>
        </div>
      </Row>


      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>خطأ:</strong> {error}
        </Alert>
      )}

      {/* أدوات البحث والتصفية */}
      <Card className="filters-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="البحث عن عرض بالموقع أو المجال أو الوصف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  categoryChosenManually.current = true;
                }}
              >
                <option value="">جميع المجالات</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="تصفية بالموقع..."
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              />
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                onClick={clearFilters}
                className="w-100"
              >
                <FiFilter className="me-1" />
                إعادة تعيين
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

    
      {/* قائمة العروض */}
      {filteredOffers.length === 0 ? (
        <Card className="text-center  py-5">
          <Card.Body>
            <h4>لا توجد نتائج</h4>
            <p className="text-muted">
              {searchTerm || filterCategory || filterLocation
                ? 'لم يتم العثور على عروض تطابق معايير البحث.'
                : 'لا توجد عروض استعداد للتبرع مسجلة حالياً.'}
            </p>
            {(searchTerm || filterCategory || filterLocation) && (
              <Button variant="primary" onClick={clearFilters}>
                عرض جميع العروض
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4 align-items-stretch">
          {filteredOffers.map((offer) => {
            const dateLabel = offer.availableUntil
              ? formatDate(offer.availableUntil)
              : '';
            const isStillValid = offer.availableUntil
              ? new Date(offer.availableUntil) >=
                new Date(new Date().setHours(0, 0, 0, 0))
              : true;

            return (
              <Col lg={8} xl={4} key={offer._id}>
                <Card className="general-offer-card h-100">
                  <Card.Body>
                    {/* رأس البطاقة */}
                    <div className="donor-header d-flex align-items-center mb-3 justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className="donor-avatar">
                          {/* <div className="avatar-placeholder">م</div> */}
                        </div>
                        <div className="donor-info">
                          <h5 className="donor-name">{offer.title}</h5>
                          <div className="donor-badges">
                            {offer.category && (
                              <Badge
                                bg={getCategoryColor(offer.category)}
                                className="category-badge"
                              >
                                {offer.category}
                              </Badge>
                            )}
                            <Badge
                              bg={
                                offer.donationType === 'تبرع عيني'
                                  ? 'info'
                                  : 'success'
                              }
                              className="ms-1"
                            >
                              {offer.donationType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* تفاصيل العرض */}
                    <div className="donor-details">
                      {offer.location && (
                        <div className="detail-item">
                          <FiMapPin className="detail-icon" />
                          <span>{offer.location}</span>
                        </div>
                      )}

                      {dateLabel && (
                        <div className="detail-item">
                          <FiCalendar className="detail-icon" />
                          <span>متاح حتى: {dateLabel}</span>
                        </div>
                      )}

                      <div className="detail-item">
                        <FiFileText className="detail-icon" />
                        <span>
                          مرفقات:{' '}
                          {offer.attachmentsCount
                            ? `${offer.attachmentsCount} ملف`
                            : 'لا توجد مرفقات'}
                        </span>
                      </div>
                    </div>

                    {/* حالة العرض */}
                    <div
                      className={`offer-status-chip ${
                        isStillValid ? 'active' : 'expired'
                      }`}
                    >
                      {isStillValid
                        ? 'العرض ساري المفعول إلى تاريخ الانتهاء.'
                        : 'انتهت مدة هذا العرض.'}
                    </div>

                    {/* وصف قصير */}
                    {offer.description && (
                      <div className="donor-description">
                        <p>
                          {offer.description.length > 110
                            ? `${offer.description.substring(0, 110)}...`
                            : offer.description}
                        </p>
                      </div>
                    )}

                    {/* أزرار الإجراءات */}
                    <div className="donor-actions mt-3 d-flex flex-wrap gap-2">
                      <Link
                        to={`/ready-general/${offer._id}`}
                        className="btn btn-outline-primary flex-grow-1"
                      >
                        عرض تفاصيل العرض
                      </Link>

                      {offer.whatsapp && (
                        <Button
                          variant="success"
                          as="a"
                          href={`https://wa.me/${offer.whatsapp.replace(
                            /[^\d]/g,
                            ''
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-grow-1"
                        >
                          <FiMessageCircle className="me-1" />
                          واتساب
                        </Button>
                      )}

                      {!offer.whatsapp && offer.phone && (
                        <Button
                          variant="success"
                          as="a"
                          href={`tel:${offer.phone}`}
                          className="flex-grow-1"
                        >
                          <FiPhone className="me-1" />
                          اتصال
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default GeneralDonors;

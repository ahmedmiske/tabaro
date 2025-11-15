// src/pages/GeneralDonors.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Row, Col, Card, Badge, Button,
  Form, InputGroup, Alert, Spinner
} from 'react-bootstrap';
import {
  FiSearch, FiMapPin, FiPhone, FiUser, FiHeart,
  FiCalendar, FiFilter, FiDollarSign
} from 'react-icons/fi';
import { useAuth } from '../AuthContext.jsx';
import { Navigate, Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './GeneralDonors.css';
import { GENERAL_CATEGORY_META, codeToLabel, labelToCode } from '../constants/donationCategories';

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

const GeneralDonors = () => {
  const { user } = useAuth();

  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فلاتر الواجهة
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // اسم عربي (وليس الكود)
  const [filterLocation, setFilterLocation] = useState('');

  // نستخدم هذا العلم لمعرفة إن كانت الفئة اختيرت يدويًا
  const categoryChosenManually = useRef(false);

  const categories = Object.values(GENERAL_CATEGORY_META).map(v => v.label);

  const getCategoryColor = (categoryAr) => {
    const entry = Object.entries(GENERAL_CATEGORY_META)
      .find(([, v]) => v.label === categoryAr);
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

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();

      // ❗️أضف category فقط إذا اختارها المستخدم يدويًا
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

      // مسار احتياطي
      if (!ok) {
        const qs2 = new URLSearchParams(qs);
        if (!qs2.get('type')) qs2.set('type', 'general');
        const url2 = `/api/ready-to-donate?${qs2.toString()}`;
        const r2 = await fetchOnce(url2);
        ok = r2.ok; body = r2.body; usedUrl = url2;
      }

      if (!ok) throw new Error('تعذّر جلب المتبرعين. تحقق من مسار الـ API.');

      const arr = pickArray(body);
      console.info('[GENERAL DONORS] URL:', usedUrl, 'count:', arr.length, 'raw:', body);

      const mapped = arr.map(d => {
        const phone = (d.contactMethods || []).find(m => m.method === 'phone')?.number;
        const fullName = d?.createdBy?.firstName
          ? `${d.createdBy.firstName} ${d.createdBy.lastName || ''}`.trim()
          : (d.fullName || d.name || 'متبرع');

        const profilePicture = d?.createdBy?.profileImage
          ? `/uploads/profileImages/${d.createdBy.profileImage}`
          : null;

        const catCode = d?.extra?.category || d?.category || d?.extraCategory;
        const catAr = codeToLabel(catCode);

        return {
          _id: d._id || d.id,
          fullName,
          categories: [catAr].filter(Boolean),
          location: d.city || d.location || '',
          phone,
          specialties: Array.isArray(d.specialties) ? d.specialties : [],
          totalDonations: d.totalDonations,
          isActive: d.isActive !== false,
          description: d.note || d.description || '',
          joinDate: d.createdAt || d.joinDate,
          profilePicture
        };
      });

      setDonors(mapped);
    } catch (err) {
      console.error('Error fetching donors (general):', err);
      const msg = err?.body?.error || err?.message || 'حدث خطأ في تحميل البيانات';
      setError(msg);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(donor =>
        donor.fullName?.toLowerCase().includes(q) ||
        donor.location?.toLowerCase().includes(q) ||
        (Array.isArray(donor.specialties) &&
         donor.specialties.some(spec => spec.toLowerCase().includes(q)))
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(donor =>
        Array.isArray(donor.categories) && donor.categories.includes(filterCategory)
      );
    }

    if (filterLocation) {
      const q = filterLocation.toLowerCase();
      filtered = filtered.filter(donor =>
        donor.location?.toLowerCase().includes(q)
      );
    }

    setFilteredDonors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
    categoryChosenManually.current = false; // أعد ضبط العلم
    // نظّف شريط العنوان (لو بقيت بارامترات قديمة)
    if (window && window.history && window.location) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // عند أول تحميل: ابدأ بدون أي بارامترات
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

  useEffect(() => { if (user) fetchDonors(); /* eslint-disable-next-line */ }, [user, filterLocation, filterCategory, searchTerm]);
  useEffect(() => { filterDonors(); /* eslint-disable-next-line */ }, [donors, searchTerm, filterCategory, filterLocation]);

  if (!user) return <Navigate to="/login?next=/donors/general" replace />;

  if (loading) {
    return (
      <Container className="donors-page py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">جاري تحميل قائمة المتبرعين...</h4>
        </div>
      </Container>
    );
  }

  return (
    <Container className="donors-page py-5" dir="rtl">
      {/* العنوان */}
      <div className="page-header text-center mb-5">
        <h1 className="page-title">
          <FiHeart className="me-2" />
          المتبرعون العامون
        </h1>
        <p className="page-subtitle">شبكة المتبرعين في المجالات العامة والخيرية</p>
        <div className="title-divider"></div>
      </div>

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
                <InputGroup.Text><FiSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="البحث بالاسم أو المدينة أو التخصص..."
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
                  categoryChosenManually.current = true; // ✅ المستخدم اختار بنفسه
                }}
              >
                <option value="">جميع الفئات</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
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
              <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                <FiFilter className="me-1" />
                إعادة تعيين
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* إحصائيات */}
      <Row className="stats-row mb-4">
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-number">{donors.length}</div>
            <div className="stat-label">إجمالي المتبرعين</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-number">{filteredDonors.length}</div>
            <div className="stat-label">النتائج المعروضة</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-number">
              {donors.filter(d => d.isActive).length}
            </div>
            <div className="stat-label">نشطون</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(donors.map(d => d.location)).size}
            </div>
            <div className="stat-label">مدينة</div>
          </div>
        </Col>
      </Row>

      {/* قائمة المتبرعين */}
      {filteredDonors.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiUser size={60} className="text-muted mb-3" />
            <h4>لا توجد نتائج</h4>
            <p className="text-muted">
              {searchTerm || filterCategory || filterLocation
                ? 'لم يتم العثور على متبرعين يطابقون معايير البحث'
                : 'لا توجد متبرعون مسجلون حالياً'}
            </p>
            {(searchTerm || filterCategory || filterLocation) && (
              <Button variant="primary" onClick={clearFilters}>
                عرض جميع المتبرعين
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4 align-items-stretch">
          {filteredDonors.map((donor, index) => (
            <Col lg={6} xl={4} key={donor._id || index}>
              <Card className="donor-card h-100">
                <Card.Body>
                  {/* رأس البطاقة */}
                  <div className="donor-header d-flex align-items-center mb-3">
                    <div className="donor-avatar">
                      {donor.profilePicture ? (
                        <img src={donor.profilePicture} alt={donor.fullName} className="avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {donor.fullName?.charAt(0)?.toUpperCase() || 'م'}
                        </div>
                      )}
                    </div>
                    <div className="donor-info">
                      <h5 className="donor-name">{donor.fullName || 'متبرع'}</h5>
                      <div className="donor-badges">
                        {donor.categories?.slice(0, 2).map((category, idx) => (
                          <Badge key={idx} bg={getCategoryColor(category)} className="category-badge">
                            {category}
                          </Badge>
                        ))}
                        {donor.isActive && (
                          <Badge bg="success" className="ms-2">نشط</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* تفاصيل */}
                  <div className="donor-details">
                    {donor.location && (
                      <div className="detail-item">
                        <FiMapPin className="detail-icon" />
                        <span>{donor.location}</span>
                      </div>
                    )}
                    {donor.totalDonations && (
                      <div className="detail-item">
                        <FiDollarSign className="detail-icon" />
                        <span>{donor.totalDonations} تبرع</span>
                      </div>
                    )}
                    {donor.joinDate && (
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>انضم: {new Date(donor.joinDate).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>

                  {/* وصف قصير */}
                  {donor.description && (
                    <div className="donor-description">
                      <p>
                        {donor.description.length > 100
                          ? `${donor.description.substring(0, 100)}...`
                          : donor.description}
                      </p>
                    </div>
                  )}

                  {/* إجراءات */}
                  <div className="donor-actions mt-3">
                    <Link to={`/users/${donor._id}`} className="btn btn-outline-primary btn-sm me-2">
                      عرض الملف الشخصي
                    </Link>
                    {donor.phone && (
                      <Button variant="success" size="sm" href={`tel:${donor.phone}`}>
                        <FiPhone className="me-1" /> اتصال
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* دعوة للتطوع */}
      <Card className="call-to-action-card mt-5">
        <Card.Body className="text-center">
          <FiHeart size={50} className="text-primary mb-3" />
          <h4>هل تريد أن تصبح متبرعاً؟</h4>
          <p className="text-muted mb-4">انضم إلى شبكة المتبرعين العامين وساهم في مساعدة المحتاجين</p>
          <Link to="/donation-requests" className="btn btn-primary btn-lg">
            سجل كمتبرع عام
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GeneralDonors;

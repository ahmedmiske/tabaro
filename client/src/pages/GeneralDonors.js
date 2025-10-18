// src/pages/GeneralDonors.js
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FiSearch, FiMapPin, FiPhone, FiUser, FiHeart, FiCalendar, FiFilter, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { Navigate, Link, useLocation } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './GeneralDonors.css';

const GeneralDonors = () => {
  const { user } = useAuth();
  const locationHook = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);

  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // تسميات عربية <-> أكواد السيرفر
  const categoryLabel = {
    money: 'المساعدات المالية',
    goods: 'مواد/أغراض',
    time: 'تطوع بالوقت/الجهد',
    other: 'أخرى'
  };
  const labelToCode = {
    'المساعدات المالية': 'money',
    'مواد/أغراض': 'goods',
    'تطوع بالوقت/الجهد': 'time',
    'أخرى': 'other'
  };

  const [searchTerm, setSearchTerm] = useState(urlParams.get('q') || '');
  const [filterCategory, setFilterCategory] = useState(categoryLabel[urlParams.get('category')] || '');
  const [filterLocation, setFilterLocation] = useState(urlParams.get('city') || '');

  const categoriesUI = ['المساعدات المالية', 'مواد/أغراض', 'تطوع بالوقت/الجهد', 'أخرى'];

  const getCategoryColor = (categoryAr) => {
    const colors = {
      'المساعدات المالية': 'success',
      'مواد/أغراض': 'secondary',
      'تطوع بالوقت/الجهد': 'info',
      'أخرى': 'secondary'
    };
    return colors[categoryAr] || 'secondary';
  };

  // 🔗 الجلب من الباك باستخدام res.body
  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();
      const categoryCode = labelToCode[filterCategory] || urlParams.get('category') || '';
      if (categoryCode) qs.set('category', categoryCode);
      if (filterLocation) qs.set('city', filterLocation);
      if (searchTerm) qs.set('q', searchTerm);

      const res = await fetchWithInterceptors(`/api/ready-to-donate-general?${qs.toString()}`);
      const body = res?.body;

      const arr = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
      const mapped = arr.map(d => {
        const phone = (d.contactMethods || []).find(m => m.method === 'phone')?.number;
        const fullName = d?.createdBy?.firstName
          ? `${d.createdBy.firstName} ${d.createdBy.lastName || ''}`.trim()
          : 'متبرع';
        const profilePicture = d?.createdBy?.profileImage
          ? `/uploads/profileImages/${d.createdBy.profileImage}`
          : null;

        const catCode = d?.extra?.category;
        const catAr = categoryLabel[catCode] || 'أخرى';

        return {
          _id: d._id,
          fullName,
          categories: [catAr],
          location: d.city,
          phone,
          specialties: [],
          totalDonations: undefined,
          isActive: true,
          description: d.note || '',
          joinDate: d.createdAt,
          profilePicture
        };
      });

      setDonors(mapped);
    } catch (err) {
      console.error('Error fetching donors:', err);
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
        donor.specialties?.some(spec => spec.toLowerCase().includes(q))
      );
    }
    if (filterCategory) {
      filtered = filtered.filter(donor => donor.categories?.includes(filterCategory));
    }
    if (filterLocation) {
      const q = filterLocation.toLowerCase();
      filtered = filtered.filter(donor => donor.location?.toLowerCase().includes(q));
    }
    setFilteredDonors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
  };

  useEffect(() => {
    if (user) fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterLocation, filterCategory]);

  useEffect(() => {
    filterDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [donors, searchTerm, filterCategory, filterLocation]);

  if (!user) {
    return <Navigate to="/login?next=/donors/general" replace />;
  }

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
      {/* العنوان الرئيسي */}
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
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">جميع الفئات</option>
                {categoriesUI.map(category => (
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

      {/* إحصائيات سريعة */}
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
            <div className="stat-number">{donors.filter(d => d.isActive).length}</div>
            <div className="stat-label">نشطون</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-number">{new Set(donors.map(d => d.location)).size}</div>
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
              <Button variant="primary" onClick={clearFilters}>عرض جميع المتبرعين</Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filteredDonors.map((donor, index) => (
            <Col lg={6} xl={4} key={donor._id || index} className="mb-4">
              <Card className="donor-card h-100">
                <Card.Body>
                  {/* صورة المتبرع واسمه */}
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
                          <Badge bg="success" className="ms-2">
                            نشط
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* معلومات المتبرع */}
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
                      <p>{donor.description.length > 100
                        ? `${donor.description.substring(0, 100)}...`
                        : donor.description}
                      </p>
                    </div>
                  )}

                  {/* أزرار الإجراء */}
                  <div className="donor-actions mt-3">
                    <Link to={`/users/${donor._id}`} className="btn btn-outline-primary btn-sm me-2">
                      عرض الملف الشخصي
                    </Link>
                    {donor.phone && (
                      <Button variant="success" size="sm" href={`tel:${donor.phone}`}>
                        <FiPhone className="me-1" />
                        اتصال
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* دعوة للتطوع/التبرع */}
      <Card className="call-to-action-card mt-5">
        <Card.Body className="text-center">
          <FiHeart size={50} className="text-primary mb-3" />
          <h4>هل تريد أن تصبح متبرعاً؟</h4>
          <p className="text-muted mb-4">انضم إلى شبكة المتبرعين العامين وساهم في مساعدة المحتاجين</p>
          <Link to="/donation-requests" className="btn btn-primary btn-lg">سجل كمتبرع عام</Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GeneralDonors;

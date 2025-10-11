// src/pages/GeneralDonors.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FiSearch, FiMapPin, FiPhone, FiUser, FiHeart, FiCalendar, FiFilter, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './GeneralDonors.css';

const GeneralDonors = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const categories = [
    'الصحة',
    'التعليم', 
    'السكن',
    'الكوارث الطبيعية',
    'المساعدات المالية',
    'أخرى'
  ];

  // إذا لم يكن المستخدم مسجلاً، إعادة توجيه لصفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login?next=/donors/general" replace />;
  }

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    filterDonors();
  }, [donors, searchTerm, filterCategory, filterLocation]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      // بيانات تجريبية حتى يتم ربط الخادم
      const mockDonors = [
        {
          _id: '1',
          fullName: 'عائشة محمد',
          categories: ['الصحة', 'التعليم'],
          location: 'نواكشوط',
          phone: '11223344',
          specialties: ['التمريض', 'التدريس'],
          totalDonations: 5,
          isActive: true,
          description: 'متخصصة في التمريض والتعليم الصحي',
          joinDate: '2023-03-15'
        },
        {
          _id: '2',
          fullName: 'محمد الأمين',
          categories: ['السكن', 'الكوارث الطبيعية'],
          location: 'نواذيبو',
          phone: '55667788',
          specialties: ['البناء', 'الإغاثة'],
          totalDonations: 8,
          isActive: true,
          description: 'خبرة في البناء والإغاثة في الكوارث',
          joinDate: '2023-01-20'
        },
        {
          _id: '3',
          fullName: 'خديجة أحمد',
          categories: ['التعليم', 'المساعدات المالية'],
          location: 'أطار',
          specialties: ['الرياضيات', 'المحاسبة'],
          totalDonations: 3,
          isActive: false,
          description: 'مدرسة رياضيات ومحاسبة',
          joinDate: '2023-07-10'
        }
      ];
      
      setDonors(mockDonors);
      setError('');
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filterDonors = () => {
    let filtered = donors;

    // تصفية بالبحث
    if (searchTerm) {
      filtered = filtered.filter(donor => 
        donor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.specialties?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // تصفية بالفئة
    if (filterCategory) {
      filtered = filtered.filter(donor => 
        donor.categories?.includes(filterCategory)
      );
    }

    // تصفية بالموقع
    if (filterLocation) {
      filtered = filtered.filter(donor => 
        donor.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterLocation('');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'الصحة': 'danger',
      'التعليم': 'primary',
      'السكن': 'warning',
      'الكوارث الطبيعية': 'info',
      'المساعدات المالية': 'success',
      'أخرى': 'secondary'
    };
    return colors[category] || 'secondary';
  };

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
        <p className="page-subtitle">
          شبكة المتبرعين في المجالات العامة والخيرية
        </p>
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
        <Row>
          {filteredDonors.map((donor, index) => (
            <Col lg={6} xl={4} key={donor._id || index} className="mb-4">
              <Card className="donor-card h-100">
                <Card.Body>
                  {/* صورة المتبرع واسمه */}
                  <div className="donor-header d-flex align-items-center mb-3">
                    <div className="donor-avatar">
                      {donor.profilePicture ? (
                        <img 
                          src={donor.profilePicture} 
                          alt={donor.fullName}
                          className="avatar-img"
                        />
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
                          <Badge 
                            key={idx}
                            bg={getCategoryColor(category)} 
                            className="category-badge"
                          >
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
                    {donor.specialties?.length > 0 && (
                      <div className="detail-item">
                        <FiUser className="detail-icon" />
                        <span>{donor.specialties.join(', ')}</span>
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
                    <Link 
                      to={`/profile/${donor._id}`} 
                      className="btn btn-outline-primary btn-sm me-2"
                    >
                      عرض الملف الشخصي
                    </Link>
                    {donor.phone && (
                      <Button 
                        variant="success" 
                        size="sm"
                        href={`tel:${donor.phone}`}
                      >
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

      {/* دعوة للتبرع */}
      <Card className="call-to-action-card mt-5">
        <Card.Body className="text-center">
          <FiHeart size={50} className="text-primary mb-3" />
          <h4>هل تريد أن تصبح متبرعاً؟</h4>
          <p className="text-muted mb-4">
            انضم إلى شبكة المتبرعين العامين وساهم في مساعدة المحتاجين
          </p>
          <Link to="/donation-requests" className="btn btn-primary btn-lg">
            سجل كمتبرع عام
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GeneralDonors;
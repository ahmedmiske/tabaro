// src/pages/BloodDonors.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FiSearch, FiMapPin, FiPhone, FiUser, FiDroplet, FiCalendar, FiFilter } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { Navigate, Link } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './BloodDonors.css';

const BloodDonors = () => {
  const { user } = useAuth();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const fetchDonors = async () => {
    try {
      setLoading(true);
      // بيانات تجريبية حتى يتم ربط الخادم
      const mockDonors = [
        {
          _id: '1',
          fullName: 'أحمد محمد',
          bloodType: 'O+',
          location: 'نواكشوط',
          phone: '12345678',
          age: 28,
          lastDonation: '2024-01-15',
          isAvailable: true,
          joinDate: '2023-06-01'
        },
        {
          _id: '2',
          fullName: 'فاطمة أحمد',
          bloodType: 'A+',
          location: 'نواذيبو',
          age: 32,
          isAvailable: true,
          joinDate: '2023-08-12'
        },
        {
          _id: '3',
          fullName: 'محمد الأمين',
          bloodType: 'B-',
          location: 'أطار',
          phone: '87654321',
          age: 25,
          lastDonation: '2024-02-20',
          isAvailable: false,
          joinDate: '2023-05-20'
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
        donor.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية بفصيلة الدم
    if (filterBloodType) {
      filtered = filtered.filter(donor => donor.bloodType === filterBloodType);
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
    setFilterBloodType('');
    setFilterLocation('');
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'danger', 'A-': 'danger',
      'B+': 'info', 'B-': 'info',
      'AB+': 'warning', 'AB-': 'warning',
      'O+': 'success', 'O-': 'success'
    };
    return colors[bloodType] || 'secondary';
  };

  // استخدام useEffect للتحكم في التوجيه وجلب البيانات
  useEffect(() => {
    if (user) {
      fetchDonors();
    }
  }, [user]);

  useEffect(() => {
    filterDonors();
  }, [donors, searchTerm, filterBloodType, filterLocation]);

  // إذا لم يكن المستخدم مسجلاً، إعادة توجيه لصفحة تسجيل الدخول
  if (!user) {
    return <Navigate to="/login?next=/donors/blood" replace />;
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
          <FiDroplet className="me-2" />
          المتبرعون بالدم
        </h1>
        <p className="page-subtitle">
          شبكة المتبرعين المسجلين في المنصة الوطنية للتبرع
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
                  placeholder="البحث بالاسم أو المدينة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
              >
                <option value="">جميع فصائل الدم</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
              {donors.filter(d => d.isAvailable).length}
            </div>
            <div className="stat-label">متاحون للتبرع</div>
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
              {searchTerm || filterBloodType || filterLocation 
                ? 'لم يتم العثور على متبرعين يطابقون معايير البحث' 
                : 'لا توجد متبرعون مسجلون حالياً'}
            </p>
            {(searchTerm || filterBloodType || filterLocation) && (
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
                        <Badge 
                          bg={getBloodTypeColor(donor.bloodType)} 
                          className="blood-type-badge"
                        >
                          <FiDroplet className="me-1" />
                          {donor.bloodType}
                        </Badge>
                        {donor.isAvailable && (
                          <Badge bg="success" className="ms-2">
                            متاح للتبرع
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
                    {donor.age && (
                      <div className="detail-item">
                        <FiUser className="detail-icon" />
                        <span>{donor.age} سنة</span>
                      </div>
                    )}
                    {donor.lastDonation && (
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>آخر تبرع: {new Date(donor.lastDonation).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>

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
          <FiDroplet size={50} className="text-primary mb-3" />
          <h4>هل تريد أن تصبح متبرعاً؟</h4>
          <p className="text-muted mb-4">
            انضم إلى شبكة المتبرعين وساهم في إنقاذ الأرواح
          </p>
          <Link to="/blood-donation" className="btn btn-primary btn-lg">
            سجل كمتبرع
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default BloodDonors;
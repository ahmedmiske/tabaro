// src/pages/BloodDonors.js
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FaComments } from 'react-icons/fa';
import { FiSearch, FiMapPin, FiPhone, FiUser, FiDroplet, FiCalendar, FiFilter } from 'react-icons/fi';
import { useAuth } from '../AuthContext.jsx';
import { Navigate, Link, useLocation } from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './BloodDonors.css';
import QuranVerse from "../components/QuranVerse.jsx";


const BloodDonors = () => {
  const { user } = useAuth();
  const locationHook = useLocation();
  const urlParams = useMemo(() => new URLSearchParams(locationHook.search), [locationHook.search]);

  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // فلاتر واجهة + قراءة من URL
  const [searchTerm, setSearchTerm] = useState(urlParams.get('q') || '');
  const [filterBloodType, setFilterBloodType] = useState(urlParams.get('bloodType') || '');
  const [filterLocation, setFilterLocation] = useState(urlParams.get('location') || '');

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A+': 'danger', 'A-': 'danger',
      'B+': 'info', 'B-': 'info',
      'AB+': 'warning', 'AB-': 'warning',
      'O+': 'success', 'O-': 'success'
    };
    return colors[bloodType] || 'secondary';
  };

  // الجلب من الباك باستخدام res.body
  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError('');

      const qs = new URLSearchParams();
      if (filterBloodType) qs.set('bloodType', filterBloodType);
      if (filterLocation) qs.set('location', filterLocation);
      if (searchTerm) qs.set('q', searchTerm);

      const res = await fetchWithInterceptors(`/api/ready-to-donate-blood?${qs.toString()}`);
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

        return {
          _id: d._id,
          fullName,
          bloodType: d.bloodType,
          location: d.location,
          phone,
          age: undefined,
          lastDonation: undefined,
          isAvailable: true,
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
        donor.location?.toLowerCase().includes(q)
      );
    }
    if (filterBloodType) filtered = filtered.filter(donor => donor.bloodType === filterBloodType);
    if (filterLocation) {
      const q = filterLocation.toLowerCase();
      filtered = filtered.filter(donor => donor.location?.toLowerCase().includes(q));
    }
    setFilteredDonors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBloodType('');
    setFilterLocation('');
  };

  useEffect(() => { if (user) fetchDonors(); /* eslint-disable-next-line */ }, [user, filterBloodType, filterLocation]);
  useEffect(() => { filterDonors(); /* eslint-disable-next-line */ }, [donors, searchTerm, filterBloodType, filterLocation]);

  if (!user) return <Navigate to="/login?next=/donors/blood" replace />;

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
    <Container className="donors-page" dir="rtl">
      {/* العنوان */}
      <div className="page-header text-center mb-5">
        <h1 className="page-title">
          <FiDroplet className="me-2" />
          المتبرعون بالدم
        </h1>
        <p className="page-subtitle">شبكة المتبرعين المسجلين في المنصة الوطنية للتبرع</p>
         <QuranVerse verse="﴿وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ هُوَ خَيْرًا وَأَعْظَمَ أَجْرًا﴾" />
        
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
              <Form.Select value={filterBloodType} onChange={(e) => setFilterBloodType(e.target.value)}>
                <option value="">جميع فصائل الدم</option>
                {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
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
                <FiFilter className="me-1" /> إعادة تعيين
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* إحصائيات */}
      <Row className="stats-row mb-4">
        <div className="stats-row mb-4">
          <div className="stat-card">
            <div className="stat-number">{donors.length}</div>
            <div className="stat-label">إجمالي المتبرعين</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredDonors.length}</div>
            <div className="stat-label">النتائج المعروضة</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{donors.filter(d => d.isAvailable).length}</div>
            <div className="stat-label">متاحون للتبرع</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{new Set(donors.map(d => d.location)).size}</div>
            <div className="stat-label">مدينة</div>
          </div>
        </div>
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
              <Button variant="primary" onClick={clearFilters}>عرض جميع المتبرعين</Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4 align-items-stretch">
          {filteredDonors.map((donor, index) => (
            <Col  key={donor._id || index}>
              <Card className="donor-card" >
                <Card.Body>
                  {/* صورة + اسم */}
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
                        {donor.bloodType && (
                          <Badge bg={getBloodTypeColor(donor.bloodType)} className="blood-type-badge">
                            <FiDroplet className="me-1" />
                            {donor.bloodType}
                          </Badge>
                        )}
                        {donor.isAvailable && <Badge bg="success" className="ms-2">متاح للتبرع</Badge>}
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
                    {donor.lastDonation && (
                      <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <span>آخر تبرع: {new Date(donor.lastDonation).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>

                  {/* إجراءات */}
                  <div className="donor-actions mt-3">
                    <Link to={`/users/${donor._id}`} className="btn btn-outline-primary btn-sm me-2">
                      عرض الملف الشخصي
                    </Link>
                    <Link to={`/chat/${donor._id}`} className="chat-icon-link me-2" title="دردشة مع المتبرع">
                      <FaComments size={26} color="#0dcaf0" />
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

     
    </Container>
  );
};

export default BloodDonors;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiMapPin, FiClock, FiUser, FiHeart, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function BloodDonationListe() {
  // إضافة نمط CSS للدوران
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchBloodRequests();
  }, [currentPage]);

  const fetchBloodRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWithInterceptors(
        `/api/blood-requests?page=${currentPage}&limit=10`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        setBloodRequests(data.requests || []);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error('فشل في تحميل طلبات التبرع');
      }
    } catch (err) {
      console.error('خطأ أثناء جلب بيانات التبرع:', err);
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return bloodRequests.filter(request => {
      const matchesSearch = request.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.requesterName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBloodType = !filterBloodType || request.bloodType === filterBloodType;
      
      return matchesSearch && matchesBloodType;
    });
  }, [bloodRequests, searchTerm, filterBloodType]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return '#dc2626';
      case 'medium': return '#d97706';
      case 'low': return '#059669';
      default: return '#6b7280';
    }
  };

  const getUrgencyText = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return 'عاجل جداً';
      case 'medium': return 'متوسط الأولوية';
      case 'low': return 'غير عاجل';
      default: return 'غير محدد';
    }
  };

  const containerStyles = {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1rem'
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: '3rem'
  };

  const titleStyles = {
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#1f2937',
    marginBottom: '1rem'
  };

  const subtitleStyles = {
    fontSize: '1.125rem',
    color: '#6b7280',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const filtersStyles = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  };

  const searchBoxStyles = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    flex: 1,
    minWidth: '300px'
  };

  const searchInputStyles = {
    border: 'none',
    outline: 'none',
    flex: 1,
    marginRight: '0.5rem',
    fontSize: '1rem',
    color: '#1f2937'
  };

  const filterSelectStyles = {
    padding: '0.75rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: 'white',
    color: '#1f2937',
    fontSize: '1rem',
    minWidth: '150px'
  };

  const refreshButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'background-color 0.2s ease'
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  };

  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    position: 'relative'
  };

  const urgencyBadgeStyles = (urgency) => ({
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    backgroundColor: getUrgencyColor(urgency),
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600
  });

  const bloodTypeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '50%',
    fontSize: '1.125rem',
    fontWeight: 700,
    marginBottom: '1rem'
  };

  const cardTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '0.5rem'
  };

  const cardDetailStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem',
    marginBottom: '0.5rem'
  };

  const cardDescriptionStyles = {
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '1rem'
  };

  const cardButtonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'background-color 0.2s ease',
    width: '100%',
    justifyContent: 'center'
  };

  const paginationStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem'
  };

  const pageButtonStyles = {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    color: '#6b7280',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const activePageButtonStyles = {
    ...pageButtonStyles,
    backgroundColor: '#dc2626',
    color: 'white',
    borderColor: '#dc2626'
  };

  const loadingStyles = {
    textAlign: 'center',
    padding: '4rem',
    color: '#6b7280'
  };

  const errorStyles = {
    textAlign: 'center',
    padding: '4rem',
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    borderRadius: '0.5rem',
    border: '1px solid #fecaca'
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: '4rem',
    color: '#6b7280'
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <FiRefreshCw size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p>جاري تحميل طلبات التبرع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyles}>
        <div style={errorStyles}>
          <h3>حدث خطأ</h3>
          <p>{error}</p>
          <button 
            onClick={fetchBloodRequests} 
            style={refreshButtonStyles}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            <FiRefreshCw size={16} />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h1 style={titleStyles}>طلبات التبرع بالدم</h1>
        <p style={subtitleStyles}>
          ساعد في إنقاذ الأرواح من خلال التبرع بالدم للحالات المحتاجة
        </p>
      </div>

      <div style={filtersStyles}>
        <div style={searchBoxStyles}>
          <FiSearch size={20} color="#6b7280" />
          <input
            type="text"
            placeholder="البحث بالموقع، المستشفى، أو اسم الطالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyles}
          />
        </div>

        <select
          value={filterBloodType}
          onChange={(e) => setFilterBloodType(e.target.value)}
          style={filterSelectStyles}
        >
          <option value="">جميع فصائل الدم</option>
          {bloodTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button 
          onClick={fetchBloodRequests}
          style={refreshButtonStyles}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          <FiRefreshCw size={16} />
          تحديث
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div style={emptyStateStyles}>
          <FiDroplet size={64} color="#e5e7eb" style={{ marginBottom: '1rem' }} />
          <h3>لا توجد طلبات تبرع</h3>
          <p>لم يتم العثور على أي طلبات تبرع تطابق معايير البحث</p>
        </div>
      ) : (
        <>
          <div style={gridStyles}>
            {filteredRequests.map((request) => (
              <div 
                key={request._id} 
                style={cardStyles}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={urgencyBadgeStyles(request.urgency)}>
                  {getUrgencyText(request.urgency)}
                </div>

                <div style={bloodTypeStyles}>
                  {request.bloodType}
                </div>

                <h3 style={cardTitleStyles}>
                  {request.hospitalName || 'مستشفى غير محدد'}
                </h3>

                <div style={cardDetailStyles}>
                  <FiMapPin size={16} />
                  <span>{request.location || 'الموقع غير محدد'}</span>
                </div>

                <div style={cardDetailStyles}>
                  <FiUser size={16} />
                  <span>{request.requesterName || 'طالب غير محدد'}</span>
                </div>

                <div style={cardDetailStyles}>
                  <FiClock size={16} />
                  <span>تاريخ الطلب: {formatDate(request.createdAt)}</span>
                </div>

                {request.description && (
                  <p style={cardDescriptionStyles}>
                    {request.description.length > 100 
                      ? `${request.description.substring(0, 100)}...` 
                      : request.description
                    }
                  </p>
                )}

                <Link 
                  to={`/blood-donation-details/${request._id}`}
                  style={cardButtonStyles}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  <FiHeart size={16} />
                  عرض التفاصيل والتبرع
                </Link>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={paginationStyles}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...pageButtonStyles,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                السابق
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span style={{ color: '#6b7280' }}>...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      style={currentPage === page ? activePageButtonStyles : pageButtonStyles}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...pageButtonStyles,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                التالي
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BloodDonationListe;
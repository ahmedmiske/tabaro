// src/components/BloodDonationListe.jsx
import React, { useState, useEffect } from 'react';
import { Row, Spinner, Button } from 'react-bootstrap';
import './BloodDonationListe.css';
import TitleMain from './TitleMain.jsx';
import FindeNot from './FindeNot.jsx';
import DonationCard from './DonationCard.jsx';
import DonationFilterBar from './DonationFilterBar.jsx';
import fetchWithInterceptors from '../services/fetchWithInterceptors.js';

const PAGE_SIZE = 12;

function BloodDonationListe() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // فلاتر
  const [selectedBloodType, setSelectedBloodType] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const extractListAndPages = (body) => {
    let list = [];
    let pages =
      body?.pages ??
      body?.totalPages ??
      body?.pagination?.pages ??
      body?.data?.pages ??
      0;

    if (Array.isArray(body)) {
      list = body;
    } else if (Array.isArray(body?.items)) {
      list = body.items;
    } else if (Array.isArray(body?.data)) {
      list = body.data;
    } else if (Array.isArray(body?.result)) {
      list = body.result;
    } else if (Array.isArray(body?.docs)) {
      list = body.docs;
    } else if (Array.isArray(body?.data?.items)) {
      list = body.data.items;
      pages = body.data.pages ?? body.data.totalPages ?? pages;
    }

    if (!pages || Number.isNaN(Number(pages))) {
      const total =
        body?.total ??
        body?.count ??
        body?.totalDocs ??
        body?.pagination?.total ??
        list.length;

      const limit =
        body?.limit ??
        body?.perPage ??
        body?.pagination?.limit ??
        PAGE_SIZE;

      pages = Math.max(1, Math.ceil(Number(total) / Number(limit)));
    }

    return { list, pages: Number(pages) || 1 };
  };

  // جلب الطلبات من السيرفر
  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchWithInterceptors(
          `/api/blood-requests?status=active&page=${page}&limit=${PAGE_SIZE}`,
          { method: 'GET' },
        );

        const { list, pages } = extractListAndPages(res.body);

        setDonations(list || []);
        setFilteredDonations(list || []);
        setTotalPages(pages || 1);
      } catch (err) {
        console.error('خطأ أثناء جلب بيانات التبرع:', err);
        setError(err?.message || 'حدث خطأ أثناء تحميل بيانات التبرع.');
        setDonations([]);
        setFilteredDonations([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [page]);

  // تطبيق الفلاتر على القائمة
  useEffect(() => {
    let filtered = Array.isArray(donations) ? [...donations] : [];

    // فصيلة الدم
    if (selectedBloodType && selectedBloodType !== 'ALL') {
      filtered = filtered.filter((d) => d?.bloodType === selectedBloodType);
    }

    // الموقع
    if (selectedLocation && selectedLocation !== 'ALL') {
      filtered = filtered.filter((d) => {
        const loc = d?.location || d?.place || '';
        return loc === selectedLocation;
      });
    }

    // الحالات المستعجلة فقط
    if (urgentOnly) {
      filtered = filtered.filter((d) => d?.isUrgent === true);
    }

    setFilteredDonations(filtered);
  }, [selectedBloodType, selectedLocation, urgentOnly, donations]);

  // مسح الفلاتر
  const handleClearFilters = () => {
    setSelectedBloodType('ALL');
    setSelectedLocation('ALL');
    setUrgentOnly(false);
    setFilteredDonations(donations);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">جاري التحميل…</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-danger my-4">{error}</p>;
  }

  // جميع الفصائل المتاحة
  const donationTypes = [
    'ALL',
    ...new Set(
      (donations || [])
        .map((d) => d?.bloodType)
        .filter(Boolean),
    ),
  ];

  // جميع المواقع المتاحة
  const locations = [
    'ALL',
    ...new Set(
      (donations || [])
        .map((d) => d?.place || d?.location)
        .filter(Boolean),
    ),
  ];

  return (
    <section className="blood-donation-section" dir="rtl">
      {/* 1. العنوان */}
      <div className="blood-head-block">
        <TitleMain
          title="🩸 طلبات التبرع بالدم"
          subtitle="حالات تحتاج تبرعك الآن"
          align="center"
          size="lg"
        />
      </div>

      {/* 2. الفلاتر */}
      <div className="blood-filter-block">
        <DonationFilterBar
          bloodTypes={donationTypes}
          locations={locations}
          selectedBloodType={selectedBloodType}
          setSelectedBloodType={setSelectedBloodType}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          urgentOnly={urgentOnly}
          setUrgentOnly={setUrgentOnly}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* 3. فاصل بسيط */}
      <div className="blood-divider" />

      {/* 4. النتائج */}
      <div className="blood-card-wrapper">
        {Array.isArray(filteredDonations) && filteredDonations.length === 0 ? (
          <FindeNot />
        ) : (
          <>
            <Row className="blood-grid">
              {(filteredDonations || []).map((d) => (
                <div
                  key={d?._id || Math.random()}
                  className="blood-grid-item"
                >
                  <DonationCard donation={d} />
                </div>
              ))}
            </Row>

            <div className="blood-pagination text-center d-flex flex-wrap justify-content-center gap-3">
              <Button
                style={{
                  borderColor: 'var(--border-soft)',
                  color: 'var(--text-main-dark)',
                  backgroundColor: '#fff',
                  borderWidth: '2px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '110px',
                }}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                ⬅ السابقة
              </Button>

              <span
                className="align-self-center"
                style={{ fontSize: '.9rem', fontWeight: '500' }}
              >
                الصفحة {page} من {totalPages}
              </span>

              <Button
                style={{
                  borderColor: 'var(--main-color)',
                  color: 'var(--main-color)',
                  backgroundColor: '#fff',
                  borderWidth: '2px',
                  fontWeight: '600',
                  borderRadius: 'var(--radius-md)',
                  minWidth: '110px',
                }}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                التالية ➡
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default BloodDonationListe;

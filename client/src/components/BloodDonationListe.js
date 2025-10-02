import React, { useState, useEffect } from 'react';
import { Row, Spinner, Button } from './ui';
import './BloodDonationListe.css';
import Title from './Title';
import DonorFilter from './DonorFilter';
import DonationCard from './DonationCard';
import FindeNot from './FindeNot';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const PAGE_SIZE = 12;

function BloodDonationListe() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // يطبع الرد ويستخرج القائمة والصفحات من أشكال متعددة
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
      // أحيانًا data تكون هي القائمة
      list = body.data;
    } else if (Array.isArray(body?.result)) {
      list = body.result;
    } else if (Array.isArray(body?.docs)) {
      // mongoose-paginate-v2
      list = body.docs;
    } else if (Array.isArray(body?.data?.items)) {
      // بعض الـ APIs تُعيد data:{ items: [...] }
      list = body.data.items;
      pages = body.data.pages ?? body.data.totalPages ?? pages;
    }

    // احسب الصفحات لو ما وصلتنا صراحة
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

  const fetchDonations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchWithInterceptors(
        `/api/blood-requests?status=active&page=${page}&limit=${PAGE_SIZE}`,
        { method: 'GET' }
      );

      const { list, pages } = extractListAndPages(res.body);
      // تم تحميل البيانات بنجاح

      setDonations(list);
      setFilteredDonations(list);
      setTotalPages(pages);
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

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    let filtered = Array.isArray(donations) ? [...donations] : [];

    if (filter) filtered = filtered.filter(d => d?.bloodType === filter);

    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter(d => new Date(d?.createdAt) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      filtered = filtered.filter(d => new Date(d?.createdAt) <= e);
    }

    setFilteredDonations(filtered);
  }, [filter, startDate, endDate, donations]);

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

  const donationTypes = Array.isArray(donations)
    ? [...new Set(donations.map(d => d?.bloodType).filter(Boolean))]
    : [];

  return (
    <div className="donation-container py-4">
      <Title text="طلبات التبرع بالدم" />

      <DonorFilter
        filter={filter} setFilter={setFilter}
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        donationTypes={donationTypes}
      />

      <div className="container-card my-4">
        {Array.isArray(filteredDonations) && filteredDonations.length === 0 ? (
          <FindeNot />
        ) : (
          <>
            <Row className="donation-grid">
              {(filteredDonations || []).map(d => (
                <DonationCard key={d?._id || Math.random()} donation={d} />
              ))}
            </Row>

            <div className="pagination-controls text-center mt-4 d-flex justify-content-center gap-3">
              <Button
                variant="outline-secondary"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page <= 1}
              >
                ➡️ السابقة
              </Button>

              <span className="align-self-center">الصفحة {page} من {totalPages}</span>

              <Button
                variant="outline-primary"
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages}
              >
                ⬅️ التالية
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BloodDonationListe;

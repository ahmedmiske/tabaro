import React, { useState, useEffect } from 'react';
import { Row, Spinner, Button } from 'react-bootstrap';
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

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithInterceptors(`/api/blood-requests?page=${page}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      const data = res.body.result || res.body;
      setDonations(data);
      setFilteredDonations(data);
      if (res.body.pages) setTotalPages(res.body.pages);
    } catch (err) {
      console.error('خطأ أثناء جلب بيانات التبرع:', err);
      setError('حدث خطأ أثناء تحميل بيانات التبرع.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [page]);

  useEffect(() => {
    let filtered = [...donations];
    if (filter) filtered = filtered.filter(d => d.bloodType === filter);
    if (startDate) filtered = filtered.filter(d => new Date(d.createdAt) >= new Date(startDate));
    if (endDate) filtered = filtered.filter(d => new Date(d.createdAt) <= new Date(endDate));
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

  const donationTypes = [...new Set(donations.map(d => d.bloodType))];

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
        {filteredDonations.length === 0 ? (
          <FindeNot />
        ) : (
          <>
            <Row className="donation-grid">
              {filteredDonations.map(d => (
                <DonationCard key={d._id} donation={d} />
              ))}
            </Row>
            <div className="pagination-controls text-center mt-4 d-flex justify-content-center gap-3">
              <Button
                variant="outline-secondary"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                   ➡️ 
             السابقة
              </Button>
              <span className="align-self-center">الصفحة {page} من {totalPages}</span>
              <Button
                variant="outline-primary"
                onClick={() => setPage(prev => prev + 1)}
                disabled={page === totalPages}
              >
              ⬅️  التالية 
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BloodDonationListe;

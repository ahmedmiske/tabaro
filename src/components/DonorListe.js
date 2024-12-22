import React, { useState, useEffect } from 'react';
import { Row, Container } from 'react-bootstrap';
import './DonorList.css';
import Title from './Title';
import DonorFilter from './DonorFilter';
import DonationCard from './DonationCard';
import FindeNot from './FindeNot'; // استدعاء مكون FindeNot

function DonorListe() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await fetch('http://localhost:5000/donations');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setDonations(data);
        setFilteredDonations(data);
        setLoading(false);
      } catch (error) {
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  useEffect(() => {
    let filtered = donations;

    if (filter) {
      filtered = filtered.filter(donation => donation.type === filter);
    }

    if (startDate) {
      filtered = filtered.filter(donation => new Date(donation.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(donation => new Date(donation.date) <= new Date(endDate));
    }

    setFilteredDonations(filtered);
  }, [filter, startDate, endDate, donations]);

  if (loading) {
    return <p>جاري التحميل...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const donationTypes = [...new Set(donations.map(donation => donation.type))];

  return (
    <div className="donation-container">
       <Title text="حالات التبرع"/>
      <div className='filter'>
     
      <DonorFilter
          filter={filter}
          setFilter={setFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          donationTypes={donationTypes}
        />
      </div>
      <Container className='container-card'>
      
        {filteredDonations.length === 0 ? (
          <FindeNot /> // استدعاء مكون FindeNot
        ) : (
          
          <Row className="donation-grid">
            {filteredDonations.slice(0, 15).map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default DonorListe;

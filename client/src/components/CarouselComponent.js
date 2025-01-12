import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './CarouselComponent.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const CarouselComponent = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWithInterceptors('/campaigns')
      .then(response => response.json())
      .then(data => {
        // console.log('API response:', data);  // Log the entire response
        if (Array.isArray(data)) {
          setCampaigns(data);
          
        } else {
          setCampaigns([]);
          // console.log('Campaigns array:', data);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching campaigns is:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading campaigns: {error.message}</div>;
  }

  if (campaigns.length === 0) {
    return <div>No campaigns available</div>;
  }

  return (
    <Carousel className="carousel">
      {campaigns.map((campaign, index) => (
        <Carousel.Item key={campaign.id}>
          <Link to={`/campaign/${campaign.id}`}>
            <img
              className="d-block w-100"
              src={campaign.imageUrls[0]}
              alt={`SLIDE ${index + 1}`}
            />
            <Carousel.Caption>
              <h3>{campaign.title}</h3>
              <p>{campaign.description}</p>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CarouselComponent;

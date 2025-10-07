import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import './CampaignDetails.css';
import BackButton from './BackButton';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const CampaignDetails = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await fetchWithInterceptors(`/campaigns/${id}`);
        const data = await response.json();
        setCampaign(data);
      } catch (error) {
        console.error('Error fetching campaign:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error loading campaign: {error.message}</Alert>;
  }

  if (!campaign) {
    return <Alert variant="warning">No campaign found</Alert>;
  }

  return (
    <>
       <BackButton/>
       <Container className="campaign-details mt-4 col-6">
      {/* Title and Description */}
   
      <Row className="title-section mb-4">
        <Col>
          <h1 className="text-center mb-4">{campaign.title}</h1>
          <p className="text-center mb-4">{campaign.description}</p>
        </Col>
      </Row>
      
      {/* Images */}
      <Row className="images-section mb-4">
        {campaign.imageUrls.map((url, index) => (
          <Col md={4} sm={6} xs={12} key={index} className="mb-3">
            <img src={url} alt={`CampaignImage ${index + 1}`} className="img-fluid rounded shadow-sm" />
          </Col>
        ))}
      </Row>
      
      {/* Period (Start and End Dates) */}
      <Row className="period-section mb-4">
        <Col md={6} sm={12} className="mb-3 order-md-2">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>تاريخ البدء</Card.Title>
              <Card.Text>{campaign.startDate}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} sm={12} className="mb-3 order-md-1">
          <Card className="h-100">
            <Card.Body className="text-center">
              <Card.Title>تاريخ الانتهاء</Card.Title>
              <Card.Text>{campaign.endDate}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Amount Details and Donation Button */}
      <Row className="amount-section mb-4 flex-column">
        <Col className="mb-3">
          <Card className="h-100 total-amount-detail">
            <Card.Body className="text-center">
              <Card.Title>المبلغ الإجمالي</Card.Title>
              <Card.Text>{campaign.goalAmount}أوقية جديدة </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-3">
          <Card className="h-100 amount-detail">
            <Card.Body className="text-center">
              <Card.Title>مبلغ المشاركة</Card.Title>
              <Card.Text>{campaign.donationsCollected}  أوقية جديدة </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="text-center">
        <Button variant="success" size="lg" className="px-5 py-3">شارك معنا</Button>
      </div>
    </Container>
    </>
    
  );
};

export default CampaignDetails;

// BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = () => {
  let navigate = useNavigate();

  return (
    <Button variant="secondary" className="back-button" onClick={() => navigate(-1)}>
      <FaArrowLeft className="me-2" /> العودة
    </Button>
  );
};

export default BackButton;

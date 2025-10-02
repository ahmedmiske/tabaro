// BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { Button } from './ui';

const BackButton = () => {
  let navigate = useNavigate();

  return (
    <Button variant="secondary" onClick={() => navigate(-1)}>
      <FaArrowLeft className="ml-2" /> العودة
    </Button>
  );
};

export default BackButton;

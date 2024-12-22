import React, { useState, useEffect } from 'react';
import Marquee from 'react-marquee-slider';
import { Container } from 'react-bootstrap';
import './ImportantInfoBar.css';

const ImportantInfoBar = ({ apiUrl = 'http://localhost:5000/important-info' }) => {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => setInfo(data))
      .catch(error => console.error('Error fetching important info:', error));
  }, [apiUrl]);

  return (
    <Container fluid className="important-info-bar">
      <Marquee velocity={25}>
        {info.map((item, index) => (
          <span key={index} className="info-item">{item.description}</span>
        ))}
      </Marquee>
    </Container>
  );
};

export default React.memo(ImportantInfoBar);

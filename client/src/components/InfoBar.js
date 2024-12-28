import React from 'react';
//  import { Navbar } from 'react-bootstrap';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaEnvelope, FaPhone } from 'react-icons/fa';
import './InfoBar.css';
import Notifications from './Notifications';
import ImportantInfoBar from './ImportantInfoBar';
// import ImportantInfoBar from './ImportantInfoBar';

const InfoBar = () => {
  return (
    <div bg="red" expand="lg" className="containar-infoBar" >
      <Notifications />
      <ImportantInfoBar />
      <div className='bar-info-s-media'>
      <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp className="social-icon" />
      </a>
      <a href="https://www.instagram.com/yourprofile" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="social-icon" />
        </a>
        <a href="https://www.facebook.com/yourprofile" target="_blank" rel="noopener noreferrer">
          <FaFacebookF className="social-icon" />
        </a>
        <a href="mailto:yourmail@example.com">
          <FaEnvelope className="social-icon" />
        </a>
     
      </div>
    </div>
  );
};

export default InfoBar;


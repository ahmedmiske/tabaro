import React from 'react';
import { FaFacebook, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SocialMedia.css';

function SocialMedia() {
  return (
    <div className="social-media">
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary mb-2">
        <FaFacebook />
      </a>
      <a href="https://www.whatsapp.com" target="_blank" rel="noopener noreferrer" className="btn btn-success mb-2">
        <FaWhatsapp />
      </a>
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="btn btn-danger mb-2">
        <FaInstagram />
      </a>
    </div>
  );
}

export default SocialMedia;

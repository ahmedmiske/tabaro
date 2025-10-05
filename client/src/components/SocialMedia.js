import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './SocialMedia.css';

function SocialMedia() {
  return (
    <div className="social-media">
      <a 
        href="https://wa.me/1234567890" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-btn"
        aria-label="تواصل معنا عبر واتساب"
      >
        <FaWhatsapp />
      </a>
    </div>
  );
}

export default SocialMedia;

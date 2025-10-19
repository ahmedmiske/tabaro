// src/components/DonationMegaMenu.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { GENERAL_CATEGORY_META as C } from '../constants/donationCategories';
import './DonationMegaMenu.css';

const Item = ({ code, to }) => {
  const { label, icon: Icon } = C[code];
  return (
    <Link to={to || `/donations?category=${code}`} className="mega-item">
      <span className="mega-icon"><Icon size={22} /></span>
      <span className="mega-label">{label}</span>
    </Link>
  );
};

export default function DonationMegaMenu() {
  return (
    <div className="donation-mega" dir="rtl">
      <div className="mega-grid">
        <Item code="sadaqa" />
        <Item code="zakat" />
        <Item code="kafara" />
        <Item code="orphans" />
        <Item code="awqaf" />
        <Item code="livestock" />
        <Item code="money" />
        <Item code="goods" />
        <Item code="time" />
        <Item code="mosque_services" />   {/* جديد */}
        <Item code="mahadir_services" />  {/* جديد */}
        <Item code="other" />
      </div>
    </div>
  );
}

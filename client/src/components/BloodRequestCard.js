import React from 'react';
import { Link } from 'react-router-dom';
import './BloodRequestCard.css';

const BloodRequestCard = ({ donation }) => {
  return (
    <div className="blood-request-card col">
      <div className="blood-request-card-container card">
        <div className="brc-header">
          <div className="brc-blood-circle">{donation.bloodType}</div>
          {donation.isUrgent && <div className="brc-urgent-tag">مستعجل</div>}
        </div>
        <div className="brc-body">
          <p className="brc-description">{donation.description}</p>
          <p className="brc-date">
            🗓 التاريخ: {new Date(donation.deadline).toLocaleDateString()}
          </p>
          <p className="brc-created">
            ⏰ تاريخ الإضافة: {new Date(donation.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="brc-footer">
          <Link to={`/donation-details/${donation._id}`}>
            <button className="brc-btn-details">تفاصيل</button>
          </Link>
          <Link to={`/donation-details/${donation._id}`}>
            <button className="brc-btn-donate">تبرع الآن</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestCard;

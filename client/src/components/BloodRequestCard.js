import React from 'react';
import { Link } from 'react-router-dom';
import './BloodRequestCard.css';

const BloodRequestCard = ({ donation }) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className="blood-request-card col">
      <div className="blood-request-card-container card">
        <div className="brc-header">
          <div className="brc-blood-circle">{donation.bloodType}</div>
          {donation.isUrgent && <div className="brc-urgent-tag">مستعجل</div>}
        </div>

        <div className="brc-body">
          <p className="brc-description">
            {donation.description?.length > 100
              ? donation.description.slice(0, 100) + '...'
              : donation.description}
          </p>
          <p className="brc-date">🗓 آخر أجل: {formatDate(donation.deadline)}</p>
          <p className="brc-created">⏰ تاريخ الإضافة: {formatDate(donation.createdAt)}</p>
        </div>

        <div className="brc-footer">
          <Link to={`/donation-details/${donation._id}`}>
            <button className="brc-btn-details">📋 تفاصيل الطلب / التبرع</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BloodRequestCard;
// This component represents a card for a blood donation request.
// It displays the blood type, urgency status, description, deadline, and creation date.
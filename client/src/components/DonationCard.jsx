import React from "react";
import PropTypes from "prop-types";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./DonationCard.css";

const DonationCard = ({ donation }) => {
  const {
    _id,
    bloodType,
    isUrgent,
    description,
    deadline,
    location,
    createdAt,
  } = donation || {};

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString()
    : "غير متوفر";

  const addedAt = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "غير متوفر";

  return (
    <div className="donation-card">
      <Card className="donation-card-box border-0">
        {/* HEADER */}
        <div className="donation-card-header">
          {/* urgent badge */}
          {isUrgent && (
            <span className="urgent-badge">
              <i className="fas fa-bolt"></i>
              مستعجل
            </span>
          )}

          {/* blood pill */}
          <div className="blood-pill">
            <i className="fas fa-tint"></i>
            <span>{bloodType || "غير معروف"}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="donation-body">
          <div className="case-desc">
            {description || "لا يوجد وصف للحالة."}
          </div>

          <div className="info-row">
            <div className="info-label">آخر أجل:</div>
            <div className="info-value">
              <i className="fas fa-calendar-day"></i> {formattedDeadline}
            </div>
          </div>

          <div className="info-row">
            <div className="info-label">الموقع:</div>
            <div className="info-value">
              <i className="fas fa-map-marker-alt"></i> {location || "غير متوفر"}
            </div>
          </div>
        </div>

        {/* META */}
        <div className="donation-meta">
          <i className="fas fa-clock me-1"></i>
          <strong>تاريخ الإضافة: </strong>
          {addedAt}
        </div>

        {/* ACTIONS */}
        <div className="donation-actions">
          <Link to={`/blood-donation-details/${_id}`} className="w-100">
            <button className="btn-details w-100">
              <i className="fas fa-eye me-1"></i>
              تفاصيل الحالة
            </button>
          </Link>

          <Link to={`/blood-donation-details/${_id}`} className="w-100">
            <button className="btn-donate w-100">
              <i className="fas fa-hand-holding-heart me-1"></i>
              أنقذ حياة الآن
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

DonationCard.propTypes = {
  donation: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    bloodType: PropTypes.string,
    isUrgent: PropTypes.bool,
    description: PropTypes.string,
    deadline: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    location: PropTypes.string,
    createdAt: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }).isRequired,
};

export default DonationCard;

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
        {/* ===== HEADER ===== */}
        <header className="donation-card-header">
          <div className="header-top">
            {isUrgent && (
              <span className="urgent-badge">
                <i className="fas fa-bolt" aria-hidden="true" />
                <span>مستعجل</span>
              </span>
            )}

            <span className="date-chip" aria-label="تاريخ إضافة الحالة">
              <i className="far fa-clock" aria-hidden="true" />
              {addedAt}
            </span>
          </div>

          <div className="header-bottom">
            <div className="blood-pill" aria-label="فصيلة الدم">
              <i className="fas fa-tint" aria-hidden="true" />
              <span>{bloodType || "غير معروف"}</span>
            </div>
          </div>
        </header>

        {/* ===== BODY ===== */}
        <div className="donation-body">
          <div className="case-desc">
            {description || "لا يوجد وصف للحالة."}
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">
                <i className="far fa-calendar-day" aria-hidden="true" /> آخر أجل
              </span>
              <span className="info-value">{formattedDeadline}</span>
            </div>

            <div className="info-item">
              <span className="info-label">
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> الموقع
              </span>
              <span className="info-value">{location || "غير متوفر"}</span>
            </div>
          </div>
        </div>

        {/* ===== META ===== */}
        <div className="donation-meta">
          <i className="far fa-clock me-1" aria-hidden="true" />
          <span>تمت إضافة الحالة في </span>
          <strong>{addedAt}</strong>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="donation-actions">
          <Link to={`/blood-donation-details/${_id}`} className="w-100">
            <button className="btn-details w-100" type="button">
              <i className="fas fa-eye me-1" aria-hidden="true" />
              تفاصيل الحالة
            </button>
          </Link>

          <Link to={`/blood-donation-details/${_id}`} className="w-100">
            <button className="btn-donate w-100" type="button">
              <i className="fas fa-hand-holding-heart me-1" aria-hidden="true" />
              أنقِذ حياة الآن
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

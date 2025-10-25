import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS_AR, STATUS_LABELS_AR } from '../../constants/social.enums.js';
import '../../styles/social/social-card.css';

function SocialCard({ ad }) {
  const { _id, title, description, category, location, createdAt, status } = ad;

  return (
    <article className="social-card" dir="rtl" aria-label={`إعلان ${title}`}>
      <header className="social-card__head">
        <span className={`social-card__chip cat-${category.toLowerCase()}`}>
          {CATEGORY_LABELS_AR[category] ?? category}
        </span>
        <span className={`social-card__status st-${status}`}>
          {STATUS_LABELS_AR[status] ?? status}
        </span>
      </header>

      <h3 className="social-card__title">{title}</h3>

      <p className="social-card__desc">
        {description?.length > 140 ? description.slice(0, 140) + '…' : description}
      </p>

      <footer className="social-card__meta">
        <span>{location?.wilaya} — {location?.city}</span>
        <time dateTime={createdAt}>{new Date(createdAt).toLocaleDateString('ar-MA')}</time>
      </footer>

      <div className="social-card__actions">
        <Link to={`/social/${_id}`} className="btn btn-sm btn-outline">
          التفاصيل
        </Link>
      </div>
    </article>
  );
}

SocialCard.propTypes = {
  ad: PropTypes.object.isRequired,
};

export default SocialCard;

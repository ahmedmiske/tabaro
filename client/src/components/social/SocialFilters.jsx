import React from 'react';
import PropTypes from 'prop-types';
import { SOCIAL_AD_CATEGORY, CATEGORY_LABELS_AR } from '../../constants/social.enums.js';
import '../../styles/social/social-filters.css';

function SocialFilters({ value, onChange, wilayas = [], cities = [] }) {
  const handle = (e) => onChange({ ...value, [e.target.name]: e.target.value });

  return (
    <form className="social-filters" dir="rtl" onSubmit={(e) => e.preventDefault()}>
      <div className="row">
        <div className="col">
          <label className="label">النوع</label>
          <select name="category" value={value.category} onChange={handle}>
            <option value="">الكل</option>
            {Object.values(SOCIAL_AD_CATEGORY).map((k) => (
              <option key={k} value={k}>{CATEGORY_LABELS_AR[k]}</option>
            ))}
          </select>
        </div>

        <div className="col">
          <label className="label">الولاية</label>
          <select name="wilaya" value={value.wilaya} onChange={handle}>
            <option value="">الكل</option>
            {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <div className="col">
          <label className="label">المدينة</label>
          <select name="city" value={value.city} onChange={handle}>
            <option value="">الكل</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="col col--grow">
          <label className="label">بحث</label>
          <input
            name="q"
            placeholder="ابحث بعنوان أو كلمات…"
            value={value.q}
            onChange={handle}
          />
        </div>
      </div>
    </form>
  );
}

SocialFilters.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  wilayas: PropTypes.array,
  cities: PropTypes.array,
};

export default SocialFilters;

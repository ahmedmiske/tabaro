// src/components/DonationFilterBar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './DonationFilterBar.css';

function DonationFilterBar({
  bloodTypes,
  locations,
  selectedBloodType,
  setSelectedBloodType,
  selectedLocation,
  setSelectedLocation,
  urgentOnly,
  setUrgentOnly,
  onClearFilters,
}) {
  const handleUrgentToggle = () => {
    setUrgentOnly((prev) => !prev);
  };

  const handleBloodChange = (e) => {
    setSelectedBloodType(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handleClear = () => {
    onClearFilters();
  };

  return (
    <section
      className="filter-shell"
      dir="rtl"
      aria-label="تصفية طلبات التبرع بالدم حسب الفصيلة والموقع والأولوية"
    >
      {/* رأس شريط الفلاتر */}
      <header className="filter-header">
        <div className="filter-header-text">
          <h2 className="filter-title">تصفية الطلبات</h2>
          <p className="filter-subtitle">
            اختر فصيلة الدم والموقع، ويمكنك التركيز فقط على الحالات المستعجلة.
          </p>
        </div>

        <button
          type="button"
          className="filter-reset-btn"
          onClick={handleClear}
        >
          <span className="filter-reset-icon">↺</span>
          مسح الفلاتر
        </button>
      </header>

      {/* شبكة الحقول */}
      <div className="filter-grid">
        {/* الأولوية – أعلى الشريط */}
        <div className="filter-field urgent-top">
          <span className="filter-label">الأولوية</span>
          <div className="urgent-inline">
            <label className="urgent-switch">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={handleUrgentToggle}
              />
              <span className="urgent-slider" />
            </label>
            <span className="urgent-text">
              <span className="urgent-emoji">🚨</span>
              مستعجل فقط
            </span>
          </div>
        </div>

        {/* فصيلة الدم */}
        <div className="filter-field middle-field">
          <label className="filter-label" htmlFor="bloodTypeSelect">
            فصيلة الدم
          </label>
          <div className="filter-select-wrapper">
            <select
              id="bloodTypeSelect"
              className="filter-select"
              value={selectedBloodType}
              onChange={handleBloodChange}
            >
              {bloodTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'كل الفصائل' : t}
                </option>
              ))}
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              🩸
            </span>
          </div>
        </div>

        {/* الموقع */}
        <div className="filter-field middle-field">
          <label className="filter-label" htmlFor="locationSelect">
            الموقع
          </label>
          <div className="filter-select-wrapper">
            <select
              id="locationSelect"
              className="filter-select"
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'ALL' ? 'كل المناطق' : loc}
                </option>
              ))}
            </select>
            <span className="filter-select-icon" aria-hidden="true">
              📍
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

DonationFilterBar.propTypes = {
  bloodTypes: PropTypes.arrayOf(PropTypes.string),
  locations: PropTypes.arrayOf(PropTypes.string),
  selectedBloodType: PropTypes.string.isRequired,
  setSelectedBloodType: PropTypes.func.isRequired,
  selectedLocation: PropTypes.string.isRequired,
  setSelectedLocation: PropTypes.func.isRequired,
  urgentOnly: PropTypes.bool.isRequired,
  setUrgentOnly: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func,
};

DonationFilterBar.defaultProps = {
  bloodTypes: [],
  locations: [],
  onClearFilters: () => {},
};

export default DonationFilterBar;

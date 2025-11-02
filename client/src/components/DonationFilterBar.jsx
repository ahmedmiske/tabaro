// src/components/DonationFilterBar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './DonationFilterBar.css';

function DonationFilterBar({
  bloodTypes,
  selectedBloodType,
  setSelectedBloodType,
  deadlineRange,
  setDeadlineRange,
  urgentOnly,
  setUrgentOnly,
}) {
  // bloodTypes: array مثل ['ALL','A+','O+','B-']
  const handleBloodTypeClick = (type) => {
    // لما يضغط على نفس الاختيار مرة ثانية؟ خليه يظل محدد
    setSelectedBloodType(type);
  };

  const handleDeadlineClick = (rangeVal) => {
    setDeadlineRange(rangeVal);
  };

  const handleUrgentToggle = () => {
    setUrgentOnly(prev => !prev);
  };

  const deadlineOptions = [
    { value: '24h', label: 'ينتهي خلال 24 ساعة ⏳' },
    { value: '3d',  label: 'ينتهي خلال 3 أيام' },
    { value: '7d',  label: 'ينتهي خلال أسبوع' },
    { value: 'all', label: 'كل المواعيد' },
  ];

  return (
    <aside className="filter-bar" dir="rtl">
      {/* فلتر الفصيلة */}
      <div className="filter-group">
        <span className="filter-label">فصيلة الدم</span>
        <div className="chip-row">
          {bloodTypes.map(type => (
            <button
              key={type}
              type="button"
              className={`chip-btn ${selectedBloodType === type ? 'active' : ''}`}
              onClick={() => handleBloodTypeClick(type)}
            >
              <span className="chip-emoji">🩸</span>
              <span>{type === 'ALL' ? 'كل الفصائل' : type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* فلتر المدة حتى انتهاء المهلة */}
      <div className="filter-group">
        <span className="filter-label">الحاجة قبل انتهاء المهلة</span>
        <div className="chip-row">
          {deadlineOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`chip-btn ${deadlineRange === opt.value ? 'active' : ''}`}
              onClick={() => handleDeadlineClick(opt.value)}
            >
              <span className="chip-emoji">⏰</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* سويتش المستعجل فقط */}
      <div className="filter-group urgent-toggle">
        <label className="filter-label">الأولوية</label>
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
    </aside>
  );
}

DonationFilterBar.propTypes = {
  bloodTypes: PropTypes.arrayOf(PropTypes.string),
  selectedBloodType: PropTypes.string.isRequired,
  setSelectedBloodType: PropTypes.func.isRequired,
  deadlineRange: PropTypes.string.isRequired,
  setDeadlineRange: PropTypes.func.isRequired,
  urgentOnly: PropTypes.bool.isRequired,
  setUrgentOnly: PropTypes.func.isRequired,
};

DonationFilterBar.defaultProps = {
  bloodTypes: [],
};

export default DonationFilterBar;

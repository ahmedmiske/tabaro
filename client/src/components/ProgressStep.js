import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from './ui';
import './ProgressStep.css';

const ProgressStep = ({ step, total }) => {
  const t = total > 0 ? total : 1;
  const s = Math.max(0, Math.min(step, t));
  const percentage = (s / t) * 100;

  const backgroundColors = ['#d1e7dd', '#cce5ff', '#fff3cd', '#f8d7da', '#d4edda'];
  const bgColor = backgroundColors[Math.min(Math.max(s - 1, 0), backgroundColors.length - 1)];

  return (
    <div className="title-box">
      <div className="prog-step-container" style={{ backgroundColor: bgColor }}>
        <ProgressBar
          now={percentage}
          label={<span>خطوة <span className="step">{s}</span> من <span className="total">{t}</span></span>}
          className="prog-bar-inner"
        />
      </div>
    </div>
  );
};

ProgressStep.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number,
};

ProgressStep.defaultProps = {
  total: 5,
};

export default ProgressStep;

import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import './ProgressStep.css';
import PropTypes from 'prop-types';

const ProgressStep = ({ step, total = 5 }) => {
  const percentage = (step / total) * 100;

  // ألوان الخلفية حسب الخطوة
  const backgroundColors = ['#d1e7dd', '#cce5ff', '#fff3cd', '#f8d7da', '#d4edda'];
  const bgColor = backgroundColors[Math.min(step - 1, backgroundColors.length - 1)];

  return (
    <div className="title-box">
      <div className="prog-step-container" style={{ backgroundColor: bgColor }}>
        <ProgressBar
          now={percentage}
         label={
            <span>
            خطوة <span className="step">{step}</span> من <span className="total">{total}</span>
            </span>
            }
          className="prog-bar-inner"
        />
      </div>
    </div>
  );
};

ProgressStep.propTypes = {
  step: PropTypes.number.isRequired,
  total: PropTypes.number
};

export default ProgressStep;

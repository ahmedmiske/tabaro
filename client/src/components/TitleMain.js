import React from 'react';
import './TitleMain.css';
import PropTypes from 'prop-types';

function TitleMain({ text1, text2 }) {
  return (
    <div className="title-main-container">
      <h1 className="title-main-text">
        <span className="title-primary">{text1}</span>
        <span className="separator"> / </span>
         <span className="title-secondary">{text2}</span>
      </h1>
    </div>
  );
}
TitleMain.propTypes = {
  text1: PropTypes.string.isRequired,
  text2: PropTypes.string.isRequired
};

export default TitleMain;

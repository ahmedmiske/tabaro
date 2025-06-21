import React from 'react';
import './TitleMain.css';

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

export default TitleMain;

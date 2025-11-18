import React from 'react';
import PropTypes from 'prop-types';
import './QuranVerse.css';

const QuranVerse = ({ verse }) => {
  return (
    <p className="verse-text" dir="rtl">
      {verse}
    </p>
  );
};

QuranVerse.propTypes = {
  verse: PropTypes.string.isRequired
};

export default QuranVerse;

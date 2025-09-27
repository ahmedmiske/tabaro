import React from 'react';
import PropTypes from 'prop-types';
import './Title.css';

function Title({ text }) {
  return <h1 className="main-title">{text}</h1>;
}

Title.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default Title;

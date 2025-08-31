import React from 'react';
import './Title.css';
import PropTypes from 'prop-types';

function Title({ text }) {
  return (
    <h1 className='main-title'>{text}</h1>
  );
}

Title.propTypes = {
  text: PropTypes.string.isRequired
};

export default Title;

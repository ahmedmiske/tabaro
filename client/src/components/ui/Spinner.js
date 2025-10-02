// components/ui/Spinner.js
import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({ size = 'md', color = 'primary', className = '', ...props }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colors = {
    primary: 'border-ui-primary',
    secondary: 'border-gray-500',
    white: 'border-white',
  };

  const classes = `animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${className}`;

  return <div className={classes} {...props} />;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white']),
  className: PropTypes.string,
};

export default Spinner;
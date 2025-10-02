import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ 
  src, 
  alt = '', 
  className = '', 
  fluid = false, 
  rounded = false, 
  roundedCircle = false,
  thumbnail = false,
  ...props 
}) => {
  const baseClasses = 'max-w-full h-auto';
  const fluidClasses = fluid ? 'w-full' : '';
  const roundedClasses = rounded ? 'rounded' : '';
  const circleClasses = roundedCircle ? 'rounded-full' : '';
  const thumbnailClasses = thumbnail ? 'border border-gray-300 rounded p-1 bg-white dark:bg-gray-800 dark:border-gray-600' : '';

  return (
    <img 
      src={src}
      alt={alt}
      className={`${baseClasses} ${fluidClasses} ${roundedClasses} ${circleClasses} ${thumbnailClasses} ${className}`.trim()}
      {...props}
    />
  );
};

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  rounded: PropTypes.bool,
  roundedCircle: PropTypes.bool,
  thumbnail: PropTypes.bool,
};

export default Image;
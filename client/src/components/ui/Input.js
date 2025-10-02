// components/ui/Input.js
import React from 'react';
import PropTypes from 'prop-types';

const Input = ({ 
  label,
  error,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-ui-primary focus:border-transparent outline-none transition-colors ${
    error 
      ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400' 
      : 'border-border-color hover:border-ui-primary/30'
  } ${className}`;

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-text-color">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default Input;
import React from 'react';
import PropTypes from 'prop-types';

// Componente FormControl compatible con Bootstrap
const FormControl = ({ 
  as = 'input',
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  isValid,
  isInvalid,
  rows,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ui-primary/50 focus:border-ui-primary transition-colors';
  
  let stateClasses = '';
  if (isInvalid) {
    stateClasses = 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500';
  } else if (isValid) {
    stateClasses = 'border-green-500 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-green-500';
  } else {
    stateClasses = 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500';
  }
  
  const disabledClasses = disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-800';

  const allClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;

  if (as === 'textarea') {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows || 3}
        required={required}
        disabled={disabled}
        className={`${allClasses} resize-vertical`}
        {...props}
      />
    );
  }

  if (as === 'select') {
    return (
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={allClasses}
        {...props}
      >
        {props.children}
      </select>
    );
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={allClasses}
      {...props}
    />
  );
};

FormControl.propTypes = {
  as: PropTypes.oneOf(['input', 'textarea', 'select']),
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  isValid: PropTypes.bool,
  isInvalid: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default FormControl;
// components/ui/Alert.js
import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ 
  children, 
  variant = 'info', 
  className = '', 
  dismissible = false,
  onClose,
  ...props 
}) => {
  const variants = {
    success: 'bg-green-50 border-green-200 text-green-800',
    danger: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconMap = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const classes = `border px-4 py-3 rounded-lg relative ${variants[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      <div className="flex items-start">
        <span className="mr-2">{iconMap[variant]}</span>
        <div className="flex-1">{children}</div>
        {dismissible && onClose && (
          <button 
            type="button"
            className="ml-2 text-current hover:opacity-70 font-bold"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'danger', 'warning', 'info']),
  className: PropTypes.string,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Alert;
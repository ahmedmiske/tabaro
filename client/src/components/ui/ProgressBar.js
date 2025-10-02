import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ 
  now = 0, 
  max = 100, 
  variant = 'primary', 
  striped = false, 
  animated = false, 
  className = '',
  label,
  ...props 
}) => {
  const percentage = Math.min(Math.max((now / max) * 100, 0), 100);
  
  const variantClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-cyan-600',
    light: 'bg-gray-200',
    dark: 'bg-gray-800'
  };

  const stripedClasses = striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem]' : '';
  const animatedClasses = animated ? 'animate-pulse' : '';
  
  return (
    <div 
      className={`w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden ${className}`} 
      {...props}
    >
      <div
        className={`h-4 ${variantClasses[variant]} ${stripedClasses} ${animatedClasses} transition-all duration-300 ease-out flex items-center justify-center text-xs text-white font-medium`}
        style={{ width: `${percentage}%` }}
      >
        {label && (
          <span className="text-xs font-medium text-white drop-shadow-sm">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  now: PropTypes.number,
  max: PropTypes.number,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  striped: PropTypes.bool,
  animated: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
};

export default ProgressBar;
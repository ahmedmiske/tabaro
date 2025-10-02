import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ 
  show = false, 
  onClose, 
  delay = 5000, 
  autohide = true, 
  children, 
  className = '',
  variant = 'default',
  ...props 
}) => {
  const [visible, setVisible] = useState(show);

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  useEffect(() => {
    setVisible(show);
    
    if (show && autohide && delay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autohide, delay, onClose]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm w-full border rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {children}
          </div>
          {onClose && (
            <button
              type="button"
              className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
              onClick={() => {
                setVisible(false);
                onClose();
              }}
            >
              <span className="sr-only">إغلاق</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ToastContainer = ({ children, className = '', position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 ${className}`}>
      {children}
    </div>
  );
};

Toast.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  delay: PropTypes.number,
  autohide: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
};

ToastContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center']),
};

export default Toast;
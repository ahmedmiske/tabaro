import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const Modal = ({ 
  show = false, 
  onHide, 
  children, 
  size = 'md', 
  centered = false, 
  backdrop = true,
  keyboard = true,
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const centeredClasses = centered ? 'items-center' : 'items-start pt-16';

  useEffect(() => {
    const handleEscape = (event) => {
      if (keyboard && event.key === 'Escape' && onHide) {
        onHide();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, keyboard, onHide]);

  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === e.currentTarget && onHide) {
      onHide();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex ${centeredClasses} justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm ${className}`.trim()}
      onClick={handleBackdropClick}
      {...props}
    >
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all duration-300 ease-out scale-100 opacity-100`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({ 
  children, 
  closeButton = true, 
  onHide, 
  className = '',
  ...props 
}) => (
  <div 
    className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${className}`.trim()} 
    {...props}
  >
    <div className="flex-1">
      {children}
    </div>
    {closeButton && (
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded p-1"
        onClick={onHide}
      >
        <span className="sr-only">إغلاق</span>
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    )}
  </div>
);

export const ModalTitle = ({ children, className = '', ...props }) => (
  <h3 
    className={`text-lg font-medium text-gray-900 dark:text-gray-100 ${className}`.trim()} 
    {...props}
  >
    {children}
  </h3>
);

export const ModalBody = ({ children, className = '', ...props }) => (
  <div 
    className={`p-6 text-gray-700 dark:text-gray-300 ${className}`.trim()} 
    {...props}
  >
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '', ...props }) => (
  <div 
    className={`flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 ${className}`.trim()} 
    {...props}
  >
    {children}
  </div>
);

Modal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  centered: PropTypes.bool,
  backdrop: PropTypes.bool,
  keyboard: PropTypes.bool,
  className: PropTypes.string,
};

ModalHeader.propTypes = {
  children: PropTypes.node.isRequired,
  closeButton: PropTypes.bool,
  onHide: PropTypes.func,
  className: PropTypes.string,
};

ModalTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

ModalBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

ModalFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;
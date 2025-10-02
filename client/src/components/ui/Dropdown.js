import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export const Dropdown = ({ children, className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div 
      ref={dropdownRef} 
      className={`relative inline-block ${className}`.trim()} 
      {...props}
    >
      {React.Children.map(children, child => 
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

export const DropdownToggle = ({ 
  children, 
  variant = 'primary', 
  isOpen, 
  setIsOpen, 
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
    info: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    light: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
    dark: 'bg-gray-800 hover:bg-gray-900 text-white',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
  };

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${variantClasses[variant]} ${className}`.trim()}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <svg 
        className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

export const DropdownMenu = ({ 
  children, 
  isOpen, 
  className = '',
  align = 'left',
  ...props 
}) => {
  const alignClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`absolute z-50 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg ${alignClasses[align]} ${className}`.trim()}
      {...props}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const DropdownItem = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'block w-full px-4 py-2 text-sm text-left';
  const stateClasses = disabled 
    ? 'text-gray-400 cursor-not-allowed' 
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white cursor-pointer';

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

DropdownToggle.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline']),
  isOpen: PropTypes.bool,
  setIsOpen: PropTypes.func,
  className: PropTypes.string,
};

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  className: PropTypes.string,
  align: PropTypes.oneOf(['left', 'right', 'center']),
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
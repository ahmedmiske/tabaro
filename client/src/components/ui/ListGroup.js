import React from 'react';
import PropTypes from 'prop-types';

export const ListGroup = ({ children, className = '', variant = 'default', flush = false, horizontal = false, ...props }) => {
  const baseClasses = 'flex flex-col';
  const flushClasses = flush ? '' : 'rounded-lg border border-gray-200 dark:border-gray-700';
  const horizontalClasses = horizontal ? 'flex-row' : 'flex-col';
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    primary: 'bg-blue-50 dark:bg-blue-900/20',
    secondary: 'bg-gray-50 dark:bg-gray-700',
  };

  return (
    <div 
      className={`${baseClasses} ${horizontalClasses} ${flushClasses} ${variantClasses[variant]} ${className}`.trim()} 
      {...props}
    >
      {children}
    </div>
  );
};

export const ListGroupItem = ({ 
  children, 
  className = '', 
  active = false, 
  disabled = false, 
  variant = 'default',
  action = false,
  ...props 
}) => {
  const baseClasses = 'px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0';
  const activeClasses = active ? 'bg-blue-600 text-white' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const actionClasses = action ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors' : '';
  const variantClasses = {
    default: active ? '' : 'text-gray-900 dark:text-gray-100',
    success: 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    danger: 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    warning: 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    info: 'text-blue-800 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
  };

  const Component = action ? 'button' : 'div';

  return (
    <Component 
      className={`${baseClasses} ${activeClasses} ${disabledClasses} ${actionClasses} ${variantClasses[variant]} ${className}`.trim()} 
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
};

ListGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary']),
  flush: PropTypes.bool,
  horizontal: PropTypes.bool,
};

ListGroupItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'success', 'danger', 'warning', 'info']),
  action: PropTypes.bool,
};
// components/ui/Button.js
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-ui-primary hover:bg-ui-primary-600 text-white focus:ring-ui-primary/50',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400',
    accent: 'bg-ui-accent hover:bg-ui-accent-600 text-white focus:ring-ui-accent/50',
    outline: 'border-2 border-ui-primary text-ui-primary hover:bg-ui-primary hover:text-white focus:ring-ui-primary/50',
    ghost: 'text-ui-primary hover:bg-ui-primary/10 focus:ring-ui-primary/50',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button 
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'outline', 'ghost', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Button;
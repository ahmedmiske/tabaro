import React from 'react';
import PropTypes from 'prop-types';

// Componente InputGroup para agrupar inputs con prepend/append
const InputGroup = ({ 
  children, 
  className = '', 
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div 
      className={`flex ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente para texto que va antes del input
const InputGroupPrepend = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex ${className}`} {...props}>
      {children}
    </div>
  );
};

// Componente para texto que va después del input
const InputGroupAppend = ({ children, className = '', ...props }) => {
  return (
    <div className={`flex ${className}`} {...props}>
      {children}
    </div>
  );
};

// Componente para el texto del addon
const InputGroupText = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm border-r-0 first:rounded-l-md last:rounded-r-md last:border-r ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// PropTypes
InputGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

InputGroupPrepend.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

InputGroupAppend.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

InputGroupText.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

// Asignamos componentes como propiedades del componente principal
InputGroup.Prepend = InputGroupPrepend;
InputGroup.Append = InputGroupAppend;
InputGroup.Text = InputGroupText;

export default InputGroup;
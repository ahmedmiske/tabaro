import React from 'react';
import PropTypes from 'prop-types';

// Componente principal de Form
const Form = ({ children, onSubmit, className = '', ...props }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-4 ${className}`}
      {...props}
    >
      {children}
    </form>
  );
};

// Componente Group para agrupar elementos de formulario
const FormGroup = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Componente Label
const FormLabel = ({ children, htmlFor, required = false, className = '', ...props }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Componente Control para inputs
const FormControl = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  isValid,
  isInvalid,
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

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
};

// Componente Select
const FormSelect = ({ 
  children, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  isValid,
  isInvalid,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ui-primary/50 focus:border-ui-primary transition-colors';
  
  let stateClasses = '';
  if (isInvalid) {
    stateClasses = 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500';
  } else if (isValid) {
    stateClasses = 'border-green-500 text-green-900 focus:ring-green-500 focus:border-green-500';
  } else {
    stateClasses = 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white';
  }
  
  const disabledClasses = disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-800';

  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Componente Textarea
const FormTextarea = ({ 
  placeholder, 
  value, 
  onChange, 
  rows = 3,
  required = false,
  disabled = false,
  isValid,
  isInvalid,
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ui-primary/50 focus:border-ui-primary transition-colors resize-vertical';
  
  let stateClasses = '';
  if (isInvalid) {
    stateClasses = 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500';
  } else if (isValid) {
    stateClasses = 'border-green-500 text-green-900 placeholder-green-300 focus:ring-green-500 focus:border-green-500';
  } else {
    stateClasses = 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500';
  }
  
  const disabledClasses = disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-white dark:bg-gray-800';

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      required={required}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
};

// Componente Text para mostrar texto de ayuda
const FormText = ({ children, variant = 'muted', className = '', ...props }) => {
  const variantClasses = {
    muted: 'text-gray-500 dark:text-gray-400',
    danger: 'text-red-500 dark:text-red-400',
    success: 'text-green-500 dark:text-green-400',
    warning: 'text-yellow-500 dark:text-yellow-400'
  };

  return (
    <small 
      className={`block text-xs mt-1 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </small>
  );
};

// Componente Check para checkboxes y radios
const FormCheck = ({ 
  type = 'checkbox',
  label,
  checked,
  onChange,
  value,
  name,
  disabled = false,
  className = '',
  id,
  ...props 
}) => {
  const inputId = id || `${name}-${value || 'check'}`;
  
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={inputId}
        type={type}
        checked={checked}
        onChange={onChange}
        value={value}
        name={name}
        disabled={disabled}
        className="h-4 w-4 text-ui-primary focus:ring-ui-primary/50 border-gray-300 dark:border-gray-600 rounded disabled:cursor-not-allowed disabled:opacity-60"
        {...props}
      />
      {label && (
        <label 
          htmlFor={inputId}
          className={`ml-2 text-sm text-gray-700 dark:text-gray-300 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

// PropTypes
Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func,
  className: PropTypes.string,
};

FormGroup.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

FormLabel.propTypes = {
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

FormControl.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  isValid: PropTypes.bool,
  isInvalid: PropTypes.bool,
  className: PropTypes.string,
};

FormSelect.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  isValid: PropTypes.bool,
  isInvalid: PropTypes.bool,
  className: PropTypes.string,
};

FormTextarea.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  rows: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  isValid: PropTypes.bool,
  isInvalid: PropTypes.bool,
  className: PropTypes.string,
};

FormText.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['muted', 'danger', 'success', 'warning']),
  className: PropTypes.string,
};

FormCheck.propTypes = {
  type: PropTypes.oneOf(['checkbox', 'radio']),
  label: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

// Asignamos componentes como propiedades del componente principal
Form.Group = FormGroup;
Form.Label = FormLabel;
Form.Control = FormControl;
Form.Select = FormSelect;
Form.Textarea = FormTextarea;
Form.Text = FormText;
Form.Check = FormCheck;

export default Form;
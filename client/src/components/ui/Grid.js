import React from 'react';
import PropTypes from 'prop-types';

// Componente Row para sistema de grid
const Row = ({ 
  children, 
  className = '', 
  gutter = 4, 
  align = 'stretch',
  justify = 'start',
  ...props 
}) => {
  const gutterClass = gutter ? `-mx-${gutter/2}` : '';
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline'
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  return (
    <div 
      className={`flex flex-wrap ${gutterClass} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente Col para columnas del grid
const Col = ({ 
  children, 
  className = '', 
  xs, sm, md, lg, xl, 
  span,
  offset,
  gutter = 4,
  ...props 
}) => {
  const gutterClass = gutter ? `px-${gutter/2}` : '';
  
  // Clases de tamaño para diferentes breakpoints
  let sizeClasses = '';
  
  if (span) {
    sizeClasses += `w-${span}/12 `;
  }
  
  if (xs) {
    sizeClasses += `w-${xs}/12 `;
  }
  
  if (sm) {
    sizeClasses += `sm:w-${sm}/12 `;
  }
  
  if (md) {
    sizeClasses += `md:w-${md}/12 `;
  }
  
  if (lg) {
    sizeClasses += `lg:w-${lg}/12 `;
  }
  
  if (xl) {
    sizeClasses += `xl:w-${xl}/12 `;
  }
  
  // Clases de offset
  let offsetClasses = '';
  if (offset) {
    offsetClasses = `ml-${offset}/12`;
  }
  
  // Si no se especifica ningún tamaño, usar flex-1 para distribución automática
  if (!span && !xs && !sm && !md && !lg && !xl) {
    sizeClasses = 'flex-1';
  }

  return (
    <div 
      className={`${sizeClasses} ${offsetClasses} ${gutterClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// PropTypes
Row.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gutter: PropTypes.number,
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
};

Col.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  xs: PropTypes.number,
  sm: PropTypes.number,
  md: PropTypes.number,
  lg: PropTypes.number,
  xl: PropTypes.number,
  span: PropTypes.number,
  offset: PropTypes.number,
  gutter: PropTypes.number,
};

export { Row, Col };
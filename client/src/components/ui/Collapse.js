import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Collapse = ({ in: isOpen = false, children, className = '', ...props }) => {
  const [height, setHeight] = useState(isOpen ? 'auto' : '0');

  React.useEffect(() => {
    setHeight(isOpen ? 'auto' : '0');
  }, [isOpen]);

  return (
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${className}`.trim()}
      style={{ 
        height: height,
        opacity: isOpen ? 1 : 0
      }}
      {...props}
    >
      <div className="p-0">
        {children}
      </div>
    </div>
  );
};

Collapse.propTypes = {
  in: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Collapse;
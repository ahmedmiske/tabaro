import React from 'react';
import PropTypes from 'prop-types';

export const Table = ({ children, className = '', striped = false, bordered = false, hover = false, responsive = false, ...props }) => {
  const baseClasses = 'w-full border-collapse';
  const stripedClasses = striped ? 'odd:bg-gray-50 even:bg-white dark:odd:bg-gray-800 dark:even:bg-gray-900' : '';
  const borderedClasses = bordered ? 'border border-gray-300 dark:border-gray-600' : '';
  const hoverClasses = hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' : '';
  
  const tableClasses = `${baseClasses} ${stripedClasses} ${borderedClasses} ${hoverClasses} ${className}`.trim();
  
  const table = (
    <table className={tableClasses} {...props}>
      {children}
    </table>
  );

  if (responsive) {
    return (
      <div className="overflow-x-auto">
        {table}
      </div>
    );
  }

  return table;
};

export const TableHead = ({ children, className = '', ...props }) => (
  <thead className={`bg-gray-100 dark:bg-gray-700 ${className}`.trim()} {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', ...props }) => (
  <tr className={`border-b border-gray-200 dark:border-gray-700 ${className}`.trim()} {...props}>
    {children}
  </tr>
);

export const TableCell = ({ children, className = '', header = false, ...props }) => {
  const Component = header ? 'th' : 'td';
  const baseClasses = 'px-4 py-2 text-start';
  const headerClasses = header ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300';
  
  return (
    <Component className={`${baseClasses} ${headerClasses} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
};

Table.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  hover: PropTypes.bool,
  responsive: PropTypes.bool,
};

TableHead.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TableBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  header: PropTypes.bool,
};
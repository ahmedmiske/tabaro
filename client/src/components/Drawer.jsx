import React from 'react';
import PropTypes from 'prop-types';
import './Drawer.css';

export default function Drawer({ open, onClose, children }) {
  return (
    <div className={`drawer-overlay${open ? ' open' : ''}`} aria-hidden={!open} onClick={onClose}>
      <aside
        className={`drawer-panel${open ? ' open' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="القائمة المنسدلة"
      >
        <button className="drawer-close-btn" onClick={onClose} aria-label="إغلاق القائمة">×</button>
        <div className="drawer-content">{children}</div>
      </aside>
    </div>
  );
}

Drawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};

Drawer.defaultProps = {
  children: null,
};

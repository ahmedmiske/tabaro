import React from 'react';
import PropTypes from 'prop-types';
import './TitleMain.css';

function TitleMain({ title, subtitle, align = 'center', size = 'lg' }) {
  const hasSubtitle = Boolean(subtitle && String(subtitle).trim());

  return (
    <div
      className={
        `tm-wrapper tm-${align} tm-${size} ` +
        (hasSubtitle ? 'tm-has-sub' : 'tm-single')
      }
    >
      <h1 className="tm-title" dir="auto">
        {title}
      </h1>

      {hasSubtitle ? (
        <>
          <div className="tm-divider" aria-hidden="true" />
          <p className="tm-subtitle" dir="auto">
            {subtitle}
          </p>
        </>
      ) : (
        <div className="tm-underline-center" aria-hidden="true" />
      )}
    </div>
  );
}

TitleMain.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  align: PropTypes.oneOf(['center', 'start', 'end']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default TitleMain;

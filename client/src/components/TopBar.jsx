// src/components/TopBar.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FiHome, FiUser, FiBell, FiSettings, FiLogOut, FiChevronDown
} from 'react-icons/fi';

function TopBar({ isAuthed, displayName, avatarLetter, badgeCount, onLogout }) {
  const [accOpen, setAccOpen] = useState(false);
  const accRef = useRef(null);

  // إغلاق القائمة بالنقر خارجها أو عند ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setAccOpen(false); };
    const onDoc = (e) => {
      if (!accRef.current) return;
      if (!accRef.current.contains(e.target)) setAccOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDoc);
    };
  }, []);

  return (
    <div className="eh-top-bar" dir="rtl">
      <div className="eh-top-container">
        <div className="eh-top-left">
          <Link to="/" className="eh-top-link">
            <FiHome />
            <span>الرئيسية</span>
          </Link>
          <Link to="/about" className="eh-top-link">
            <span>عن المنصة</span>
          </Link>
        </div>

        <div className="eh-top-right">
          {!isAuthed ? (
            <Link to="/login" className="eh-login-btn">
              <FiUser />
              <span>تسجيل الدخول</span>
            </Link>
          ) : (
            <>
              <Link to="/notifications" className="eh-icon-mini" aria-label="الإشعارات">
                <FiBell />
                {badgeCount > 0 && <span className="eh-badge-mini">{badgeCount}</span>}
              </Link>

              {/* إدارة الحساب */}
              <div className={`eh-acc ${accOpen ? 'open' : ''}`} ref={accRef}>
                <button
                  className="eh-acc-btn"
                  onClick={() => setAccOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accOpen}
                  aria-label="قائمة الحساب"
                >
                  <span className="eh-avatar-mini">{avatarLetter}</span>
                  <span className="eh-username-mini hide-on-sm">{displayName}</span>
                  <FiChevronDown className="eh-acc-caret" />
                </button>

                <div className="eh-acc-menu" role="menu">
                  <Link to="/profile" className="eh-acc-item" role="menuitem" onClick={() => setAccOpen(false)}>
                    <FiUser />
                    <span>ملفي</span>
                  </Link>
                  <Link to="/settings" className="eh-acc-item" role="menuitem" onClick={() => setAccOpen(false)}>
                    <FiSettings />
                    <span>الإعدادات</span>
                  </Link>
                  <button
                    type="button"
                    className="eh-acc-item danger"
                    role="menuitem"
                    onClick={() => { setAccOpen(false); onLogout?.(); }}
                  >
                    <FiLogOut />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

TopBar.propTypes = {
  isAuthed: PropTypes.bool,
  displayName: PropTypes.string,
  avatarLetter: PropTypes.string,
  badgeCount: PropTypes.number,
  onLogout: PropTypes.func,
};

TopBar.defaultProps = {
  isAuthed: false,
  displayName: '',
  avatarLetter: 'ح',
  badgeCount: 0,
  onLogout: () => {},
};

export default TopBar;

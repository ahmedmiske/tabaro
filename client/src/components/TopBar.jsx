// src/components/TopBar.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiHome, FiUser, FiBell, FiSettings, FiLogOut, FiChevronDown, FiPlus } from 'react-icons/fi';

function TopBar({ isAuthed, displayName, avatarUrl, badgeCount, onLogout }) {
  const [accOpen, setAccOpen] = useState(false);
  const accRef = useRef(null);

  // 🔔 تحريك الجرس عند زيادة العدّاد
  const prevCountRef = useRef(badgeCount || 0);
  const [justArrived, setJustArrived] = useState(false);
  useEffect(() => {
    const prev = prevCountRef.current;
    const curr = Number(badgeCount || 0);
    if (curr > prev) {
      setJustArrived(true);
      const t = setTimeout(() => setJustArrived(false), 1200);
      return () => clearTimeout(t);
    }
    prevCountRef.current = curr;
  }, [badgeCount]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setAccOpen(false); };
    const onDoc = (e) => { if (accRef.current && !accRef.current.contains(e.target)) setAccOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDoc);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDoc); };
  }, []);

  // 🔢 عرض الشارة (99+)
  const countNum = Number.isFinite(badgeCount) ? Math.max(0, badgeCount) : 0;
  const displayCount = countNum > 99 ? '99+' : `${countNum}`;
  const hasUnread = countNum > 0;

  return (
    <div className="eh-top-bar" dir="rtl">
      <div className="eh-top-container">
        <div className="eh-top-left">
          <Link to="/" className="eh-top-link"><FiHome /><span>الرئيسية</span></Link>
          <Link to="/about" className="eh-top-link"><span>عن المنصة</span></Link>
        </div>

        <div className="eh-top-right">
          {!isAuthed ? (
            <>
              <Link to="/login" className="eh-login-btn"><FiUser /><span>تسجيل الدخول</span></Link>
              <Link to="/add-user" className="eh-login-btn"><FiPlus /><span>انشاء حساب</span></Link>
            </>
          ) : (
            <>
              {/* 🔔 أيقونة الإشعارات المُحسّنة */}
              <Link
                to="/notifications"
                className={`eh-icon-mini eh-bell ${justArrived ? 'has-new' : ''}`}
                aria-label={hasUnread ? `لديك ${displayCount} إشعار غير مقروء` : 'لا إشعارات جديدة'}
                title={hasUnread ? `${displayCount} إشعار غير مقروء` : 'الإشعارات'}
              >
                <FiBell aria-hidden="true" />
                {hasUnread && (
                  <>
                    <span className="eh-badge-mini" aria-hidden="true">{displayCount}</span>
                    <span className="eh-bell-ping" aria-hidden="true" />
                  </>
                )}
              </Link>

              {/* حساب المستخدم */}
              <div className={`eh-acc ${accOpen ? 'open' : ''}`} ref={accRef}>
                <button className="eh-acc-btn" onClick={() => setAccOpen(v => !v)}
                        aria-haspopup="menu" aria-expanded={accOpen} aria-label="قائمة الحساب">
                  <span className="eh-avatar-mini">
                    {avatarUrl ? <img src={avatarUrl} alt={displayName} className="eh-avatar-img" /> : <FiUser />}
                  </span>
                  <span className="eh-username-mini hide-on-sm">{displayName}</span>
                  <FiChevronDown className="eh-acc-caret" />
                </button>

                <div className="eh-acc-menu" role="menu">
                  <div className="eh-acc-head" aria-hidden="true">
                    <span className="eh-avatar-large">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="eh-avatar-img" /> : <FiUser />}
                    </span>
                    <div className="eh-acc-name">{displayName}</div>
                  </div>
                  <div className="eh-acc-divider" />

                  <Link to="/profile" className="eh-acc-item" role="menuitem" onClick={() => setAccOpen(false)}>
                    <FiUser /><span>الملف الشخصي</span>
                  </Link>
                  <Link to="/profile?tab=account" className="eh-acc-item" role="menuitem" onClick={() => setAccOpen(false)}>
                    <FiSettings /><span>الإعدادات</span>
                  </Link>

                  <div className="eh-acc-divider" />
                  <button type="button" className="eh-acc-item danger" role="menuitem"
                          onClick={() => { setAccOpen(false); onLogout?.(); }}>
                    <FiLogOut /><span>تسجيل الخروج</span>
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
  avatarUrl: PropTypes.string,
  badgeCount: PropTypes.number,
  onLogout: PropTypes.func,
};
TopBar.defaultProps = {
  isAuthed: false,
  displayName: '',
  avatarUrl: '',
  badgeCount: 0,
  onLogout: () => {},
};

export default TopBar;

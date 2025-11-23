// src/components/CartDropdown.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiX, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import './CartDropdown.css';

function CartDropdown({ isOpen, onClose }) {
  const { cartItems, removeFromCart, clearCart, markAsDonated } = useCart();
  const hasItems = cartItems && cartItems.length > 0;

  return (
    <div
      className={`cart-dropdown-overlay ${isOpen ? 'open' : ''}`}
      aria-hidden={!isOpen}
      onClick={onClose}
    >
      <aside
        className={`cart-dropdown-panel ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <header className="cart-dropdown-header">
          <div className="cart-dropdown-title">سلة التبرعات</div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={onClose}
            aria-label="إغلاق السلة"
          >
            <FiX />
          </button>
        </header>

        <div className="cart-dropdown-subtitle">
          {hasItems ? (
            <>
              لديك{' '}
              <span className="count-pill">
                {cartItems.length} طلب محفوظ
              </span>
            </>
          ) : (
            'لا توجد عناصر في السلة بعد.'
          )}
        </div>

        <div className="cart-items-container">
          {hasItems &&
            cartItems.map((item) => (
              <div
                key={item.id}
                className={`cart-item-card ${
                  item.status === 'donated' ? 'is-archived' : ''
                }`}
              >
                <div className="cart-item-header">
                  <span className="cart-chip kind">
                    {item.kind === 'blood' ? 'تبرع بالدم' : 'تبرع عام'}
                  </span>
                  {item.category && (
                    <span className="cart-chip category">
                      {item.category}
                    </span>
                  )}
                  {item.status === 'donated' && (
                    <span className="cart-chip archived">
                      تم التبرع (أرشيف)
                    </span>
                  )}
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-title">
                    {item.title || item.type || 'طلب تبرع'}
                  </div>
                  {item.place && (
                    <div className="cart-item-meta">
                      📍 المكان: {item.place}
                    </div>
                  )}
                  {item.deadline && (
                    <div className="cart-item-meta">
                      🗓️ آخر موعد:{' '}
                      {new Date(item.deadline).toLocaleDateString('ar-MA')}
                    </div>
                  )}
                  {'amount' in (item || {}) && item.amount != null && (
                    <div className="cart-item-meta">
                      💰 المبلغ:{' '}
                      <strong>{item.amount}</strong> أوقية جديدة
                    </div>
                  )}
                </div>

                <div className="cart-item-footer">
                  <div className="btn-group">
                    {item.status !== 'donated' && (
                      <button
                        type="button"
                        className="btn-cart small primary"
                        onClick={() => markAsDonated(item.id)}
                      >
                        <FiCheckCircle className="ms-1" />
                        تم التبرع
                      </button>
                    )}

                    <Link
                      to={`/donations/${item.id}`}
                      className="btn-cart small outline"
                      onClick={onClose}
                    >
                      تفاصيل الطلب
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="btn-icon danger"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="حذف من السلة"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
        </div>

        {hasItems && (
          <footer className="cart-dropdown-footer">
            <button
              type="button"
              className="btn-cart danger full"
              onClick={clearCart}
            >
              مسح السلة بالكامل
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}

CartDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CartDropdown;

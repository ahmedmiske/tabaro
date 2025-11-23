// client/src/components/CartIcon.jsx
import React, { useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./CartIcon.css";

/**
 * 🛒 مكوّن عربة التسوق/التبرع
 * - يستقبل items (قائمة العناصر في العربة)
 * - onRemove (حذف عنصر من العربة)
 */
function CartIcon({ items = [], onRemove = () => {} }) {
  const [open, setOpen] = useState(false);

  const count = items.length;

  return (
    <div className="cart-icon-wrapper">
      <Dropdown show={open} onToggle={() => setOpen((prev) => !prev)}>
        <Dropdown.Toggle
          id="cart-dropdown"
          variant="light"
          className="cart-icon-toggle"
        >
          <FiShoppingCart size={20} />
          {count > 0 && (
            <Badge bg="danger" pill className="cart-icon-badge">
              {count}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="cart-dropdown-menu" align="end">
          <div className="cart-dropdown-header">
            <span>عربة التبرعات</span>
            <span className="cart-dropdown-count">
              {count} عنصر{count === 1 ? "" : "اً"}
            </span>
          </div>

          <div className="cart-dropdown-body">
            {count === 0 ? (
              <p className="text-muted small mb-0">
                لم تُضف أي تبرعات إلى العربة بعد.
              </p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-main">
                    <div className="cart-item-title">
                      {item.title || "طلب تبرع"}
                    </div>
                    {item.type && (
                      <div className="cart-item-type">
                        {item.type === "blood" ? "تبرع بالدم" : "تبرع عام"}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => onRemove(item.id)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {count > 0 && (
            <div className="cart-dropdown-footer">
              <Link
                to="/cart"
                className="btn btn-success w-100 btn-sm cart-go-to-cart"
                onClick={() => setOpen(false)}
              >
                متابعة التبرع
              </Link>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default CartIcon;

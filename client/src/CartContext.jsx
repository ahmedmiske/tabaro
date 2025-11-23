// src/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

const CartContext = createContext(null);
const STORAGE_KEY = 'tabaro_cart_v1';

/** قراءة السلة من localStorage */
function loadInitialCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadInitialCart);

  // حفظ في localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  /** إضافة عنصر للسلة (منع التكرار) */
  const addToCart = useCallback((item) => {
    if (!item || !item.id) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(item.id));
      // موجود: نعمل دمج بسيط (لا نضيف صف جديد)
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...item };
        return next;
      }
      // جديد
      return [
        ...prev,
        {
          ...item,
          status: item.status || 'pending', // pending أو donated
        },
      ];
    });
  }, []);

  /** حذف عنصر واحد من السلة */
  const removeFromCart = useCallback((id) => {
    setCartItems((prev) =>
      prev.filter((x) => String(x.id) !== String(id)),
    );
  }, []);

  /** مسح السلة بالكامل */
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /** تعليم الطلب كـ "تم التبرع" مع وضعه في الأرشيف */
  const markAsDonated = useCallback((id) => {
    if (!id) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((x) => String(x.id) === String(id));
      // لو غير موجود نضيفه كأرشيف فقط
      if (idx === -1) {
        return [
          ...prev,
          {
            id,
            status: 'donated',
            archived: true,
          },
        ];
      }
      const next = [...prev];
      next[idx] = { ...next[idx], status: 'donated', archived: true };
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      markAsDonated,
    }),
    [cartItems, addToCart, removeFromCart, clearCart, markAsDonated],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

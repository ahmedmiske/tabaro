// src/pages/CartPage.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Badge, Button, Card } from 'react-bootstrap';
import {
  FiTrash2,
  FiArrowRight,
  FiHeart,
  FiInfo,
} from 'react-icons/fi';
import { useCart } from '../CartContext.jsx';
import './CartPage.css';

// نفس تنسيق الأوقية الجديدة الذي تستعمله في التفاصيل
const toMRU = (v) =>
  v === null || v === undefined || v === '' ? 0 : Number(v) / 10;

const formatInt = (v) =>
  v === null || v === undefined || v === ''
    ? '-'
    : Math.round(Number(v)).toLocaleString('ar-MA');

const formatMRU = (mroValue) => formatInt(toMRU(mroValue));

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCart();

  const hasItems = items && items.length > 0;

  return (
    <main className="cart-page" dir="rtl">
      <div className="cart-page-header">
        <div className="cart-page-title-row">
          <h1 className="cart-page-title">سلة التبرعات</h1>

          <Button
            variant="outline-secondary"
            size="sm"
            className="cart-back-btn"
            onClick={() => navigate(-1)}
          >
            <FiArrowRight className="ms-1" />
            رجوع
          </Button>
        </div>

        {hasItems && (
          <div className="cart-page-subtitle">
            لديك{' '}
            <strong>{items.length}</strong>{' '}
            طلب محفوظ في السلة
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-3 cart-clear-btn"
              onClick={clearCart}
            >
              مسح السلة
            </Button>
          </div>
        )}
      </div>

      {!hasItems && (
        <section className="cart-empty-state">
          <div className="cart-empty-icon">🧺</div>
          <h2>سلتك فارغة حالياً</h2>
          <p>
            يمكنك حفظ طلبات التبرع هنا للعودة إليها لاحقاً
            عندما تكون جاهزاً للتبرع.
          </p>
          <Button
            as={Link}
            to="/donations"
            variant="success"
            className="mt-3"
          >
            استكشاف طلبات التبرع
          </Button>
        </section>
      )}

      {hasItems && (
        <section className="cart-layout">
          {/* عمود العناصر */}
          <div className="cart-items-column">
            {items.map((item) => {
              const isGeneral = item.kind === 'general' || item.kind === 'donation-request';
              const badgeText = isGeneral ? 'تبرع عام' : 'طلب تبرع';
              const badgeVariant = isGeneral ? 'success' : 'danger';

              return (
                <Card
                  key={item.id}
                  className="cart-item-card shadow-sm mb-3"
                >
                  <Card.Body>
                    <div className="cart-item-main">
                      <div className="cart-item-header">
                        <Badge bg={badgeVariant} className="cart-kind-badge">
                          {badgeText}
                        </Badge>

                        {item.category && (
                          <span className="cart-category-chip">
                            {item.category}
                          </span>
                        )}
                      </div>

                      <h5 className="cart-item-title">
                        {item.title || item.category || 'طلب تبرع'}
                      </h5>

                      {item.place && (
                        <div className="cart-item-meta">
                          <span>📍 {item.place}</span>
                        </div>
                      )}

                      <div className="cart-item-meta">
                        {'amount' in item && item.amount != null && (
                          <span>
                            💰 المبلغ المطلوب:{' '}
                            <strong>{formatMRU(item.amount)}</strong>{' '}
                            <small>أوقية جديدة</small>
                          </span>
                        )}
                        {item.deadline && (
                          <span>
                            🗓️ آخر موعد:{' '}
                            <strong>
                              {new Date(item.deadline).toLocaleDateString(
                                'ar-MA',
                              )}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* أزرار العنصر */}
                    <div className="cart-item-actions">
                      {item.link && (
                        <Button
                          as={Link}
                          to={item.link}
                          variant="outline-primary"
                          size="sm"
                          className="mb-2 w-100"
                        >
                          عرض تفاصيل الطلب
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="w-100"
                        onClick={() => removeItem(item.id)}
                      >
                        <FiTrash2 className="ms-1" />
                        إزالة من السلة
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* عمود الملخّص */}
          <aside className="cart-summary-column">
            <Card className="cart-summary-card shadow-sm">
              <Card.Body>
                <h5 className="cart-summary-title">
                  ملخص السلة
                </h5>

                <div className="cart-summary-line">
                  <span>عدد الطلبات</span>
                  <strong>{items.length}</strong>
                </div>

                <Alert
                  variant="light"
                  className="border cart-summary-hint"
                >
                  <FiInfo className="ms-1" />
                  الطلبات الموجودة هنا لا تُرسل لصاحب الطلب
                  تلقائياً. عند استعدادك للتبرع، ادخل إلى
                  كل طلب واضغط على <strong>تأكيد التبرع</strong>.
                </Alert>

                <Button
                  as={Link}
                  to="/donations"
                  variant="success"
                  className="w-100 mb-2"
                >
                  <FiHeart className="ms-1" />
                  متابعة استكشاف الطلبات
                </Button>

                <Button
                  variant="outline-danger"
                  className="w-100"
                  onClick={clearCart}
                >
                  مسح السلة بالكامل
                </Button>
              </Card.Body>
            </Card>
          </aside>
        </section>
      )}
    </main>
  );
}

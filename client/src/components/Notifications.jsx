// src/componentes/Notifications.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Spinner,
  Row,
  Col,
  Image,
  Badge,
  Form,
  InputGroup,
  Placeholder,
  Alert,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './Notifications.css';

dayjs.extend(relativeTime);
dayjs.locale('ar');

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const TYPE_OPTIONS = [
  { key: 'all', label: 'الكل' },
  { key: 'offer', label: 'العروض' },
  { key: 'message', label: 'الرسائل' },
  { key: 'system', label: 'النظام' },
];

function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [readFilter, setReadFilter] = useState('all'); // all | read | unread

  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', page);
    p.set('limit', 20);
    if (query?.trim()) p.set('query', query.trim());
    if (type !== 'all') p.set('type', type);
    if (readFilter !== 'all')
      p.set('read', readFilter === 'read' ? 'true' : 'false');
    return `?${p.toString()}`;
  }, [page, query, type, readFilter]);

  const goHref = useCallback((n) => {
    if (n?.meta?.route) return n.meta.route;
    if (n.type === 'offer') return `/blood-donation-details/${n.referenceId}`;
    return `/donations/${n.referenceId || ''}`;
  }, []);

  const load = useCallback(
    async (opts = { reset: false }) => {
      const isFirst = opts.reset || page === 1;
      try {
        if (isFirst) setLoading(true);
        else setLoadingMore(true);
        setError('');

        const { body, ok } = await fetchWithInterceptors(
          `/api/notifications${params}`,
        );
        if (!ok) throw new Error(body?.message || 'فشل في جلب الإشعارات');

        const data = body?.data || body?.items || body || [];
        const meta = body?.meta || body?.pagination || {};
        const nextHasMore =
          typeof meta?.hasMore === 'boolean'
            ? meta.hasMore
            : Array.isArray(data) && data.length === 20;

        setHasMore(nextHasMore);
        setItems((prev) => (isFirst ? data : [...prev, ...data]));
      } catch (e) {
        setError(e?.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [params, page],
  );

  // إعادة الصفحة للأولى عند تغيير الفلاتر/البحث
  useEffect(() => {
    setPage(1);
  }, [query, type, readFilter]);

  // تحميل حسب الصفحة الحالية
  useEffect(() => {
    load({ reset: true });
  }, [page, load]);

  // التحميل التلقائي (Infinite scroll)
  useEffect(() => {
    if (!sentinelRef.current) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasMore && !loading && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '200px' },
    );
    observerRef.current.observe(sentinelRef.current);
    return () =>
      observerRef.current && observerRef.current.disconnect();
  }, [hasMore, loading, loadingMore]);

  const markAsRead = async (id) => {
    const idx = items.findIndex((x) => x._id === id);
    if (idx < 0) return;
    const snapshot = items;
    const updated = [...items];
    updated[idx] = { ...updated[idx], read: true };
    setItems(updated);
    try {
      await fetchWithInterceptors(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch {
      setItems(snapshot);
    }
  };

  const markAllAsRead = async () => {
    const snapshot = items;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetchWithInterceptors(`/api/notifications/read-all`, {
        method: 'PATCH',
      });
    } catch {
      setItems(snapshot);
    }
  };

  const deleteOne = async (id) => {
    const snapshot = items;
    setItems((prev) => prev.filter((n) => n._id !== id));
    try {
      await fetchWithInterceptors(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch {
      setItems(snapshot);
    }
  };

  const filteredInfo = useMemo(() => {
    // فلترة دفاعية محليًا أيضًا
    return items.filter((n) => {
      const matchType = type === 'all' || n.type === type;
      const matchRead =
        readFilter === 'all' ||
        (readFilter === 'read' ? n.read : !n.read);
      const q = query.trim().toLowerCase();
      const matchQ =
        !q ||
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n?.sender?.firstName &&
          n.sender.firstName.toLowerCase().includes(q)) ||
        (n?.sender?.lastName &&
          n.sender.lastName.toLowerCase().includes(q));
      return matchType && matchRead && matchQ;
    });
  }, [items, query, type, readFilter]);

  const unreadCount = useMemo(
    () => filteredInfo.filter((n) => !n.read).length,
    [filteredInfo],
  );

  const badgeVariant = (t) =>
    t === 'offer' ? 'success' : t === 'message' ? 'primary' : 'secondary';

  const whenText = (n) => (n.createdAt ? dayjs(n.createdAt).fromNow() : '');

  if (loading && !items.length) {
    return (
      <div
        className="notifications-container"
        aria-busy="true"
        aria-live="polite"
      >
        <SkeletonHeader />
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div
      className="notifications-container"
      role="region"
      aria-label="قائمة الإشعارات"
    >
      <div className="notifications-header">
        <h2 className="title-liste-notification">
          <i className="fas fa-bell me-2" aria-hidden="true"></i>
          جميع الإشعارات
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              className="ms-2"
              aria-label={`${unreadCount} غير مقروءة`}
            >
              {unreadCount}
            </Badge>
          )}
        </h2>

        <div className="controls">
          <InputGroup className="search-input">
            <InputGroup.Text>
              <i className="fas fa-search" aria-hidden="true" />
            </InputGroup.Text>
            <Form.Control
              type="search"
              placeholder="ابحث في العنوان/المرسل/النص…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="بحث في الإشعارات"
            />
          </InputGroup>

          <div className="filters">
            {TYPE_OPTIONS.map((opt) => (
              <Button
                key={opt.key}
                variant={type === opt.key ? 'dark' : 'outline-dark'}
                size="sm"
                onClick={() => setType(opt.key)}
                aria-pressed={type === opt.key}
              >
                {opt.label}
              </Button>
            ))}

            <Form.Select
              size="sm"
              className="read-select"
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              aria-label="تصفية حسب حالة القراءة"
            >
              <option value="all">الكل</option>
              <option value="unread">غير المقروءة</option>
              <option value="read">المقروءة</option>
            </Form.Select>
          </div>

          <div className="bulk-actions">
            <Button
              size="sm"
              variant="outline-success"
              onClick={markAllAsRead}
              disabled={!unreadCount}
            >
              <i className="far fa-check-circle me-1" /> تمييز الكل كمقروء
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => load({ reset: true })}
            >
              <i className="fas fa-sync-alt me-1" /> تحديث
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => load({ reset: true })}
            >
              إعادة المحاولة
            </Button>
          </div>
        </Alert>
      )}

      {filteredInfo.length === 0 ? (
        <EmptyState />
      ) : (
        <Row xs={1} md={2} className="row-notifications g-4" role="list">
          {filteredInfo.map((n) => {
            const sender = n.sender;
            const created = n.createdAt ? new Date(n.createdAt) : null;
            const absolute = created ? created.toLocaleString('ar-MA') : '';
            const to = n.referenceId ? goHref(n) : undefined;

            return (
              <Col key={n._id} role="listitem" className="notification-col">
                <Card
                  className={`notification-card shadow-sm border-0 ${
                    n.read ? '' : 'unread'
                  }`}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && to) {
                      e.currentTarget.querySelector('a,button')?.click();
                    }
                  }}
                >
                  <Card.Body>
                    <div className="d-flex align-items-start gap-3 mb-2">
                      <div className="avatar-wrap">
                        {!n.read && (
                          <span className="unread-dot" aria-hidden="true" />
                        )}
                        <Image
                          src={resolveAvatar(sender?.profileImage)}
                          onError={(e) =>
                            (e.currentTarget.src = '/default-avatar.png')
                          }
                          roundedCircle
                          width={44}
                          height={44}
                          alt={
                            sender
                              ? `${sender.firstName || ''} ${
                                  sender.lastName || ''
                                }`.trim()
                              : 'النظام'
                          }
                        />
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <strong className="notificacion-title">
                            {n.title || 'إشعار'}
                          </strong>
                          <Badge bg={badgeVariant(n.type)}>
                            {n.type || 'system'}
                          </Badge>
                        </div>
                        <div className="text-muted small">
                          {sender
                            ? `${sender.firstName || ''} ${
                                sender.lastName || ''
                              }`.trim()
                            : 'النظام'}
                        </div>
                      </div>

                      <div className="card-actions">
                        {!n.read && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => markAsRead(n._id)}
                            title="تمييز كمقروء"
                          >
                            <i className="far fa-check-circle" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => deleteOne(n._id)}
                          title="حذف الإشعار"
                        >
                          <i className="far fa-trash-alt" />
                        </Button>
                      </div>
                    </div>

                    <div className="notification-message text-muted">
                      {n.message}
                    </div>

                    <div className="mt-2 small text-secondary" title={absolute}>
                      <i className="far fa-clock me-2" aria-hidden="true"></i>
                      {whenText(n)}
                    </div>

                    {n.referenceId && (
                      <Button
                        as={Link}
                        to={to}
                        size="sm"
                        variant="outline-primary"
                        className="mt-3"
                      >
                        <i className="fas fa-eye me-1"></i>تفاصيل
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <div ref={sentinelRef} />

      {hasMore && (
        <div className="load-more-wrap">
          {loadingMore ? (
            <Spinner animation="border" role="status" aria-label="جاري التحميل" />
          ) : (
            <Button variant="outline-primary" onClick={() => setPage((p) => p + 1)}>
              تحميل المزيد
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonHeader() {
  return (
    <div className="notifications-header">
      <Placeholder as="h2" animation="glow" className="w-50">
        <Placeholder xs={8} />
      </Placeholder>
      <div className="controls">
        <Placeholder animation="glow" className="w-100">
          <Placeholder xs={12} style={{ height: 38 }} />
        </Placeholder>
      </div>
    </div>
  );
}

function SkeletonList({ count = 4 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="notification-card skeleton">
          <Card.Body>
            <div className="d-flex align-items-start gap-3 mb-2">
              <Placeholder className="rounded-circle" style={{ width: 44, height: 44 }} />
              <div className="flex-grow-1">
                <Placeholder animation="glow"><Placeholder xs={6} /></Placeholder>
                <Placeholder animation="glow"><Placeholder xs={4} /></Placeholder>
              </div>
            </div>
            <Placeholder animation="glow"><Placeholder xs={10} /></Placeholder>
            <Placeholder animation="glow"><Placeholder xs={7} /></Placeholder>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
SkeletonList.propTypes = {
  count: PropTypes.number,
};

function EmptyState() {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <Image src="/illustrations/empty-inbox.svg" alt="" width={120} height={120} />
      <h5 className="mt-3">لا توجد نتائج</h5>
      <p className="text-muted mb-0">جرّب تعديل المرشّحات أو البحث بكلمات أخرى.</p>
    </div>
  );
}

export default Notifications;

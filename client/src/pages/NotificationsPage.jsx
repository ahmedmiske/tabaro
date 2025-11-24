// src/pages/NotificationsPage.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import {
  ListGroup,
  Button,
  Image,
  Badge,
  Spinner,
} from 'react-bootstrap';
import {
  useNavigate,
  useSearchParams,
  useLocation,
} from 'react-router-dom';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import './NotificationsPage.css';

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

/* ✅ مسارات التفاصيل */
const BLOOD_REQUEST_ROUTE =
  process.env.REACT_APP_BLOOD_DETAILS_ROUTE || '/blood-donation-details';
const GENERAL_REQUEST_ROUTE =
  process.env.REACT_APP_DONATION_DETAILS_ROUTE || '/donations';
const DONATION_CONFIRM_ROUTE =
  process.env.REACT_APP_DONATION_CONFIRMATION_ROUTE ||
  '/donation-confirmations';
const DONATION_ENTITY_ROUTE =
  process.env.REACT_APP_DONATION_ENTITY_ROUTE || '/donation-details';
const DONATION_REQUEST_CONFIRM_ROUTE =
  process.env.REACT_APP_DONATION_REQUEST_CONFIRM_ROUTE ||
  '/donation-request-confirmations';

/* --------- Utils --------- */
const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const fmtDateTime = (s) =>
  s
    ? new Date(s).toLocaleString('ar-MA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

/* عنوان عربي حسب نوع الإشعار */
const typeLabelAr = (n) => {
  const key = (
    n?.meta?.event ||
    n?.event ||
    n?.type ||
    n?.meta?.type ||
    'general'
  )
    .toString()
    .toLowerCase();

  const map = {
    message: 'رسالة جديدة',
    offer: 'عرض تبرع',
    donation: 'تبرع',
    system: 'نظام',
    general: 'إشعار',
    donation_request_confirmation: 'تأكيد طلب تبرع',
    donation_confirmation: 'تأكيد استلام التبرع',
    donation_offer: 'عرض تبرع',
    donation_fulfilled: 'تم التنفيذ',
    donation_rated: 'تم التقييم',
    request_created: 'طلب تبرع جديد',
    offer_accepted: 'تم قبول العرض',
    offer_rejected: 'تم رفض العرض',
  };
  return map[key] || 'إشعار';
};

/* هل هو إشعار عن طلب دم؟ */
const isBloodStrict = (n) => {
  const m = n?.meta || {};
  const kind = String(m.requestType || m.kind || m.category || '').toLowerCase();
  return (
    m.blood === true ||
    m.blood === 'true' ||
    !!m.bloodRequestId ||
    !!m.bloodType ||
    kind === 'blood'
  );
};

/* طبيعة الطلب (تبرع مالي / عيني ..) */
const categoryLabelAr = (n) => {
  if (isBloodStrict(n)) return 'تبرع بالدم';
  const m = n?.meta || {};
  const kind = (m.requestType || m.kind || m.category || '')
    .toString()
    .toLowerCase();
  const map = {
    money: 'تبرع مالي',
    financial: 'تبرع مالي',
    goods: 'تبرع عيني',
    material: 'تبرع عيني',
    health: 'الصحة',
  };
  return map[kind] || (m.requestType || m.kind || m.category || '');
};

/* استخراج المعرّفات */
const extractIds = (n) => {
  const m = n?.meta || {};

  const requestId =
    m.requestId ||
    m.donationRequestId ||
    m.bloodRequestId ||
    n?.requestId ||
    n?.request?._id ||
    null;

  const donationEntityId = m.donationId || m.donation?._id || null;

  const confirmationId =
    m.confirmationId ||
    m.donationConfirmationId ||
    m.offerId ||
    n?.referenceId ||
    m.id ||
    null;

  const requestConfId =
    m.requestConfirmationId ||
    m.donationRequestConfirmationId ||
    m.reqConfirmationId ||
    null;

  return { requestId, donationEntityId, confirmationId, requestConfId };
};

/* هل الإشعار عن تأكيد/عرض تبرع؟ */
const isDonationConfirmation = (n) => {
  const m = n?.meta || {};
  const t = (n?.type || m.type || m.event || '').toLowerCase();
  const entity = (m.entity || '').toLowerCase();
  const keys = [
    'donation_confirmation',
    'confirmation',
    'offer',
    'donation_offer',
    'donation_fulfilled',
    'fulfilled',
    'donation_rated',
    'rated',
  ];
  return keys.some((k) => t.includes(k) || entity.includes(k));
};

/* هل الإشعار عن "تأكيد طلب تبرع"؟ */
const isDonationRequestConfirmation = (n) => {
  const m = n?.meta || {};
  const t = (n?.type || m.type || m.event || '').toLowerCase();
  return t.includes('donation_request_confirmation');
};

/* 👇 تصنيف الإشعارات لأغراض الفلترة */
const notifKind = (n) => {
  const m = n?.meta || {};
  const t = (
    n?.type ||
    m.type ||
    m.event ||
    ''
  )
    .toString()
    .toLowerCase();

  if ((n.type || '').toLowerCase() === 'message') return 'message';
  if ((n.type || '').toLowerCase() === 'system' || t.includes('system'))
    return 'system';

  if (
    t.includes('offer') ||
    t.includes('donation_confirmation') ||
    t.includes('donation_fulfilled') ||
    t.includes('donation_rated') ||
    t.includes('offer_accepted') ||
    t.includes('offer_rejected')
  ) {
    return 'offer';
  }

  if (
    t.includes('request') ||
    t.includes('request_created') ||
    t.includes('donation_request_confirmation')
  ) {
    return 'request';
  }

  // fallback: لو فيه requestId لكن مش مصنف
  const ids = extractIds(n);
  if (ids.requestId && !isDonationConfirmation(n)) return 'request';

  return 'other';
};

/* تحديد وجهة التنقل */
const buildNavigateTarget = (n) => {
  const { requestId, donationEntityId, confirmationId, requestConfId } =
    extractIds(n);

  if (requestId) {
    const base = isBloodStrict(n) ? BLOOD_REQUEST_ROUTE : GENERAL_REQUEST_ROUTE;
    return `${base}/${requestId}`;
  }

  if (isDonationRequestConfirmation(n) && (requestConfId || confirmationId)) {
    const id = requestConfId || confirmationId;
    return `${DONATION_REQUEST_CONFIRM_ROUTE}/${id}`;
  }

  if (isDonationConfirmation(n) && confirmationId) {
    return `${DONATION_CONFIRM_ROUTE}/${confirmationId}`;
  }

  if (donationEntityId) {
    return `${DONATION_ENTITY_ROUTE}/${donationEntityId}`;
  }

  // لو ما فيش معرّف، ممكن في المستقبل نرسله لصفحة إدارة عامة
  return null;
};

/* ====== الكاش ====== */
const CACHE_KEY = 'notif:list';
const CACHE_TTL_MS = 20 * 1000; // 20 ثانية

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'offer', label: 'العروض' },
  { key: 'request', label: 'الطلبات' },
  { key: 'system', label: 'النظام' },
  { key: 'message', label: 'المحادثة' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialFilter =
    searchParams.get('filter') ||
    sessionStorage.getItem('notifFilter') ||
    'all';
  const [filter, setFilter] = useState(initialFilter);

  const aborter = useRef(null);
  const lastFetchAtRef = useRef(0);

  const setFilterPersist = useCallback(
    (val) => {
      setFilter(val);
      sessionStorage.setItem('notifFilter', val);
      const next = new URLSearchParams(searchParams);
      next.set('filter', val);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  /* ====== كاش ====== */
  const readCache = () => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { at, items } = JSON.parse(raw);
      if (!Array.isArray(items)) return null;
      if (Date.now() - at > CACHE_TTL_MS) return null;
      return items;
    } catch {
      return null;
    }
  };

  const writeCache = (items) => {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ at: Date.now(), items }),
      );
    } catch {}
  };

  const fetchNotifications = useCallback(
    async (opts = { force: false }) => {
      const now = Date.now();
      if (!opts.force && now - lastFetchAtRef.current < 1500) return;
      lastFetchAtRef.current = now;

      if (aborter.current) aborter.current.abort();
      aborter.current = new AbortController();

      setLoading(true);
      try {
        const res = await fetchWithInterceptors('/api/notifications', {
          signal: aborter.current.signal,
        });
        if (res.ok) {
          const list = res.body?.data || res.body || [];
          setNotifications(list);
          writeCache(list);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // عرض الكاش ثم إعادة الجلب
  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setNotifications(cached);
      setLoading(false);
      fetchNotifications({ force: true });
    } else {
      fetchNotifications({ force: true });
    }
    return () => aborter.current && aborter.current.abort();
  }, [fetchNotifications]);

  // تحديث تلقائي عند العودة للصفحة
  useEffect(() => {
    const onFocus = () => fetchNotifications({ force: true });
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications({ force: true });
      }
    };
    const onPageShow = () => fetchNotifications({ force: true });

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications({ force: true });
  }, [location.key, fetchNotifications]);

  /* ====== تجميع رسائل المحادثة ====== */
  const { messageThreads, others } = useMemo(() => {
    const threadsMap = new Map();
    const rest = [];

    (notifications || []).forEach((n) => {
      if ((n.type || 'system') !== 'message') {
        rest.push(n);
        return;
      }

      const senderId =
        n.sender?._id || n.senderId || n.meta?.senderId || 'unknown';
      const entry =
        threadsMap.get(senderId) || {
          senderId,
          sender: n.sender || null,
          ids: [],
          unreadCount: 0,
          lastMessage: '',
          lastCreatedAt: 0,
        };

      entry.ids.push(n._id);
      if (!n.read) entry.unreadCount += 1;

      const ts = new Date(n.createdAt || 0).getTime();
      if (ts >= entry.lastCreatedAt) {
        entry.lastCreatedAt = ts;
        entry.lastMessage = n.message || n.title || '';
        entry.sender = n.sender || entry.sender;
      }
      threadsMap.set(senderId, entry);
    });

    const messageThreadsArr = Array.from(threadsMap.values()).sort(
      (a, b) => b.lastCreatedAt - a.lastCreatedAt,
    );
    return { messageThreads: messageThreadsArr, others: rest };
  }, [notifications]);

  /* ===== عدّادات ===== */
  const counts = useMemo(() => {
    const base = {
      all: notifications.length,
      offer: 0,
      request: 0,
      system: 0,
      message: 0,
      unreadAll: notifications.filter((n) => !n.read).length,
    };

    notifications.forEach((n) => {
      const k = notifKind(n);
      if (k === 'offer') base.offer += 1;
      else if (k === 'request') base.request += 1;
      else if (k === 'system') base.system += 1;
      else if (k === 'message') base.message += 1;
    });

    return base;
  }, [notifications]);

  /* ===== ما الذي نعرضه حسب الفلتر؟ ===== */
  const viewModel = useMemo(() => {
    if (filter === 'message') {
      return { mode: 'messageOnly', threads: messageThreads, items: [] };
    }

    let items = others;
    if (filter === 'offer') {
      items = others.filter((n) => notifKind(n) === 'offer');
    } else if (filter === 'request') {
      items = others.filter((n) => notifKind(n) === 'request');
    } else if (filter === 'system') {
      items = others.filter((n) => notifKind(n) === 'system');
    }

    if (filter === 'all') {
      return { mode: 'all', threads: messageThreads, items };
    }
    return { mode: 'othersOnly', threads: [], items };
  }, [filter, messageThreads, others]);

  /* ===== API: تعليم كمقروء ===== */
  const markAsRead = async (id) => {
    try {
      await fetchWithInterceptors(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch {}
  };

  const openChat = async (thread) => {
    if (!thread?.senderId || thread.senderId === 'unknown') return;
    await Promise.all(thread.ids.map((id) => markAsRead(id)));
    navigate(`/chat/${thread.senderId}`, {
      state: { from: location.pathname + location.search },
    });
    fetchNotifications({ force: true });
  };

  const openDetails = async (n) => {
    if (!n.read) {
      await markAsRead(n._id);
      fetchNotifications({ force: true });
    }
    const route = buildNavigateTarget(n);
    if (route) {
      navigate(route, {
        state: { from: location.pathname + location.search },
      });
    } else {
      // في حالة خاصة ما عندهش معرّف، ممكن نذهب لاحقاً لصفحة إدارة عامة
    }
  };

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  const scrollToBottom = () =>
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });

  return (
    <div className="container-notifications compact" dir="rtl">
      {/* ===== الشريط العلوي ===== */}
      <div className="notif-header sticky">
        <h3 className="m-0 fw-bold text-secondary">
          🔔 جميع الإشعارات
        </h3>

        <div className="toolbar">
          {/* فلاتر كبسولات */}
          <div className="notif-filters-pills">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`notif-pill ${
                  filter === f.key ? 'active' : ''
                }`}
                onClick={() => setFilterPersist(f.key)}
              >
                <span className="notif-pill-label">{f.label}</span>
                <span className="notif-pill-count">
                  {f.key === 'all'
                    ? counts.all
                    : counts[f.key] || 0}
                </span>
                {f.key === 'all' && counts.unreadAll > 0 && (
                  <span className="notif-pill-unread">
                    {counts.unreadAll}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* زر التحديث */}
          <div className="toolbar-actions">
            <button
              type="button"
              className="btn-soft"
              onClick={() => fetchNotifications({ force: true })}
              disabled={loading}
            >
              <span className="icon">🔄</span>
              {loading ? 'جارٍ التحديث…' : 'تحديث'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-3 text-center text-muted small">
          <Spinner animation="border" size="sm" /> جاري التحميل...
        </div>
      )}

      {!loading && (
        <>
          {/* وضع الكل: رسائل + باقي الإشعارات */}
          {viewModel.mode === 'all' && (
            <>
              <h6 className="section-heading">المحادثات</h6>
              <ListGroup className="notification-list">
                {viewModel.threads.length === 0 ? (
                  <div className="text-muted small p-2">
                    لا توجد رسائل.
                  </div>
                ) : (
                  viewModel.threads.map((th) => (
                    <ListGroup.Item
                      key={th.senderId}
                      className={`notification-item compact thread-item shadow-sm rounded ${
                        th.unreadCount > 0 ? 'unread' : ''
                      }`}
                      onClick={() => openChat(th)}
                    >
                      <div className="item-wrap">
                        <Image
                          src={resolveAvatar(
                            th.sender?.profileImage,
                          )}
                          onError={(e) => {
                            e.currentTarget.src =
                              '/default-avatar.png';
                          }}
                          roundedCircle
                          width={40}
                          height={40}
                          alt="sender"
                        />
                        <div className="grow">
                          <div className="row-1">
                            <div className="title message">
                              💬{' '}
                              {th.sender
                                ? `${th.sender.firstName || ''} ${
                                    th.sender.lastName || ''
                                  }`.trim()
                                : 'مستخدم'}
                            </div>
                            {th.unreadCount > 0 && (
                              <Badge bg="primary" pill>
                                {th.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="row-2">
                            <div className="msg text-truncate">
                              {th.lastMessage || '—'}
                            </div>
                            <div className="date">
                              {fmtDateTime(th.lastCreatedAt)}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(th);
                          }}
                        >
                          فتح
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>

              <h6 className="section-heading mt-3">إشعارات</h6>
              <ListGroup className="notification-list">
                {viewModel.items.length === 0 ? (
                  <div className="text-muted small p-2">
                    لا توجد إشعارات أخرى.
                  </div>
                ) : (
                  viewModel.items.map((n) => {
                    const sender = n.sender;
                    const when = fmtDateTime(n.createdAt);
                    const typeText = typeLabelAr(n);
                    const catText = categoryLabelAr(n);
                    const ids = extractIds(n);
                    const canDetail = !!(
                      ids.requestId ||
                      ids.donationEntityId ||
                      ids.confirmationId ||
                      ids.requestConfId
                    );

                    return (
                      <ListGroup.Item
                        key={n._id}
                        className={`notification-item compact shadow-sm rounded ${
                          !n.read ? 'unread' : ''
                        }`}
                        onClick={() => openDetails(n)}
                      >
                        <div className="item-wrap">
                          <Image
                            src={resolveAvatar(
                              sender?.profileImage,
                            )}
                            onError={(e) => {
                              e.currentTarget.src =
                                '/default-avatar.png';
                            }}
                            roundedCircle
                            width={34}
                            height={34}
                            alt="sender"
                          />
                          <div className="grow">
                            <div className="row-1">
                              <div className="title">
                                <span className="chip-type">
                                  {typeText}
                                </span>
                                {catText && (
                                  <span className="chip-cat">
                                    {catText}
                                  </span>
                                )}
                              </div>
                              <div className="date">{when}</div>
                            </div>
                            <div className="row-2">
                              <div className="msg line-2">
                                {n.message || n.title || '—'}
                              </div>
                              {canDetail && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="btn-details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetails(n);
                                  }}
                                >
                                  تفاصيل
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            </>
          )}

          {/* وضع: رسائل فقط */}
          {viewModel.mode === 'messageOnly' && (
            <>
              <h6 className="section-heading">المحادثات</h6>
              <ListGroup className="notification-list">
                {viewModel.threads.length === 0 ? (
                  <div className="text-muted small p-2">
                    لا توجد رسائل.
                  </div>
                ) : (
                  viewModel.threads.map((th) => (
                    <ListGroup.Item
                      key={th.senderId}
                      className={`notification-item compact thread-item shadow-sm rounded ${
                        th.unreadCount > 0 ? 'unread' : ''
                      }`}
                      onClick={() => openChat(th)}
                    >
                      <div className="item-wrap">
                        <Image
                          src={resolveAvatar(
                            th.sender?.profileImage,
                          )}
                          onError={(e) => {
                            e.currentTarget.src =
                              '/default-avatar.png';
                          }}
                          roundedCircle
                          width={40}
                          height={40}
                          alt="sender"
                        />
                        <div className="grow">
                          <div className="row-1">
                            <div className="title message">
                              💬{' '}
                              {th.sender
                                ? `${th.sender.firstName || ''} ${
                                    th.sender.lastName || ''
                                  }`.trim()
                                : 'مستخدم'}
                            </div>
                            {th.unreadCount > 0 && (
                              <Badge bg="primary" pill>
                                {th.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="row-2">
                            <div className="msg text-truncate">
                              {th.lastMessage || '—'}
                            </div>
                            <div className="date">
                              {fmtDateTime(th.lastCreatedAt)}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChat(th);
                          }}
                        >
                          فتح
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </>
          )}

          {/* وضع: إشعارات بدون رسائل (حسب الفلتر) */}
          {viewModel.mode === 'othersOnly' && (
            <>
              <h6 className="section-heading">إشعارات</h6>
              <ListGroup className="notification-list">
                {viewModel.items.length === 0 ? (
                  <div className="text-muted small p-2">
                    لا توجد إشعارات.
                  </div>
                ) : (
                  viewModel.items.map((n) => {
                    const sender = n.sender;
                    const when = fmtDateTime(n.createdAt);
                    const typeText = typeLabelAr(n);
                    const catText = categoryLabelAr(n);
                    const ids = extractIds(n);
                    const canDetail = !!(
                      ids.requestId ||
                      ids.donationEntityId ||
                      ids.confirmationId ||
                      ids.requestConfId
                    );

                    return (
                      <ListGroup.Item
                        key={n._id}
                        className={`notification-item compact shadow-sm rounded ${
                          !n.read ? 'unread' : ''
                        }`}
                        onClick={() => openDetails(n)}
                      >
                        <div className="item-wrap">
                          <Image
                            src={resolveAvatar(
                              sender?.profileImage,
                            )}
                            onError={(e) => {
                              e.currentTarget.src =
                                '/default-avatar.png';
                            }}
                            roundedCircle
                            width={34}
                            height={34}
                            alt="sender"
                          />
                          <div className="grow">
                            <div className="row-1">
                              <div className="title">
                                <span className="chip-type">
                                  {typeText}
                                </span>
                                {catText && (
                                  <span className="chip-cat">
                                    {catText}
                                  </span>
                                )}
                              </div>
                              <div className="date">{when}</div>
                            </div>
                            <div className="row-2">
                              <div className="msg line-2">
                                {n.message || n.title || '—'}
                              </div>
                              {canDetail && (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="btn-details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDetails(n);
                                  }}
                                >
                                  تفاصيل
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })
                )}
              </ListGroup>
            </>
          )}
        </>
      )}

      {/* أسهم لأعلى/لأسفل */}
      <div className="page-fabs" dir="ltr">
        <button
          className="fab-btn"
          title="للأعلى"
          type="button"
          onClick={scrollToTop}
        >
          ▲
        </button>
        <button
          className="fab-btn"
          title="للأسفل"
          type="button"
          onClick={scrollToBottom}
        >
          ▼
        </button>
      </div>
    </div>
  );
}

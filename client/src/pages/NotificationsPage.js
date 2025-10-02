import React, { useEffect, useMemo, useState, useCallback } from 'react';
import fetchWithInterceptors from '../services/fetchWithInterceptors';
import { ListGroup, Dropdown, Button, Image, Badge, Spinner } from '../components/ui';
import './NotificationsPage.css';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

const API_BASE =
  process.env.REACT_APP_API_ORIGIN ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5000';

/* ✅ مسارات التفاصيل — متوافقة مع App.js لديك */
const BLOOD_REQUEST_ROUTE            = process.env.REACT_APP_BLOOD_DETAILS_ROUTE              || '/blood-donation-details';
const GENERAL_REQUEST_ROUTE          = process.env.REACT_APP_DONATION_DETAILS_ROUTE           || '/donations';
const DONATION_CONFIRM_ROUTE         = process.env.REACT_APP_DONATION_CONFIRMATION_ROUTE      || '/donation-confirmations';
const DONATION_ENTITY_ROUTE          = process.env.REACT_APP_DONATION_ENTITY_ROUTE            || '/donation-details';
const DONATION_REQUEST_CONFIRM_ROUTE = process.env.REACT_APP_DONATION_REQUEST_CONFIRM_ROUTE   || '/donation-request-confirmations';

const resolveAvatar = (p) => {
  if (!p) return '/default-avatar.png';
  if (/^https?:\/\//i.test(p)) return p;
  const path = p.startsWith('/uploads/') ? p : `/uploads/profileImages/${p}`;
  return `${API_BASE}${path}`.replace(/([^:]\/)\/+/g, '$1');
};

const fmtDateTime = (s) =>
  s
    ? new Date(s).toLocaleString('ar-MA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '' ;

/* ====== تسميات عربية مختصرة ====== */
const typeLabelAr = (n) => {
  const key = (n?.meta?.event || n?.event || n?.type || n?.meta?.type || 'general').toLowerCase();
  const map = {
    message: 'رسالة جديدة',
    offer: 'عرض تبرع',
    donation: 'تبرع',
    general: 'إشعار',
    system: 'نظام',
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

/* 🔎 هل الإشعار عن "طلب دم"؟ (صارم) */
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

/* شارة الطبيعة */
const categoryLabelAr = (n) => {
  if (isBloodStrict(n)) return 'تبرع بالدم';
  const m = n?.meta || {};
  const kind = (m.requestType || m.kind || m.category || '').toString().toLowerCase();
  const map = { money: 'تبرع مالي', financial: 'تبرع مالي', goods: 'تبرع عيني', material: 'تبرع عيني', health: 'الصحة' };
  return map[kind] || (m.requestType || m.kind || m.category || '');
};

/* 📦 استخراج كل المعرّفات المحتملة من الإشعار */
const extractIds = (n) => {
  const m = n?.meta || {};

  // معرّف "الطلب"
  const requestId =
    m.requestId ||
    m.donationRequestId ||
    m.bloodRequestId ||
    n?.requestId ||
    n?.request?._id ||
    null;

  // معرّف "التبرع ككيان" (تفاصيل التبرع العام)
  const donationEntityId =
    m.donationId ||
    m.donation?._id ||
    null;

  // معرّف "تأكيد/عرض التبرع"
  const confirmationId =
    m.confirmationId ||
    m.donationConfirmationId ||
    m.offerId ||
    n?.referenceId ||   // 🟢 مهم جداً مع إشعارات fulfilled/rated
    m.id ||
    null;

  // معرّف "تأكيد طلب التبرع"
  const requestConfId =
    m.requestConfirmationId ||
    m.donationRequestConfirmationId ||
    m.reqConfirmationId ||
    null;

  return { requestId, donationEntityId, confirmationId, requestConfId };
};

/* 🧭 هل الإشعار عن تأكيد/عرض (وليس كيان تبرع عام)؟ */
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
  return keys.some(k => t.includes(k) || entity.includes(k));
};

/* 🧭 هل الإشعار عن "تأكيد طلب تبرع"؟ */
const isDonationRequestConfirmation = (n) => {
  const m = n?.meta || {};
  const t = (n?.type || m.type || m.event || '').toLowerCase();
  return t.includes('donation_request_confirmation');
};

/* 🧭 تحديد الوجهة */
const buildNavigateTarget = (n) => {
  const { requestId, donationEntityId, confirmationId, requestConfId } = extractIds(n);
  const t = (n?.type || n?.meta?.type || '').toLowerCase();

  // 1) إشعار حول "طلب"
  if (requestId) {
    const base = isBloodStrict(n) ? BLOOD_REQUEST_ROUTE : GENERAL_REQUEST_ROUTE;
    return `${base}/${requestId}`;
  }

  // 2) إشعار حول "تأكيد طلب تبرع" — استخدم requestConfId أو referenceId
  if (isDonationRequestConfirmation(n) && (requestConfId || confirmationId)) {
    const id = requestConfId || confirmationId;
    return `${DONATION_REQUEST_CONFIRM_ROUTE}/${id}`;
  }

  // 3) إشعار حول "تأكيد/عرض/تنفيذ/تقييم التبرع"
  if (isDonationConfirmation(n) && confirmationId) {
    return `${DONATION_CONFIRM_ROUTE}/${confirmationId}`;
  }

  // 4) إشعار حول "كيان تبرع عام"
  if (donationEntityId) {
    return `${DONATION_ENTITY_ROUTE}/${donationEntityId}`;
  }

  // لا يوجد ما نفتح له تفاصيل
  return null;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // فلتر محفوظ
  const initialFilter = searchParams.get('filter') || sessionStorage.getItem('notifFilter') || 'all';
  const [filter, setFilter] = useState(initialFilter);
  const setFilterPersist = useCallback((val) => {
    setFilter(val);
    sessionStorage.setItem('notifFilter', val);
    const next = new URLSearchParams(searchParams);
    next.set('filter', val);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchWithInterceptors('/api/notifications');
      if (res.ok) setNotifications(res.body?.data || res.body || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try { await fetchWithInterceptors(`/api/notifications/${id}/read`, { method: 'PATCH' }); } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const t = setInterval(fetchNotifications, 30000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  /* ===== تجميع رسائل المحادثات كـ Threads ===== */
  const { messageThreads, others } = useMemo(() => {
    const threadsMap = new Map(); const rest = [];
    (notifications || []).forEach((n) => {
      if ((n.type || 'system') !== 'message') { rest.push(n); return; }

      const senderId = n.sender?._id || n.senderId || n.meta?.senderId || 'unknown';
      const entry = threadsMap.get(senderId) || {
        senderId, sender: n.sender || null, ids: [], unreadCount: 0, lastMessage: '', lastCreatedAt: 0,
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

    const messageThreadsArr = Array.from(threadsMap.values()).sort((a,b) => b.lastCreatedAt - a.lastCreatedAt);
    return { messageThreads: messageThreadsArr, others: rest };
  }, [notifications]);

  /* عدّادات للفلاتر */
  const counts = useMemo(() => {
    const unreadAll = notifications.filter(n => !n.read).length;
    const msg      = notifications.filter(n => (n.type || 'system') === 'message').length;
    const offer    = notifications.filter(n => (n.type || 'system') === 'offer').length;
    const system   = notifications.filter(n => (n.type || 'system') === 'system').length;
    const donation = notifications.filter(n => (n.type || 'system') === 'donation').length;
    const general  = notifications.filter(n => (n.type || 'system') === 'general').length;
    return { unreadAll, msg, offer, system, donation, general, all: notifications.length };
  }, [notifications]);

  /* الفيو حسب الفلتر */
  const viewModel = useMemo(() => {
    if (filter === 'message') return { mode: 'messageOnly', threads: messageThreads, items: [] };
    if (['offer','system','donation','general'].includes(filter)) {
      const items = (others || []).filter(n => (n.type || 'system') === filter);
      return { mode: 'othersOnly', threads: [], items };
    }
    return { mode: 'all', threads: messageThreads, items: others };
  }, [filter, messageThreads, others]);

  /* فتح محادثة */
  const openChat = async (thread) => {
    if (!thread?.senderId || thread.senderId === 'unknown') return;
    await Promise.all(thread.ids.map(id => markAsRead(id)));
    navigate(`/chat/${thread.senderId}`, { state: { from: location.pathname + location.search } });
    fetchNotifications();
  };

  /* فتح تفاصيل (طلب/تبرع/تأكيد) */
  const openDetails = async (n) => {
    if (!n.read) { await markAsRead(n._id); fetchNotifications(); }
    const route = buildNavigateTarget(n);
    if (route) navigate(route, { state: { from: location.pathname + location.search } });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  return (
    <div className="container-notifications">
      <div className="notif-header sticky">
        <h3 className="m-0 fw-bold text-secondary">🔔 جميع الإشعارات</h3>

        <div className="toolbar">
          {/* فلتر */}
          <div className="toolbar-filter">
            <Dropdown className="filter-notifications-dropdown">
              <Dropdown.Toggle className="dropdown-toggle-clean" variant="light" id="filter-dropdown">
                {filter === 'all'
                  ? `تصفية: الكل (${counts.all})`
                  : filter === 'message'
                  ? `تصفية: رسائل (${counts.msg})`
                  : filter === 'offer'
                  ? `تصفية: عروض (${counts.offer})`
                  : filter === 'system'
                  ? `تصفية: نظام (${counts.system})`
                  : filter === 'donation'
                  ? `تصفية: تبرعات (${counts.donation})`
                  : `تصفية: عام (${counts.general})`}
                {counts.unreadAll > 0 && <Badge bg="primary" className="ms-2">{counts.unreadAll}</Badge>}
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu">
                <Dropdown.Item onClick={() => setFilterPersist('all')}>الكل ({counts.all})</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterPersist('message')}>رسائل ({counts.msg})</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterPersist('offer')}>عروض ({counts.offer})</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterPersist('donation')}>تبرعات ({counts.donation})</Dropdown.Item>
                <Dropdown.Item onClick={() => setFilterPersist('general')}>عام ({counts.general})</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => setFilterPersist('system')}>نظام ({counts.system})</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* زر تحديث */}
          <div className="toolbar-actions">
            <Button className="btn-soft" onClick={fetchNotifications}>
              <span className="icon">🔄</span> تحديث
            </Button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-4 text-center text-muted">
          <Spinner animation="border" size="sm" /> جاري التحميل...
        </div>
      )}

      {!loading && (
        <>
          {/* وضع: الكل */}
          {viewModel.mode === 'all' && (
            <>
              <h6 className="section-heading">الرسائل</h6>
              <ListGroup className="notification-list">
                {viewModel.threads.length === 0 ? (
                  <div className="text-muted small p-2">لا توجد رسائل.</div>
                ) : (
                  viewModel.threads.map((th) => (
                    <ListGroup.Item
                      key={th.senderId}
                      className={`notification-item compact thread-item shadow-sm rounded ${th.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => openChat(th)}
                    >
                      <div className="item-wrap">
                        <Image src={resolveAvatar(th.sender?.profileImage)} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} roundedCircle width={40} height={40} alt="sender" />
                        <div className="grow">
                          <div className="row-1">
                            <div className="title message">💬 {th.sender ? `${th.sender.firstName || ''} ${th.sender.lastName || ''}`.trim() : 'مستخدم'}</div>
                            {th.unreadCount > 0 && <Badge bg="primary" pill>{th.unreadCount}</Badge>}
                          </div>
                          <div className="row-2">
                            <div className="msg text-truncate">{th.lastMessage || '—'}</div>
                            <div className="date">{fmtDateTime(th.lastCreatedAt)}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); openChat(th); }}>فتح</Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>

              <h6 className="section-heading mt-3">إشعارات أخرى</h6>
              <ListGroup className="notification-list">
                {viewModel.items.length === 0 ? (
                  <div className="text-muted small p-2">لا توجد إشعارات أخرى.</div>
                ) : (
                  viewModel.items.map((n) => {
                    const sender = n.sender;
                    const when = fmtDateTime(n.createdAt);
                    const typeText = typeLabelAr(n);
                    const catText = categoryLabelAr(n);
                    const ids = extractIds(n);
                    const canDetail = !!(ids.requestId || ids.donationEntityId || ids.confirmationId || ids.requestConfId);

                    return (
                      <ListGroup.Item
                        key={n._id}
                        className={`notification-item compact shadow-sm rounded ${!n.read ? 'unread' : ''}`}
                        onClick={() => openDetails(n)}
                      >
                        <div className="item-wrap">
                          <Image src={resolveAvatar(sender?.profileImage)} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} roundedCircle width={38} height={38} alt="sender" />
                          <div className="grow">
                            <div className="row-1">
                              <div className="title">
                                <span className="chip-type">{typeText}</span>
                                {catText && <span className="chip-cat">{catText}</span>}
                              </div>
                              <div className="date">{when}</div>
                            </div>
                            <div className="row-2">
                              <div className="msg line-2">{n.message || n.title || '—'}</div>
                              {canDetail && (
                                <Button variant="outline-secondary" size="sm" className="btn-details"
                                  onClick={(e) => { e.stopPropagation(); openDetails(n); }}>
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
              <h6 className="section-heading">الرسائل</h6>
              <ListGroup className="notification-list">
                {viewModel.threads.length === 0 ? (
                  <div className="text-muted small p-2">لا توجد رسائل.</div>
                ) : (
                  viewModel.threads.map((th) => (
                    <ListGroup.Item
                      key={th.senderId}
                      className={`notification-item compact thread-item shadow-sm rounded ${th.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => openChat(th)}
                    >
                      <div className="item-wrap">
                        <Image src={resolveAvatar(th.sender?.profileImage)} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} roundedCircle width={40} height={40} alt="sender" />
                        <div className="grow">
                          <div className="row-1">
                            <div className="title message">💬 {th.sender ? `${th.sender.firstName || ''} ${th.sender.lastName || ''}`.trim() : 'مستخدم'}</div>
                            {th.unreadCount > 0 && <Badge bg="primary" pill>{th.unreadCount}</Badge>}
                          </div>
                          <div className="row-2">
                            <div className="msg text-truncate">{th.lastMessage || '—'}</div>
                            <div className="date">{fmtDateTime(th.lastCreatedAt)}</div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline-primary" onClick={(e) => { e.stopPropagation(); openChat(th); }}>فتح</Button>
                      </div>
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            </>
          )}

          {/* وضع: إشعارات أخرى فقط */}
          {viewModel.mode === 'othersOnly' && (
            <>
              <h6 className="section-heading">إشعارات</h6>
              <ListGroup className="notification-list">
                {viewModel.items.length === 0 ? (
                  <div className="text-muted small p-2">لا توجد إشعارات.</div>
                ) : (
                  viewModel.items.map((n) => {
                    const sender = n.sender;
                    const when = fmtDateTime(n.createdAt);
                    const typeText = typeLabelAr(n);
                    const catText = categoryLabelAr(n);
                    const ids = extractIds(n);
                    const canDetail = !!(ids.requestId || ids.donationEntityId || ids.confirmationId || ids.requestConfId);

                    return (
                      <ListGroup.Item
                        key={n._id}
                        className={`notification-item compact shadow-sm rounded ${!n.read ? 'unread' : ''}`}
                        onClick={() => openDetails(n)}
                      >
                        <div className="item-wrap">
                          <Image src={resolveAvatar(sender?.profileImage)} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} roundedCircle width={38} height={38} alt="sender" />
                          <div className="grow">
                            <div className="row-1">
                              <div className="title">
                                <span className="chip-type">{typeText}</span>
                                {catText && <span className="chip-cat">{catText}</span>}
                              </div>
                              <div className="date">{when}</div>
                            </div>
                            <div className="row-2">
                              <div className="msg line-2">{n.message || n.title || '—'}</div>
                              {canDetail && (
                                <Button variant="outline-secondary" size="sm" className="btn-details"
                                  onClick={(e) => { e.stopPropagation(); openDetails(n); }}>
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

      {/* أسهم الصعود/الهبوط */}
      <div className="page-fabs" dir="ltr">
        <button className="fab-btn" title="للأعلى" onClick={scrollToTop}>▲</button>
        <button className="fab-btn" title="للأسفل" onClick={scrollToBottom}>▼</button>
      </div>
    </div>
  );
}
